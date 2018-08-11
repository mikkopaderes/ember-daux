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

    const parsedType = this.parseType(type);

    if (fetch && !this.state[parsedType].isDataComplete) {
      return this.getAllUsingFetch(parsedType, fetch);
    }

    return this.getAllUsingCache(parsedType);
  },

  /**
   * @param {string} type
   * @param {string} id
   * @param {fetch} [fetch]
   * @return {(Object|Promise|undefined)} Record for a type and ID
   * @function
   */
  getRecord(type, id, fetch) {
    this.initializeType(type);

    const cachedRecord = this.getCachedRecord(type, id);

    if (cachedRecord) {
      return cachedRecord;
    }

    if (fetch) {
      return this.getRecordUsingFetch(type, id, fetch);
    }

    return undefined;
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
      const updatedRecord = Object.assign({}, recordToUpdate, attributes);
      const updatedData = Object.assign({}, this.state[parsedType].data, { [id]: updatedRecord });
      const stateForType = Object.assign({}, this.state[parsedType], { data: updatedData });

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
      const data = Object.assign({}, this.state[parsedType].data);

      delete data[id];

      const stateForType = Object.assign({}, this.state[parsedType], { data });

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
          isDataComplete: false,
          data: {},
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
      const { data } = this.state[this.parseType(type)];

      if (data[id]) {
        return Object.assign({}, data[id]);
      }
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
    const normalizedData = this.normalizeData(records);
    const newState = Object.assign({}, this.state, {
      [this.parseType(type)]: { data: normalizedData },
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
      data: Object.assign({}, this.state[parsedType].data, { [record.id]: record }),
    });
    const newState = Object.assign({}, this.state, { [parsedType]: stateForType });

    this.set('state', newState);
  },

  /**
   * @param {Array.<Object>} records
   * @return {Object} Normalized data
   * @private
   * @function
   */
  normalizeData(records) {
    const normalizeData = {};

    records.forEach((record) => {
      normalizeData[record.id] = record;
    });

    return normalizeData;
  },

  /**
   * @param {Object} [data={}]
   * @return {Array.<Object>} Denormalized data
   * @private
   * @function
   */
  denormalizeData(data = {}) {
    return Object.keys(data).map(key => Object.assign({}, data[key]));
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
      this.setRecordWithoutTriggeringSubscriptions(type, records);
      this.set(`state.${type}.isDataComplete`, true);

      return this.denormalizeData(this.state[type].data);
    });
  },

  /**
   * @param {string} type
   * @return {Array.<Object>} All records for a type
   * @private
   * @function
   */
  getAllUsingCache(type) {
    return this.denormalizeData(this.state[type].data);
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
      this.addRecordWithoutTriggeringSubscriptions(type, record);

      return this.getCachedRecord(type, id);
    });
  },
});
