import Batch from './batch';
import getCardinality from '../utils/get-cardinality';
import getDefaultRecord from '../utils/get-default-record';
import normalize from '../utils/normalize';

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
  set(type, record, option = {}) {
    if (record.id) {
      const modelForType = this.model[type];
      const deserializedRecord = option.isDeserialized ? record : modelForType.deserialize(record);
      const normalizedRecord = normalize(modelForType, deserializedRecord);

      this.state[type].data[normalizedRecord.id] = normalizedRecord;

      this.syncAddedRelationships(type, deserializedRecord);

      if (!option.isBackgroundOperation) {
        this.subscriptions.forEach(subscription => subscription());
      }
    } else {
      throw new Error('Record to set has no ID');
    }
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attribute
   * @param {Object} [option={}]
   * @function
   */
  update(type, id, attribute, option = {}) {
    const cachedRecord = this.getStateForRecord(type, id);

    if (cachedRecord) {
      const modelForType = this.model[type];
      const updatedRecord = modelForType.deserialize(Object.assign(
        {},
        cachedRecord,
        attribute,
        { id },
      ));

      this.set(type, updatedRecord, { isBackgroundOperation: true, isDeserialized: true });
      this.syncRemovedRelationships(type, updatedRecord, cachedRecord);

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
    const cachedRecord = this.getStateForRecord(type, id);

    if (cachedRecord) {
      const modelForType = this.model[type];
      const defaultRecord = getDefaultRecord(modelForType, type);

      this.update(type, id, defaultRecord, { isBackgroundOperation: true });
      delete this.state[type].data[id];

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
    if (!this.isRecordAttributePopulated(type, id) && fetch) {
      return fetch().then((record) => {
        this.set(type, record, { isBackgroundOperation: true });

        return this.getCachedRecord(type, id);
      });
    }

    return this.getCachedRecord(type, id);
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
        records.forEach(record => this.set(type, record, { isBackgroundOperation: true }));

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
      records.forEach(record => this.set(type, record, { isBackgroundOperation: true }));

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
   * @param {number} [nestLevel=0]
   * @return {Object} State for record
   * @private
   * @function
   */
  getCachedRecord(type, id, nestLevel = 0) {
    if (this.state[type].data[id]) {
      const cachedRecord = Object.assign({}, this.state[type].data[id]);
      const modelForType = this.model[type];

      Object.keys(modelForType.relationship).forEach((relationshipKey) => {
        const descriptor = modelForType.relationship[relationshipKey];

        if (descriptor.kind === 'belongsTo' && cachedRecord[relationshipKey]) {
          const belongsToId = cachedRecord[relationshipKey];

          if (nestLevel < 1) {
            cachedRecord[relationshipKey] = this.getCachedRecord(
              descriptor.type,
              belongsToId,
              nestLevel + 1,
            );
          } else {
            cachedRecord[relationshipKey] = Object.assign(
              {},
              this.state[descriptor.type].data[belongsToId],
            );
          }
        } else if (descriptor.kind === 'hasMany' && cachedRecord[relationshipKey].length > 0) {
          cachedRecord[relationshipKey] = cachedRecord[relationshipKey].map((hasManyId) => {
            if (nestLevel < 1) {
              return this.getCachedRecord(
                descriptor.type,
                hasManyId,
                nestLevel + 1,
              );
            }

            return Object.assign({}, this.state[descriptor.type].data[hasManyId]);
          });
        }
      });

      return cachedRecord;
    }

    return null;
  }

  /**
   * @param {string} type
   * @param {string} id
   * @return {Object} State for record
   * @private
   * @function
   */
  getStateForRecord(type, id) {
    return this.state[type].data[id] || null;
  }

  /**
   * @param {string} type
   * @param {string} id
   * @return {boolean} True if populated. Otherwise, false.
   * @private
   * @function
   */
  isRecordAttributePopulated(type, id) {
    const currentRecordState = this.getStateForRecord(type, id);

    if (currentRecordState) {
      const { attributes } = this.model[type];
      const populatedAttribute = attributes.find((key) => {
        if (
          currentRecordState[key] === null
          || (Array.isArray(currentRecordState[key]) && currentRecordState[key].length === 0)
        ) {
          return false;
        }

        return true;
      });

      return populatedAttribute;
    }

    return false;
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
      recordToSync = this.model[descriptor.type].deserialize(record[belongsToAttribute]);
    } else {
      recordToSync = { id: record[belongsToAttribute] };
    }

    if (cardinality === 'oneToOne') {
      const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id);

      if (!cachedRecord || !cachedRecord[descriptor.inverse]) {
        const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: record.id });

        this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
      }
    } else if (cardinality === 'oneToMany') {
      const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id);

      if (!cachedRecord) {
        const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: [record.id] });

        this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
      } else if (!cachedRecord[descriptor.inverse].find(id => id === record.id)) {
        cachedRecord[descriptor.inverse].push(record.id);
      }
    } else {
      const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id) || {};
      const newRecord = Object.assign(cachedRecord, recordToSync);

      this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
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
          recordToSync = this.model[descriptor.type].deserialize(item);
        } else {
          recordToSync = { id: item };
        }

        if (cardinality === 'oneToMany') {
          const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id);

          if (!cachedRecord) {
            const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: record.id });

            this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
          } else {
            cachedRecord[descriptor.inverse] = record.id;
          }
        } else if (cardinality === 'manyToMany') {
          const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id);

          if (!cachedRecord) {
            const newRecord = Object.assign(recordToSync, { [descriptor.inverse]: [record.id] });

            this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
          } else if (!cachedRecord[descriptor.inverse].find(id => id === record.id)) {
            cachedRecord[descriptor.inverse].push(record.id);
          }
        } else {
          const cachedRecord = this.getStateForRecord(descriptor.type, recordToSync.id) || {};
          const newRecord = Object.assign(cachedRecord, recordToSync);

          this.set(descriptor.type, newRecord, { isBackgroundOperation: true });
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
    Object.keys(this.model[type].relationship).forEach((relationshipKey) => {
      const { kind } = this.model[type].relationship[relationshipKey];

      if (record[relationshipKey]) {
        if (kind === 'belongsTo') {
          this.syncAddedBelongsTo(type, record, relationshipKey);
        } else {
          this.syncAddedHasMany(type, record, relationshipKey);
        }
      } else if (kind === 'hasMany') {
        this.syncExistingHasMany(type, record, relationshipKey);
      }
    });
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
      const inverseRecord = this.getStateForRecord(descriptor.type, oldRecord[key]);

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
      const inverseRecord = this.getStateForRecord(descriptor.type, removedRecord);

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
