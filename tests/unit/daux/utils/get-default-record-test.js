import { module, test } from 'qunit';

import { Store } from 'ember-daux/daux';
import getDefaultRecord from 'ember-daux/daux/utils/get-default-record';
import model from '../../../helpers/model';

module('Unit | Utility | get-default-record', function () {
  module('function: getDefaultRecord', function () {
    test('should return the default record for a model', function (assert) {
      assert.expect(1);

      // Arrange
      const store = new Store(model);

      // Act
      const result = getDefaultRecord(store, 'user');

      // Assert
      assert.deepEqual(result, {
        name: null,
        blockedUsers: [],
        country: null,
        groups: [],
        posts: [],
        username: null,
      });
    });
  });
});
