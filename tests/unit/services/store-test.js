import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { Store } from 'daux';

module('Unit | Service | store', function (hooks) {
  setupTest(hooks);

  test('should return Daux Store instance', function (assert) {
    assert.expect(1);

    // Act
    const result = this.owner.lookup('service:store');

    // Assert
    assert.ok(result instanceof Store);
  });
});
