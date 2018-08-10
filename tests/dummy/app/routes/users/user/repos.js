import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(this);
  },

  model() {
    const user = this.modelFor('users.user');

    return this.store.query('repo', () => fetch(user.repos_url).then(response => response.json()));
  },
});
