ember-daux
==============================================================================

*This is an experimental addon (and a for fun project)*

A state management solution for your Ember apps that combines some of the concepts of Ember Data and Redux.

Design
------------------------------------------------------------------------------

The idea is to have an immutable model-based state in which your Routes can subscribe to for changes. When a state changes, all subscribed Routes will call their [`refresh()`](https://emberjs.com/api/ember/3.3/classes/Route/methods/refresh?anchor=refresh) function. Because states are immutable, the Route will pass-in a new `model` to its Controller effectively rerendering the view.

With immutable states, your Component's lifecycle hooks will now always fire when you update the value of an object or array. You also don't need to listen for deep properties in your computed properties.

e.g.

- `Ember.computed('todos.@each.isDone')` -> `Ember.computed('todos')`
- `Ember.computed('todos.[]')` -> `Ember.computed('todos')`

What's the difference performance wise? I don't think there's much at the current state of Ember. I'd say it's an ergonomics issue right now.

Installation
------------------------------------------------------------------------------

```
ember install ember-daux
```

Usage
------------------------------------------------------------------------------

*Check out the [API reference](API.md)*

### Fetching states

```javascript
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service('store'),

  beforeModel() {
    this.store.subscribe(this);
  },

  model() {
    return this.store.getAll('user', () => {
      return fetch('example.com/api/users').then((response) => {
        return response.json();
      });
    });
  },
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
        this.store.addRecord('user', newUser);
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
