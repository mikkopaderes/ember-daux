import { module, test } from 'qunit';

import Model from 'ember-daux/utils/model';

module('Unit | Utility | model', function () {
  test('nothing to test', function (assert) {
    assert.expect(1);

    assert.ok(Model.create());
  });
});
