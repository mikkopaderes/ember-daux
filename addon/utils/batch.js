/**
 * @class Batch
 * @namespace Utility
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
  setRecord(type, records) {
    this.queues.push({
      operation: 'setRecord',
      data: { type, records },
    });
  }

  /**
   * @param {string} type
   * @param {Object} record
   * @function
   */
  addRecord(type, record) {
    this.queues.push({
      operation: 'addRecord',
      data: { type, record },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {Object} attribute
   * @function
   */
  updateRecord(type, id, attribute) {
    this.queues.push({
      operation: 'updateRecord',
      data: { type, id, attribute },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @function
   */
  deleteRecord(type, id) {
    this.queues.push({
      operation: 'deleteRecord',
      data: { type, id },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {string} field
   * @param {Object} relatedRecord
   * @function
   */
  addRelationship(type, id, field, relatedRecord) {
    this.queues.push({
      operation: 'addRelationship',
      data: {
        type,
        id,
        field,
        relatedRecord,
      },
    });
  }

  /**
   * @param {string} type
   * @param {string} id
   * @param {string} field
   * @param {Object} relatedRecord
   * @function
   */
  removeRelationship(type, id, field, relatedRecord) {
    this.queues.push({
      operation: 'removeRelationship',
      data: {
        type,
        id,
        field,
        relatedRecord,
      },
    });
  }

  /**
   * @param {Object} [option]
   * @function
   */
  commit(option) {
    this.queues.forEach(({ operation, data }, index) => {
      let newOption = option;

      if (!newOption) {
        const isBackgroundOperation = index !== this.queues.length - 1;

        newOption = { isBackgroundOperation };
      }

      if (operation === 'setRecord') {
        this.store.setRecord(data.type, data.records, newOption);
      } else if (operation === 'addRecord') {
        this.store.addRecord(data.type, data.record, newOption);
      } else if (operation === 'updateRecord') {
        this.store.updateRecord(data.type, data.id, data.attribute, newOption);
      } else if (operation === 'deleteRecord') {
        this.store.deleteRecord(data.type, data.id, newOption);
      } else if (operation === 'addRelationship') {
        this.store.relationship().add(
          data.type,
          data.id,
          data.field,
          data.relatedRecord,
          newOption,
        );
      } else if (operation === 'removeRelationship') {
        this.store.relationship().remove(
          data.type,
          data.id,
          data.field,
          data.relatedRecord,
          newOption,
        );
      }
    });

    this.queues = [];
  }
}
