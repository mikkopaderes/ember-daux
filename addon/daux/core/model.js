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
   * @return {Object} Deserialized record
   * @function
   */
  static deserialize(record) {
    return Object.assign({}, record);
  }
}
