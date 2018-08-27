import { module, test } from 'qunit';

import Model from 'ember-daux/daux/core/model';

module('Unit | Core | model', function () {
  test('should initialize attributes as an empty array', function (assert) {
    assert.expect(1);

    // Act
    const result = Model.attributes;

    // Assert
    assert.deepEqual(result, []);
  });

  test('should initialize relationship as an empty object', function (assert) {
    assert.expect(1);

    // Act
    const result = Model.relationship;

    // Assert
    assert.deepEqual(result, {});
  });
});
