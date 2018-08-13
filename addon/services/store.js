import { getOwner } from '@ember/application';
import Service from '@ember/service';

import Batch from 'ember-daux/utils/batch';
import normalize from 'ember-daux/utils/normalize';

/**
 * @class Store
 * @namespace Service
 * @extends Ember.Service
 */
export default Service.extend({
  /**
   * @type {Object}
   * @private
   */
  state: {},

  /**
   * @type {Array.<Ember.Route>}
   * @private
   */
  subscriptions: [],

  /**
   * @callback fetch
   * @return {Promise} Resolves with the records
   */

  /**
   * @param {string} type
   * @param {fetch} [fetch]
   * @return {(Array.<Object>|Promise)} All records for a type
   * @function
   */
  getAll(type, fetch) {
    this.initializeType(type);

    if (fetch && !this.state[type].isDataComplete) {
      return this.getAllUsingFetch(type, fetch);
    }

    return this.getAllUsingCache(type);
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {fetch} [fetch]
   * @return {(Object|Promise|null)} Record for a type and ID
   * @function
   */
  getRecord(type, id, fetch) {
    this.initializeType(type);

    const cachedRecord = this.getRecordUsingCache(type, id);

    if (cachedRecord) {
      return cachedRecord;
    }

    if (fetch) {
      return this.getRecordUsingFetch(type, id, fetch);
    }

    return null;
  },

  /**
   * @param {string} type
   * @param {fetch} fetch
   * @return {Promise} Resolves to queried records
   * @function
   */
  query(type, fetch) {
    this.initializeType(type);

    return fetch().then((records) => {
      records.forEach(record => this.addRecord(type, record, { isBackgroundOperation: true }));

      return records.map(record => this.getRecordUsingCache(type, record.id));
    });
  },

  /**
   * @param {string} type
   * @param {Array.<Object>} records
   * @param {Object} [option={}]
   * @function
   */
  setRecord(type, records, option = {}) {
    this.initializeType(type);

    const normalizedData = this.normalizeData(type, records);

    this.state[type].data = normalizedData;

    records.forEach(record => this.syncAddedRelationships(type, record));

    if (!option.isBackgroundOperation) {
      this.triggerSubscriptions();
    }
  },

  /**
   * @param {string} type
   * @param {Object} record
   * @param {Object} [option={}]
   * @function
   */
  addRecord(type, record, option = {}) {
    this.initializeType(type);

    const normalizedRecord = normalize(type, record, this);

    this.state[type].data[record.id] = normalizedRecord;

    this.syncAddedRelationships(type, record);

    if (!option.isBackgroundOperation) {
      this.triggerSubscriptions();
    }
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attribute
   * @param {Object} [option={}]
   * @function
   */
  updateRecord(type, id, attribute, option = {}) {
    const recordToUpdate = this.getRecordUsingCache(type, id);

    if (recordToUpdate) {
      const updatedRecord = Object.assign({}, recordToUpdate, attribute);
      const normalizedRecord = normalize(type, updatedRecord, this);

      this.state[type].data[id] = normalizedRecord;

      this.syncAddedRelationships(type, normalizedRecord);
      this.syncRemovedRelationships(
        type,
        normalizedRecord,
        normalize(type, recordToUpdate, this),
      );

      if (!option.isBackgroundOperation) {
        this.triggerSubscriptions();
      }
    } else {
      throw new Error('Record doesn\'t exist');
    }
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} [option={}]
   * @function
   */
  deleteRecord(type, id, option = {}) {
    const record = this.getRecordUsingCache(type, id);

    if (record) {
      delete this.state[type].data[id];

      const model = getOwner(this).lookup(`model:${type}`);

      this.syncRemovedRelationships(
        type,
        Object.assign(this.getDefaultRecord(model), { id }),
        normalize(type, record, this),
      );

      if (!option.isBackgroundOperation) {
        this.triggerSubscriptions();
      }
    } else {
      throw new Error('Record doesn\'t exist');
    }
  },

  /**
   * @param {Ember.Route} route
   * @function
   */
  subscribe(route) {
    const existingRoute = this.subscriptions.find(subscription => (
      subscription.routeName === route.routeName
    ));

    if (!existingRoute) {
      this.set('subscriptions', [...this.subscriptions, route]);

      route.on('deactivate', () => {
        const updatedSubscriptions = this.subscriptions.filter(subscription => (
          subscription.routeName !== route.routeName
        ));

        this.set('subscriptions', updatedSubscriptions);
      });
    }
  },

  /**
   * @return {Utility.Batch} batch
   * @function
   */
  batch() {
    return new Batch(this);
  },

  /**
   * @param {string} type
   * @return {boolean} True if state for type exists. Otherwise, false.
   * @private
   * @function
   */
  isStateForTypeExisting(type) {
    if (this.state[type]) {
      return true;
    }

    return false;
  },

  /**
   * @param {string} type
   * @private
   * @function
   */
  initializeType(type) {
    if (!this.isStateForTypeExisting(type)) {
      this.set('state', Object.assign({}, this.state, {
        [type]: {
          isDataComplete: false,
          data: {},
        },
      }));
    }
  },

  /**
   * @function
   * @private
   */
  triggerSubscriptions() {
    this.subscriptions.forEach(subscription => subscription.refresh());
  },

  /**
   * @param {string} type
   * @param {Array.<Object>} records
   * @return {Object} Normalized data
   * @private
   * @function
   */
  normalizeData(type, records) {
    const normalizedData = {};

    records.forEach((record) => {
      normalizedData[record.id] = normalize(type, record, this);
    });

    return normalizedData;
  },

  /**
   * @param {string} type
   * @param {Object} record
   * @param {number} depthLevel
   * @return {Object} Record with embedded relationships
   * @private
   * @function
   */
  embedRelationships(type, record, depthLevel) {
    const model = getOwner(this).lookup(`model:${type}`);
    const relationship = {};

    if (model.relationship) {
      Object.keys(model.relationship).forEach((key) => {
        const { type: relationshipType, kind: relationshipKind } = model.relationship[key];

        if (relationshipKind === 'hasMany') {
          let relatedRecords;

          if (depthLevel < 4) {
            relatedRecords = record[key].map(relatedRecord => (
              this.getRecordUsingCache(
                relationshipType,
                relatedRecord,
                depthLevel + 1,
              ) || { id: relatedRecord }
            ));
          } else {
            relatedRecords = record[key].map(relatedRecord => ({ id: relatedRecord }));
          }

          relationship[key] = relatedRecords;
        } else if (relationshipKind === 'belongsTo') {
          if (record[key]) {
            if (depthLevel < 4) {
              relationship[key] = this.getRecordUsingCache(
                relationshipType,
                record[key],
                depthLevel + 1,
              ) || { id: record[key] };
            } else {
              relationship[key] = { id: record[key] };
            }
          }
        }
      });
    }

    return Object.assign({}, record, relationship);
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {number} [depthLevel=1]
   * @return {Object} Cached record
   * @private
   * @function
   */
  getRecordUsingCache(type, id, depthLevel = 1) {
    if (this.isStateForTypeExisting(type)) {
      const { data } = this.state[type];

      if (data[id]) {
        return Object.assign({}, this.embedRelationships(type, data[id], depthLevel));
      }
    }

    return undefined;
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {fetch} fetch
   * @return {Promise} Record for type and ID
   * @private
   * @function
   */
  getRecordUsingFetch(type, id, fetch) {
    return fetch().then((record) => {
      this.addRecord(type, record, { isBackgroundOperation: true });

      return this.getRecordUsingCache(type, id);
    });
  },

  /**
   * @param {string} type
   * @return {Array.<Object>} All records for a type
   * @private
   * @function
   */
  getAllUsingCache(type) {
    const ids = Object.keys(this.state[type].data);
    const data = ids.map(id => this.getRecordUsingCache(type, id));

    return data;
  },

  /**
   * @param {string} type
   * @param {fetch} fetch
   * @return {Promise} All records for a type
   * @private
   * @function
   */
  getAllUsingFetch(type, fetch) {
    return fetch().then((records) => {
      this.setRecord(type, records, { isBackgroundOperation: true });
      this.set(`state.${type}.isDataComplete`, true);

      return this.getAllUsingCache(type);
    });
  },

  /**
   * @param {Object} relationship
   * @return {Object|null} Relationship inverse descriptor
   * @private
   * @function
   */
  getRelationshipInverseDescriptor(relationship) {
    if (relationship.inverse) {
      const model = getOwner(this).lookup(`model:${relationship.type}`);

      return model.relationship[relationship.inverse];
    }

    return null;
  },

  /**
   * @param {string} idToSyncTo
   * @param {Object} relationship
   * @param {Object} record
   * @private
   * @function
   */
  syncAddedRelationship(idToSyncTo, relationship, record) {
    if (record) {
      this.initializeType(relationship.type);

      const isReferenceRecord = typeof record === 'string';
      let recordToNormalize = record;

      if (isReferenceRecord) {
        recordToNormalize = this.getRecord(relationship.type, record);
      }

      if (recordToNormalize) {
        const normalizedRecord = normalize(relationship.type, recordToNormalize, this);
        const inverseDescriptor = this.getRelationshipInverseDescriptor(relationship);

        if (inverseDescriptor) {
          if (inverseDescriptor.kind === 'belongsTo') {
            normalizedRecord[relationship.inverse] = idToSyncTo;
          } else if (!normalizedRecord[relationship.inverse].includes(idToSyncTo)) {
            normalizedRecord[relationship.inverse].push(idToSyncTo);
          }
        }

        this.state[relationship.type].data[normalizedRecord.id] = normalizedRecord;
      }
    }
  },

  /**
   * @param {string} type
   * @param {Object} record
   * @private
   * @function
   */
  syncAddedRelationships(type, record) {
    const model = getOwner(this).lookup(`model:${type}`);

    Object.keys(record).forEach((key) => {
      if (Object.keys(model.relationship).includes(key)) {
        const relationship = model.relationship[key];

        if (relationship.kind === 'belongsTo') {
          this.syncAddedRelationship(record.id, relationship, record[key]);
        } else if (relationship.kind === 'hasMany') {
          record[key].forEach(relatedRecord => this.syncAddedRelationship(
            record.id,
            relationship,
            relatedRecord,
          ));
        }
      }
    });
  },

  /**
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @param {string} fieldName
   * @param {Object} relationship
   * @private
   * @function
   */
  syncRemovedBelongsToRelationship(currentRecord, oldRecord, fieldName, relationship) {
    if (currentRecord[fieldName] === null && currentRecord[fieldName] !== oldRecord[fieldName]) {
      const inverseRecord = this.getRecord(relationship.type, oldRecord[fieldName]);

      if (inverseRecord) {
        const inverseDescriptor = this.getRelationshipInverseDescriptor(relationship);

        if (inverseDescriptor) {
          if (inverseDescriptor.kind === 'belongsTo') {
            inverseRecord[relationship.inverse] = null;
          } else {
            inverseRecord[relationship.inverse] = inverseRecord[relationship.inverse]
              .filter(relatedRecord => relatedRecord.id !== currentRecord.id);
          }
        }

        this.state[relationship.type].data[inverseRecord.id] = inverseRecord;
      }
    }
  },

  /**
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @param {string} fieldName
   * @param {Object} relationship
   * @private
   * @function
   */
  syncRemovedHasManyRelationship(currentRecord, oldRecord, fieldName, relationship) {
    const removedRecords = oldRecord[fieldName].filter(record => (
      !currentRecord[fieldName].includes(record)
    ));

    removedRecords.forEach((removedRecord) => {
      const inverseRecord = this.getRecord(relationship.type, removedRecord);

      if (inverseRecord) {
        const inverseDescriptor = this.getRelationshipInverseDescriptor(relationship);

        if (inverseDescriptor) {
          if (inverseDescriptor.kind === 'belongsTo') {
            inverseRecord[relationship.inverse] = null;
          } else {
            inverseRecord[relationship.inverse] = inverseRecord[relationship.inverse]
              .filter(relatedRecord => relatedRecord.id !== currentRecord.id);
          }
        }

        this.state[relationship.type].data[inverseRecord.id] = inverseRecord;
      }
    });
  },

  /**
   * @param {string} type
   * @param {Object} currentRecord
   * @param {Object} oldRecord
   * @private
   * @function
   */
  syncRemovedRelationships(type, currentRecord, oldRecord) {
    const model = getOwner(this).lookup(`model:${type}`);

    Object.keys(currentRecord).forEach((key) => {
      if (Object.keys(model.relationship).includes(key)) {
        const relationship = model.relationship[key];

        if (relationship.kind === 'belongsTo') {
          this.syncRemovedBelongsToRelationship(currentRecord, oldRecord, key, relationship);
        } else if (relationship.kind === 'hasMany') {
          this.syncRemovedHasManyRelationship(currentRecord, oldRecord, key, relationship);
        }
      }
    });
  },

  /**
 * @param {EmberObject} model
 * @return {Object} Record with default values
 * @private
 * @function
 */
  getDefaultRecord(model) {
    const defaultRecord = {};

    model.attributes.forEach((attribute) => {
      defaultRecord[attribute] = null;
    });

    Object.keys(model.relationship).forEach((key) => {
      const { kind } = model.relationship[key];

      if (kind === 'belongsTo') {
        defaultRecord[key] = null;
      } else if (kind === 'hasMany') {
        defaultRecord[key] = [];
      }
    });

    return defaultRecord;
  },
});
