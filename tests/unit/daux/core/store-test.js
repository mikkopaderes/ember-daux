import QUnit, { module, test } from 'qunit';

import sinon from 'sinon';

import { Store } from 'ember-daux/daux';
import Batch from 'ember-daux/daux/core/batch';
import model from '../../../helpers/model';

module('Unit | Core | store', function () {
  QUnit.dump.maxDepth = 10;

  test('should get record using cache', function (assert) {
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
    const result = store.get('user', 'user_a');

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

  test('should get record using fetch', async function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);
    const user = {
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
      groups: [{ id: 'group_a', name: 'Group A' }],
      posts: [{ id: 'post_a', message: 'Post A' }],
      username: { id: 'username_a', user: 'user_a' },
    };

    // Act
    const result = await store.get('user', 'user_a', () => Promise.resolve(user));

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

  test('should return null when getting a record that does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    const result = store.get('user', 'user_a');

    // Assert
    assert.equal(result, null);
  });

  test('should get all records for a model using cache', function (assert) {
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
    const result = store.getAll('user');

    // Assert
    assert.deepEqual(result, [
      {
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
  });

  test('should get all records for a model using fetch', async function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);
    const users = [
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
        groups: [{ id: 'group_a', name: 'Group A' }],
        posts: [{ id: 'post_a', message: 'Post A' }],
        username: { id: 'username_a', user: 'user_a' },
      },
    ];

    // Act
    const result = await store.getAll('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
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
  });

  test('should query records', async function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);
    const users = [
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
        groups: [{ id: 'group_a', name: 'Group A' }],
        posts: [{ id: 'post_a', message: 'Post A' }],
        username: { id: 'username_a', user: 'user_a' },
      },
    ];

    // Act
    const result = await store.query('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
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
      },
    ]);
  });

  test('should update record', function (assert) {
    assert.expect(4);

    // Arrange
    const store = new Store(model);

    store.add('user', {
      id: 'user_a',
      name: 'User A',
      blockedUsers: ['user_b'],
      country: 'monaco',
      groups: ['group_a'],
      posts: ['post_a'],
      username: 'username_a',
    });

    // Act
    store.update('user', 'user_a', {
      name: 'Foo',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'Foo',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });
    assert.deepEqual(store.get('group', 'group_a'), {
      id: 'group_a',
      name: null,
      members: [],
    });
    assert.deepEqual(store.get('post', 'post_a'), {
      id: 'post_a',
      message: null,
      author: null,
    });
    assert.deepEqual(store.get('username', 'username_a'), { id: 'username_a', user: null });
  });

  test('should delete record', function (assert) {
    assert.expect(4);

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
    ]);
    store.set('country', [{ id: 'monaco', name: 'Monaco' }]);
    store.set('group', [{ id: 'group_a', name: 'Group A', members: ['user_a'] }]);
    store.set('post', [{ id: 'post_a', message: 'Post A', author: 'user_a' }]);
    store.set('username', [{ id: 'username_a', user: 'user_a' }]);

    // Act
    store.delete('user', 'user_a');

    // Assert
    assert.equal(store.get('user', 'user_a'), null);
    assert.deepEqual(store.get('group', 'group_a'), {
      id: 'group_a',
      name: 'Group A',
      members: [],
    });
    assert.deepEqual(store.get('post', 'post_a'), {
      id: 'post_a',
      message: 'Post A',
      author: null,
    });
    assert.deepEqual(store.get('username', 'username_a'), { id: 'username_a', user: null });
  });

  test('should trigger subscription when adding record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.subscribe(stub);

    // Act
    store.add('user', { id: 'user_a' });

    // Assert
    assert.ok(stub.calledOnce);
  });

  test('should not trigger subscription when adding record with a true background operation option', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.subscribe(stub);

    // Act
    store.add('user', { id: 'user_a' }, { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should trigger subscription when setting record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.subscribe(stub);

    // Act
    store.set('user', [{ id: 'user_a' }]);

    // Assert
    assert.ok(stub.calledOnce);
  });

  test('should not trigger subscription when setting record with a true background operation option', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.subscribe(stub);

    // Act
    store.set('user', [{ id: 'user_a' }], { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should trigger subscription when updating record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.add('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.update('user', 'user_a', { name: 'Foo' });

    // Assert
    assert.ok(stub.calledOnce);
  });

  test('should not trigger subscription when updating record with a true background operation option', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.add('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.update('user', 'user_a', { name: 'Foo' }, { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should trigger subscription when deleting record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.add('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.delete('user', 'user_a');

    // Assert
    assert.ok(stub.calledOnce);
  });

  test('should not trigger subscription when deleting record with a true background operation option', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.add('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.delete('user', 'user_a', { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should trigger subscription when unsubscribing', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);
    const unsubscribe = store.subscribe(stub);

    unsubscribe();

    // Act
    store.set('user', [{ id: 'user_a' }]);

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should return batch instance when calling batch', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    const result = store.batch();

    // Assert
    assert.ok(result instanceof Batch);
  });
});
