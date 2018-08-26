ember-daux
==============================================================================

*This is an experimental addon (and a for fun project)*

A state management solution for your Ember apps that combines some of the concepts of Ember Data and Redux.

Design
------------------------------------------------------------------------------

The idea is to have an immutable model-based state in which you can subscribe to for changes.

With immutable states, your Component's lifecycle hooks will now always fire when you update the value of an object or array. You'll also no longer need to listen for deep properties in your computed properties.

e.g.

- `Ember.computed('todos.@each.isDone')` -> `Ember.computed('todos')`
- `Ember.computed('todos.[]')` -> `Ember.computed('todos')`

What's the difference for the computed properties performance wise? I don't think there's much at the current state of Ember. I'd say it's an ergonomics issue right now.

It's also worth noting that Ember's future with [Glimmer](https://glimmerjs.com) improves performance drastically through immutability and its [tracking pattern](https://glimmerjs.com/guides/tracked-properties). Daux should work well with it.

Installation
------------------------------------------------------------------------------

```
ember install ember-daux
```

Usage
------------------------------------------------------------------------------

Check out the [API reference](API.md)

### Setup your models

Create your model at **app/models/[model-name].js**:

```javascript
// app/models/user.js
import { Model } from 'ember-daux/daux';

export default class User extends Model {
  static get attributes() {
    return ['name'];
  }

  static get relationship() {
    return {
      country: {
        type: 'country',
        kind: 'belongsTo',
        inverse: null,
      },
      groups: {
        type: 'group',
        kind: 'hasMany',
        inverse: 'members',
      },
      posts: {
        type: 'post',
        kind: 'hasMany',
        inverse: 'author',
      },
    };
  }

  /**
   * Optional hook to normalize a record
   */
  static normalize(record) {
    const normalizedRecord = {};

    Object.keys(record).forEach((key) => {
      const camelizedKey = camelize(key);

      normalizedRecord[camelizedKey] = record[key];
    });

    return normalizedRecord;
  }
}
```

Next, let's create a model curator that'll contain all the models we have:

```javascript
// app/models/index.js
import EmberObject from '@ember/object';

import User from './user';

export default EmberObject.extend({
  model: {
    user: User
  }
});
```

### Fetching states

```javascript
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(() => this.refresh());
  },

  model() {
    return this.store.getAll('user', () => {
      return fetch('example.com/api/users').then((response) => {
        return response.json();
      });
    });
  }
});
```

### Changing states

```javascript
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  store: service('store'),

  actions: {
    handleAddUser(newUser) {
      fetch('example.com/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      }).then(() => {
        this.store.add('user', newUser);
      });
    }
  }
});
```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-daux`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
