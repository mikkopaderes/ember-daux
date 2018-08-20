import EmberObject from '@ember/object';

/**
 * @class Batch
 * @namespace Utility
 * @extends Ember.Object
 */
export default EmberObject.extend({
  /**
   * @type {Array.<string>}
   */
  attributes: [],

  /**
   * @type {Object}
   */
  relationship: {},

  /**
   * @param {Object} record
   * @return {Object} Normalized record
   * @function
   */
  normalize(record) {
    return record;
  },
});
