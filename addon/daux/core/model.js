/**
 * @class Model
 * @namespace Daux.Core
 */
export default class Model {
  /**
   * @type {Array}
   */
  static get attributes() {
    return [];
  }

  /**
   * @type {Object}
   */
  static get relationship() {
    return {};
  }

  /**
   * @param {Object} record
   * @return {Object} Normalized record
   * @function
   */
  static normalize(record) {
    return record;
  }
}
