import { camelize } from '@ember/string';
import Service from '@ember/service';

import { pluralize } from 'ember-inflector';

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
   * @callback fetchCallback
   * @return {Promise} Resolves with the records
   */

  /**
   * @param {string} type
   * @param {fetchCallback} [fetchCallback]
   * @return {(Array.<Object>|Promise)} All records for the type
   * @function
   */
  getAll(type, fetchCallback) {
    this.initializeType(type);

    const parsedType = this.parseType(type);

    if (fetchCallback && !this.state[parsedType].isRecordsComplete) {
      return fetchCallback().then((records) => {
        this.setRecordWithoutTriggeringSubscriptions(type, records);
        this.set(`state.${parsedType}.isRecordsComplete`, true);

        return this.state[parsedType].records;
      });
    }

    return this.state[parsedType].records;
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {fetchCallback} [fetchCallback]
   * @return {(Object|Promise|undefined)} Record for the type and ID
   * @function
   */
  getRecord(type, id, fetchCallback) {
    this.initializeType(type);

    const cachedRecord = this.getCachedRecord(type, id);

    if (cachedRecord) {
      return cachedRecord;
    }

    if (fetchCallback) {
      return fetchCallback().then((record) => {
        this.addRecordWithoutTriggeringSubscriptions(type, record);

        return this.getCachedRecord(type, id);
      });
    }

    return undefined;
  },

  /**
   * @param {string} type
   * @param {fetchCallback} fetchCallback
   * @return {Promise} Resolves to queried records
   * @function
   */
  query(type, fetchCallback) {
    this.initializeType(type);

    return fetchCallback().then((records) => {
      records.forEach(record => this.addRecordWithoutTriggeringSubscriptions(type, record));

      return records;
    });
  },

  /**
   * @param {string} type
   * @param {Array.<Object>} records
   * @function
   */
  setRecord(type, records) {
    this.setRecordWithoutTriggeringSubscriptions(type, records);
    this.triggerSubscriptions();
  },

  /**
   * @param {string} type
   * @param {Object} record
   * @function
   */
  addRecord(type, record) {
    this.addRecordWithoutTriggeringSubscriptions(type, record);
    this.triggerSubscriptions();
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attributes
   * @function
   */
  updateRecord(type, id, attributes) {
    const recordToUpdate = this.getCachedRecord(type, id);

    if (recordToUpdate) {
      const parsedType = this.parseType(type);
      const { records } = this.state[parsedType];
      const updatedRecord = Object.assign({}, recordToUpdate, attributes);
      const updatedRecords = records.map((record) => {
        if (record.id === id) {
          return updatedRecord;
        }

        return record;
      });
      const stateForType = Object.assign({}, this.state[parsedType], { records: updatedRecords });

      this.set('state', Object.assign({}, this.state, { [parsedType]: stateForType }));
      this.triggerSubscriptions();
    } else {
      throw new Error('Record doesn\'t exist');
    }
  },

  /**
   * @param {string} type
   * @param {string} id
   * @function
   */
  deleteRecord(type, id) {
    if (this.getCachedRecord(type, id)) {
      const parsedType = this.parseType(type);
      const { records } = this.state[parsedType];
      const updatedRecords = records.filter(record => record.id !== id);
      const stateForType = Object.assign({}, this.state[parsedType], { records: updatedRecords });

      this.set('state', Object.assign({}, this.state, { [parsedType]: stateForType }));
      this.triggerSubscriptions();
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
   * @param {string} type
   * @return {string} Camelized and pluralized type
   * @private
   * @function
   */
  parseType(type) {
    return camelize(pluralize(type));
  },

  /**
   * @param {string} type
   * @return {boolean} True if state for type exists. Otherwise, false.
   * @private
   * @function
   */
  isStateForTypeExisting(type) {
    const parsedType = this.parseType(type);

    if (this.state[parsedType]) {
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
        [this.parseType(type)]: {
          isRecordsComplete: false,
          records: [],
        },
      }));
    }
  },

  /**
   * @param {string} type
   * @param {string} id
   * @return {Object} Cached record
   * @private
   * @function
   */
  getCachedRecord(type, id) {
    if (this.isStateForTypeExisting(type)) {
      const { records } = this.state[this.parseType(type)];

      return records.find(record => record.id === id);
    }

    return undefined;
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
   * @private
   * @function
   */
  setRecordWithoutTriggeringSubscriptions(type, records) {
    const newState = Object.assign({}, this.state, {
      [this.parseType(type)]: { records },
    });

    this.set('state', newState);
  },

  /**
   * @param {string} type
   * @param {Object} record
   * @private
   * @function
   */
  addRecordWithoutTriggeringSubscriptions(type, record) {
    this.initializeType(type);

    const parsedType = this.parseType(type);
    const stateForType = Object.assign({}, this.state[parsedType], {
      records: [...this.state[parsedType].records, record],
    });
    const newState = Object.assign({}, this.state, { [parsedType]: stateForType });

    this.set('state', newState);
  },
});
