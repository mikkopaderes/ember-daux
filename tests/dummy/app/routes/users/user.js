import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(() => this.refresh());
  },

  model(params) {
    const user = { id: params.username, name: 'Foobar' };

    return this.store.get('user', params.username, () => Promise.resolve(user));
  },
});
