import { module, test } from 'qunit';

import { denormalize, normalize } from 'ember-daux/daux/core/normalizer';
import { Store } from 'ember-daux/daux';
import model from '../../../helpers/model';

module('Unit | Core | normalizer', function () {
  module('function: normalize', function () {
    test('should normalize attribute only record', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', foo: 'bar' };

      // Act
      const result = normalize(model, 'user', record);

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

    test('should normalize record with embedded ID only relationships', function (assert) {
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
      const result = normalize(model, 'user', record);

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
      const result = normalize(model, 'user', record);

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

    test('should pre-normalize using custom normalize', function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'User A', country: 'm0naco' };

      // Act
      const result = normalize(model, 'user', record);

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: 'monaco',
        groups: [],
        posts: [],
        username: null,
      });
    });
  });

  module('function: denormalize', function () {
    test('should denormalize record', function (assert) {
      assert.expect(1);

      // Arrange
      const store = new Store(model);

      store.set('user', [
        {
          id: 'user_a',
          name: 'User A',
          blockedUsers: ['user_b'],
          country: 'monaco',
          groups: ['group_a'],
          posts: ['post_a'],
          username: 'username_a',
        },
        {
          id: 'user_b',
          name: 'User B',
          blockedUsers: [],
          country: null,
          groups: [],
          posts: [],
          username: null,
        },
      ]);
      store.set('country', [{ id: 'monaco', name: 'Monaco' }]);
      store.set('group', [{ id: 'group_a', name: 'Group A', members: ['user_a'] }]);
      store.set('post', [{ id: 'post_a', message: 'Post A', author: 'user_a' }]);
      store.set('username', [{ id: 'username_a', user: 'user_a' }]);

      // Act
      const result = denormalize(store, 'user', 'user_a');

      // Assert
      assert.deepEqual(result, {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        blockedUsers: [
          {
            id: 'user_b',
            name: 'User B',
            blockedUsers: [],
            country: null,
            groups: [],
            posts: [],
            username: null,
          },
        ],
        groups: [
          {
            id: 'group_a',
            name: 'Group A',
            members: [
              {
                id: 'user_a',
                name: 'User A',
                blockedUsers: [
                  {
                    id: 'user_b',
                    name: 'User B',
                    blockedUsers: [],
                    country: null,
                    groups: [],
                    posts: [],
                    username: null,
                  },
                ],
                country: { id: 'monaco', name: 'Monaco' },
                groups: [
                  {
                    id: 'group_a',
                    name: 'Group A',
                    members: [{ id: 'user_a' }],
                  },
                ],
                posts: [
                  {
                    id: 'post_a',
                    message: 'Post A',
                    author: { id: 'user_a' },
                  },
                ],
                username: {
                  id: 'username_a',
                  user: { id: 'user_a' },
                },
              },
            ],
          },
        ],
        posts: [
          {
            id: 'post_a',
            message: 'Post A',
            author: {
              id: 'user_a',
              name: 'User A',
              blockedUsers: [
                {
                  id: 'user_b',
                  name: 'User B',
                  blockedUsers: [],
                  country: null,
                  groups: [],
                  posts: [],
                  username: null,
                },
              ],
              country: { id: 'monaco', name: 'Monaco' },
              groups: [
                {
                  id: 'group_a',
                  name: 'Group A',
                  members: [{ id: 'user_a' }],
                },
              ],
              posts: [
                {
                  id: 'post_a',
                  message: 'Post A',
                  author: { id: 'user_a' },
                },
              ],
              username: {
                id: 'username_a',
                user: { id: 'user_a' },
              },
            },
          },
        ],
        username: {
          id: 'username_a',
          user: {
            id: 'user_a',
            name: 'User A',
            blockedUsers: [
              {
                id: 'user_b',
                name: 'User B',
                blockedUsers: [],
                country: null,
                groups: [],
                posts: [],
                username: null,
              },
            ],
            country: { id: 'monaco', name: 'Monaco' },
            groups: [
              {
                id: 'group_a',
                name: 'Group A',
                members: [{ id: 'user_a' }],
              },
            ],
            posts: [
              {
                id: 'post_a',
                message: 'Post A',
                author: { id: 'user_a' },
              },
            ],
            username: {
              id: 'username_a',
              user: { id: 'user_a' },
            },
          },
        },
      });
    });
  });
});
