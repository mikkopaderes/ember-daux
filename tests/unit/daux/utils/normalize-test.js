import { module, test } from 'qunit';

import normalize from 'ember-daux/daux/utils/normalize';
import model from '../../../helpers/model';

module('Unit | Util | normalize', function () {
  module('function: normalize', function () {
    test('should normalize attribute only record', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', foo: 'bar' };

      // Act
      const result = normalize(model.user, record);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: null,
        groups: [],
        posts: [],
        username: null,
      });
    });

    test('should normalize record with non-embedded relationship', function (assert) {
      assert.expect(1);

      // Arrange
      const record = {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
        username: 'username_a',
      };

      // Act
      const result = normalize(model.user, record);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
        username: 'username_a',
      });
    });

    test('should normalize record with embedded relationships', function (assert) {
      assert.expect(1);

      // Arrange
      const record = {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        groups: [{ id: 'group_a', name: 'Group A' }],
        posts: [{ id: 'post_a', message: 'Post A' }],
        username: { id: 'username_a' },
      };

      // Act
      const result = normalize(model.user, record);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
        username: 'username_a',
      });
    });
  });
});
