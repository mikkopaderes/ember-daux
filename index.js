'use strict';

module.exports = {
  name: 'ember-daux',

  included(app) {
    this._super.included.apply(this, arguments);

    app.import('node_modules/daux/dist/daux.min.js');
    app.import('vendor/shims/daux.js');
  },
};
