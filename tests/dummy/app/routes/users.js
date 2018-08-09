import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),
  willRefresh: true,

  beforeModel() {
    this.store.subscribe(this);
  },

  model() {
    return this.store.getAll('user', () => (
      Promise.resolve([
        {
          id: '1',
          name: Math.random().toString(32).slice(2).substr(0, 5),
          age: 15,
        },
        {
          id: '2',
          name: Math.random().toString(32).slice(2).substr(0, 5),
          age: 20,
        },
      ])
    ));
  },

  afterModel() {
    later(() => {
      if (this.willRefresh) {
        this.store.updateRecord('user', '1', {
          name: Math.random().toString(32).slice(2).substr(0, 5),
        });
        this.store.addRecord('user', {
          id: '100',
          name: Math.random().toString(32).slice(2).substr(0, 5),
          age: 50,
        });
        this.set('willRefresh', false);
      }
    }, 5000);
  },
});
