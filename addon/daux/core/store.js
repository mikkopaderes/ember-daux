import { denormalize, normalize } from './normalizer';
import Batch from './batch';
import getCardinality from '../utils/get-cardinality';
import getDefaultRecord from '../utils/get-default-record';

/**
 * @class Store
 * @namespace Daux.Core
 */
export default class Store {
  /**
   * @callback fetch
   * @return {Promise} Resolves with the records
   */

  /**
   * @param {Object} model
   * @function
   */
  constructor(model) {
    this.model = model;
    this.state = this.buildInitialState();
    this.subscriptions = [];
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @param {Object} [option={}]
   * @function
   */
  add(type, record, option = {}) {
    const normalizedRecord = normalize(this.model, type, record);
    const cachedRecord = this.getCachedRecord(type, normalizedRecord.id) || {};

    this.state[type].data[normalizedRecord.id] = Object.assign(normalizedRecord, cachedRecord);

    this.syncAddedRelationships(type, record);

    if (!option.isBackgroundOperation) {
      this.subscriptions.forEach(subscription => subscription());
    }
  }

  /**
   * @param {string} type
   * @param {Array.<Object>} records
   * @param {Object} [option={}]
   * @function
   */
  set(type, records, option = {}) {
    records.forEach((record) => {
      const normalizedRecord = normalize(this.model, type, record);

      this.state[type].data[normalizedRecord.id] = normalizedRecord;

      this.syncAddedRelationships(type, record);

      if (!option.isBackgroundOperation) {
        this.subscriptions.forEach(subscription => subscription());
      }
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attribute
   * @param {Object} [option={}]
   * @function
   */
  update(type, id, attribute, option = {}) {
    const cachedRecord = this.getCachedRecord(type, id);

    if (cachedRecord) {
      const updatedRecord = Object.assign({}, cachedRecord, attribute);
      const normalizedRecord = normalize(this.model, type, updatedRecord);

      this.state[type].data[id] = normalizedRecord;

      this.syncAddedRelationships(type, normalizedRecord);
      this.syncRemovedRelationships(
        type,
        normalizedRecord,
        normalize(this.model, type, cachedRecord),
      );

      if (!option.isBackgroundOperation) {
        this.subscriptions.forEach(subscription => subscription());
      }
    } else {
      throw new Error('Record doesn\'t exist');
    }
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} [option={}]
   * @function
   */
  delete(type, id, option = {}) {
    const cachedRecord = this.getCachedRecord(type, id);

    if (cachedRecord) {
      delete this.state[type].data[id];

      this.syncRemovedRelationships(
        type,
        getDefaultRecord(this, type),
        normalize(this.model, type, cachedRecord),
      );

      if (!option.isBackgroundOperation) {
        this.subscriptions.forEach(subscription => subscription());
      }
    } else {
      throw new Error('Record doesn\'t exist');
    }
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {fetch} [fetch]
   * @return {Object} Record
   * @function
   */
  get(type, id, fetch) {
    if (this.state[type].data[id]) {
      return denormalize(this, type, id);
    }

    if (fetch) {
      return fetch().then((record) => {
        this.add(type, record, { isBackgroundOperation: true });

        return denormalize(this, type, id);
      });
    }

    return null;
  }

  /**
   * @param {string} type
   * @param {fetch} [fetch]
   * @return {Array.<Object>} Records
   * @function
   */
  getAll(type, fetch) {
    if (fetch && !this.state[type].isDataComplete) {
      return fetch().then((records) => {
        this.set(type, records, { isBackgroundOperation: true });

        return Object.keys(this.state[type].data).map(id => this.get(type, id));
      });
    }

    this.state[type].isDataComplete = true;

    return Object.keys(this.state[type].data).map(id => this.get(type, id));
  }

  /**
   * @param {string} type
   * @param {fetch} fetch
   * @return {Array.<Object>} Records
   * @function
   */
  query(type, fetch) {
    return fetch().then((records) => {
      records.forEach(record => this.add(type, record, { isBackgroundOperation: true }));

      return records.map(record => this.get(type, record.id));
    });
  }

  /**
   * @callback subscriptionCallback
   */

  /**
   * @param {subscriptionCallback} callback
   * @return {Function} Unsubscribe function
   * @function
   */
  subscribe(callback) {
    this.subscriptions.push(callback);

    return () => {
      this.subscriptions = this.subscriptions.filter(subscription => subscription !== callback);
    };
  }

  /**
   * @return {Daux.Core.Batch} Batch instance
   * @function
   */
  batch() {
    return new Batch(this);
  }

  /**
   * @return {Object} State
   * @private
   * @function
   */
  buildInitialState() {
    const { model } = this;
    const state = {};

    Object.keys(model).forEach((modelKey) => {
      state[modelKey] = {
        isDataComplete: false,
        data: {},
      };
    });

    return state;
  }

  /**
   * @param {string} type
   * @param {string} id
   * @return {Object} Cached record
   * @private
   * @function
   */
  getCachedRecord(type, id) {
    return this.state[type].data[id] || null;
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @param {string} belongsToAttribute
   * @private
   * @function
   */
  syncAddedBelongsTo(type, record, belongsToAttribute) {
    const cardinality = getCardinality(this.model, type, belongsToAttribute);
    const descriptor = this.model[type].relationship[belongsToAttribute];
    let recordToSync;

    if (typeof record[belongsToAttribute] === 'object' && record[belongsToAttribute] !== null) {
      recordToSync = record[belongsToAttribute];
    } else {
      recordToSync = { id: record[belongsToAttribute] };
    }

    if (cardinality === 'oneToOne') {
      const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id);

      if (!cachedRecord || !cachedRecord[descriptor.inverse]) {
        const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: record.id });

        this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
      }
    } else if (cardinality === 'oneToMany') {
      const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id);

      if (!cachedRecord) {
        const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: [record.id] });

        this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
      } else if (!cachedRecord[descriptor.inverse].find(id => id === record.id)) {
        cachedRecord[descriptor.inverse].push(record.id);
      }
    } else {
      const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id) || {};
      const newRecord = Object.assign(cachedRecord, recordToSync);

      this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
    }
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @param {string} hasManyAttribute
   * @private
   * @function
   */
  syncAddedHasMany(type, record, hasManyAttribute) {
    const recordsToSync = record[hasManyAttribute];

    if (Array.isArray(recordsToSync)) {
      recordsToSync.forEach((item) => {
        const cardinality = getCardinality(this.model, type, hasManyAttribute);
        const descriptor = this.model[type].relationship[hasManyAttribute];
        let recordToSync;

        if (typeof item === 'object' && item !== null) {
          recordToSync = item;
        } else {
          recordToSync = { id: item };
        }

        if (cardinality === 'oneToMany') {
          const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id);

          if (!cachedRecord) {
            const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: record.id });

            this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
          } else {
            cachedRecord[descriptor.inverse] = record.id;
          }
        } else if (cardinality === 'manyToMany') {
          const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id);

          if (!cachedRecord) {
            const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: [record.id] });

            this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
          } else if (!cachedRecord[descriptor.inverse].find(id => id === record.id)) {
            cachedRecord[descriptor.inverse].push(record.id);
          }
        } else {
          const cachedRecord = this.getCachedRecord(descriptor.type, recordToSync.id) || {};
          const newRecord = Object.assign(cachedRecord, recordToSync);

          this.add(descriptor.type, newRecord, { isBackgroundOperation: true });
        }
      });
    }
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @param {string} hasManyAttribute
   * @private
   * @function
   */
  syncExistingHasMany(type, record, hasManyAttribute) {
    const cardinality = getCardinality(this.model, type, hasManyAttribute);
    const descriptor = this.model[type].relationship[hasManyAttribute];
    const inverseData = this.state[descriptor.type].data;
    const recordId = typeof record === 'object' && record !== null ? record.id : record;

    if (cardinality === 'oneToMany') {
      const currentHasManyState = this.state[type].data[recordId][hasManyAttribute];
      const inverseIds = Object.keys(this.state[descriptor.type].data).filter(id => (
        inverseData[id][descriptor.inverse] === recordId
      ));

      inverseIds.forEach((id) => {
        if (!currentHasManyState.includes(id)) {
          currentHasManyState.push(id);
        }
      });
    } else if (cardinality === 'manyToMany') {
      const currentHasManyState = this.state[type].data[recordId][hasManyAttribute];
      const inverseIds = Object.keys(this.state[descriptor.type].data).filter(id => (
        inverseData[id][descriptor.inverse].includes(recordId)
      ));

      inverseIds.forEach((id) => {
        if (!currentHasManyState.includes(id)) {
          currentHasManyState.push(id);
        }
      });
    }
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @private
   * @function
   */
  syncAddedRelationships(type, record) {
    const { model } = this;
    const modelForType = model[type];
    const { relationship: relationshipForType } = modelForType;

    Object.keys(relationshipForType).forEach((attributeKey) => {
      if (record[attributeKey]) {
        if (relationshipForType[attributeKey].kind === 'belongsTo') {
          this.syncAddedBelongsTo(type, record, attributeKey);
        } else {
          this.syncAddedHasMany(type, record, attributeKey);
        }
      } else if (relationshipForType[attributeKey].kind === 'hasMany') {
        this.syncExistingHasMany(type, record, attributeKey);
      }
    });
  }

  /**
   * @param {Object} descriptor
   * @return {Object|null} Relationship inverse descriptor
   * @private
   * @function
   */
  getRelationshipInverseDescriptor(descriptor) {
    if (descriptor.inverse) {
      const model = this.model[descriptor.type];

      return model.relationship[descriptor.inverse];
    }

    return null;
  }

  /**
   * @param {string} type
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @param {string} key
   * @param {Object} descriptor
   * @private
   * @function
   */
  syncRemovedBelongsToRelationship(type, currentRecord, oldRecord, key, descriptor) {
    if (currentRecord[key] === null && currentRecord[key] !== oldRecord[key]) {
      const inverseRecord = this.getCachedRecord(descriptor.type, oldRecord[key]);

      if (inverseRecord) {
        const cardinality = getCardinality(this.model, type, key);

        if (cardinality === 'oneToOne') {
          inverseRecord[descriptor.inverse] = null;
        } else if (cardinality === 'oneToMany') {
          inverseRecord[descriptor.inverse] = inverseRecord[descriptor.inverse].filter(id => (
            id !== oldRecord.id
          ));
        }
      }
    }
  }

  /**
   * @param {string} type
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @param {string} key
   * @param {Object} descriptor
   * @private
   * @function
   */
  syncRemovedHasManyRelationship(type, currentRecord, oldRecord, key, descriptor) {
    const removedRecords = oldRecord[key].filter(record => !currentRecord[key].includes(record));

    removedRecords.forEach((removedRecord) => {
      const inverseRecord = this.getCachedRecord(descriptor.type, removedRecord);

      if (inverseRecord) {
        const cardinality = getCardinality(this.model, type, key);

        if (cardinality === 'oneToMany') {
          inverseRecord[descriptor.inverse] = null;
        } else if (cardinality === 'manyToMany') {
          inverseRecord[descriptor.inverse] = inverseRecord[descriptor.inverse].filter(id => (
            id !== oldRecord.id
          ));
        }
      }
    });
  }

  /**
   * @param {string} type
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @private
   * @function
   */
  syncRemovedRelationships(type, currentRecord, oldRecord) {
    const model = this.model[type];

    Object.keys(model.relationship).forEach((attributeKey) => {
      const descriptor = model.relationship[attributeKey];

      if (descriptor.kind === 'belongsTo') {
        this.syncRemovedBelongsToRelationship(
          type,
          currentRecord,
          oldRecord,
          attributeKey,
          descriptor,
        );
      } else if (descriptor.kind === 'hasMany') {
        this.syncRemovedHasManyRelationship(
          type,
          currentRecord,
          oldRecord,
          attributeKey,
          descriptor,
        );
      }
    });
  }
}
