import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import normalize from 'ember-daux/utils/normalize';

module('Unit | Utility | normalize', function (hooks) {
  setupTest(hooks);

  module('function: normalize', function () {
    test('should normalize attribute only data', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', foo: 'bar' };
      const store = this.owner.lookup('service:store');

      // Act
      const result = normalize('user', record, store);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        country: null,
        groups: [],
        posts: [],
      });
    });

    test('should normalize record with embedded ID only relationships', function (assert) {
      assert.expect(1);

      // Arrange
      const record = {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
      };
      const store = this.owner.lookup('service:store');

      // Act
      const result = normalize('user', record, store);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
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
      };
      const store = this.owner.lookup('service:store');

      // Act
      const result = normalize('user', record, store);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
      });
    });

    test('should error when invalid belongsTo relationship', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', country: false };
      const store = this.owner.lookup('service:store');

      try {
        // Act
        normalize('user', record, store);
      } catch (error) {
        // Assert
        assert.equal(error.message, 'user.country is an invalid belongsTo relationship');
      }
    });

    test('should error when invalid hasMany relationship', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', groups: false };
      const store = this.owner.lookup('service:store');

      try {
        // Act
        normalize('user', record, store);
      } catch (error) {
        // Assert
        assert.equal(error.message, 'user.groups is an invalid hasMany relationship');
      }
    });
  });
});
