import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(this);
  },

  model(params) {
    return this.store.getRecord('user', params.username, () => (
      fetch(`https://api.github.com/users/${params.username}`).then(response => (
        response.json()
      )).then(data => Object.assign({}, data, { id: data.login }))
    ));
  },
});
