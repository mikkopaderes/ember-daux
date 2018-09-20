import { module, test } from 'qunit';

import getDefaultRecord from 'ember-daux/daux/utils/get-default-record';
import model from '../../../helpers/model';

module('Unit | Utility | get-default-record', function () {
  module('function: getDefaultRecord', function () {
    test('should return the default record for a model', function (assert) {
      assert.expect(1);

      // Act
      const result = getDefaultRecord(model.user);

      // Assert
      assert.deepEqual(result, {
        isAdmin: null,
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
