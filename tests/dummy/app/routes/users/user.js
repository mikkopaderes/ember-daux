import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  model(params) {
    return this.store.getRecord('user', params.user_id);
  },
});
