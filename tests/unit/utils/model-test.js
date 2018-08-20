import { module, test } from 'qunit';

import Model from 'ember-daux/utils/model';

module('Unit | Utility | model', function () {
  test('should return the record by default when normalizing', function (assert) {
    assert.expect(1);

    // Arrange
    const model = Model.create();

    // Act
    const result = model.normalize({ id: 'foo' });

    // Assert
    assert.deepEqual(result, { id: 'foo' });
  });
});
