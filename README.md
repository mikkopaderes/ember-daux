ember-daux
==============================================================================

Ember addon for integrating [Daux](https://github.com/dauxjs/daux)

Installation
------------------------------------------------------------------------------

```
ember install ember-daux
```

Usage
------------------------------------------------------------------------------

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
   * Optional hook to deserialize a record
   */
  static deserialize(record) {
    const deserializedRecord = {};

    Object.keys(record).forEach((key) => {
      // Use name instead of display_name to match the model attributes
      if (key === 'display_name') {
        deserializedRecord['name'] = record[key];
      }
    });

    return deserializedRecord;
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

### Injecting the `store` service

```javascript
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(() => this.refresh());
  },

  model() {
    return this.store.getAll('user', {
      fetch() {
        return fetch('example.com/api/users').then((response) => {
          return response.json();
        });
      },
    });
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
