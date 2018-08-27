/**
 * @class Batch
 * @namespace Daux.Core
 */
export default class Batch {
  /**
   * @param {Service.Store} store
   */
  constructor(store) {
    this.store = store;
    this.queues = [];
  }

  /**
   * @param {string} type
   * @param {Array.<Object>} records
   * @function
   */
  set(type, records) {
    this.queues.push({
      operation: 'set',
      data: { type, records },
    });
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @function
   */
  add(type, record) {
    this.queues.push({
      operation: 'add',
      data: { type, record },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attribute
   * @function
   */
  update(type, id, attribute) {
    this.queues.push({
      operation: 'update',
      data: { type, id, attribute },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @function
   */
  delete(type, id) {
    this.queues.push({
      operation: 'delete',
      data: { type, id },
    });
  }

  /**
   * @param {Object} [option]
   * @function
   */
  commit(option) {
    this.queues.forEach(({ operation, data }, index) => {
      let finalOption = option;

      if (!finalOption) {
        const isBackgroundOperation = index !== this.queues.length - 1;

        finalOption = { isBackgroundOperation };
      }

      if (operation === 'set') {
        this.store.set(data.type, data.records, finalOption);
      } else if (operation === 'add') {
        this.store.add(data.type, data.record, finalOption);
      } else if (operation === 'update') {
        this.store.update(data.type, data.id, data.attribute, finalOption);
      } else if (operation === 'delete') {
        this.store.delete(data.type, data.id, finalOption);
      }
    });

    this.queues = [];
  }
}
