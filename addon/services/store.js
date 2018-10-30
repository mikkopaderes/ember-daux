import { getOwner } from '@ember/application';

import { Store } from 'daux';

export default {
  /**
   * @type {boolean}
   * @readonly
   */
  isServiceFactory: true,

  /**
   * @param {Object} context
   * @return {Utility.Store} Initialized Store
   * @function
   */
  create(context) {
    const modelCurator = getOwner(context).lookup('model:index');

    return new Store(modelCurator.model);
  },
};
