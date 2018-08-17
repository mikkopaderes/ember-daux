import { setupTest } from 'ember-qunit';
import QUnit, { module, test } from 'qunit';

import sinon from 'sinon';

import Batch from 'ember-daux/utils/batch';

module('Unit | Service | store', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    QUnit.dump.maxDepth = 10;
  });

  test('should be able to get all records for a model via cache', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [
      {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
      },
    ]);
    service.setRecord('country', [{ id: 'monaco', name: 'Monaco' }]);
    service.setRecord('group', [{ id: 'group_a', name: 'Group A', members: ['user_a'] }]);
    service.setRecord('post', [{ id: 'post_a', message: 'Post A', author: 'user_a' }]);

    // Act
    const result = service.getAll('user');

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        groups: [
          {
            id: 'group_a',
            name: 'Group A',
            members: [
              {
                id: 'user_a',
                name: 'User A',
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
            },
          },
        ],
      },
    ]);
  });

  test('should be able to get all records for a model via fetch callback', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [
      {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
      },
    ];
    const service = this.owner.lookup('service:store');

    service.setRecord('country', [{ id: 'monaco', name: 'Monaco' }]);
    service.setRecord('group', [{ id: 'group_a', name: 'Group A' }]);
    service.setRecord('post', [{ id: 'post_a', message: 'Post A' }]);

    // Act
    const result = await service.getAll('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        groups: [
          {
            id: 'group_a',
            name: 'Group A',
            members: [
              {
                id: 'user_a',
                name: 'User A',
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
            },
          },
        ],
      },
    ]);
  });

  test('should be able to get all records for a model with embedded relationships via fetch callback', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [
      {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        groups: [{ id: 'group_a', name: 'Group A' }],
        posts: [{ id: 'post_a', message: 'Post A' }],
      },
    ];
    const service = this.owner.lookup('service:store');

    // Act
    const result = await service.getAll('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        country: { id: 'monaco', name: 'Monaco' },
        groups: [
          {
            id: 'group_a',
            name: 'Group A',
            members: [
              {
                id: 'user_a',
                name: 'User A',
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
            },
          },
        ],
      },
    ]);
  });

  test('should be able to get a single record for a model via cache', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [
      {
        id: 'user_a',
        name: 'User A',
        country: 'monaco',
        groups: ['group_a'],
        posts: ['post_a'],
      },
    ]);
    service.setRecord('country', [{ id: 'monaco', name: 'Monaco' }]);
    service.setRecord('group', [{ id: 'group_a', name: 'Group A', members: ['user_a'] }]);
    service.setRecord('post', [{ id: 'post_a', message: 'Post A', author: 'user_a' }]);

    // Act
    const result = service.getRecord('user', 'user_a');

    // Assert
    assert.deepEqual(result, {
      id: 'user_a',
      name: 'User A',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_a',
              name: 'User A',
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
          },
        },
      ],
    });
  });

  test('should be able to get a single record for a model via fetch callback', async function (assert) {
    assert.expect(1);

    // Arrange
    const user = {
      id: 'user_a',
      name: 'User A',
      country: 'monaco',
      groups: ['group_a'],
      posts: ['post_a'],
    };
    const service = this.owner.lookup('service:store');

    service.setRecord('country', [{ id: 'monaco', name: 'Monaco' }]);
    service.setRecord('group', [{ id: 'group_a', name: 'Group A', members: ['user_a'] }]);
    service.setRecord('post', [{ id: 'post_a', message: 'Post A', author: 'user_a' }]);

    // Act
    const result = await service.getRecord('user', 'user_a', () => Promise.resolve(user));

    // Assert
    assert.deepEqual(result, {
      id: 'user_a',
      name: 'User A',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_a',
              name: 'User A',
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
          },
        },
      ],
    });
  });

  test('should be able to get a single record for a model with embedded relationships via fetch callback', async function (assert) {
    assert.expect(1);

    // Arrange
    const user = {
      id: 'user_a',
      name: 'User A',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [{ id: 'group_a', name: 'Group A' }],
      posts: [{ id: 'post_a', message: 'Post A' }],
    };
    const service = this.owner.lookup('service:store');

    // Act
    const result = await service.getRecord('user', 'user_a', () => Promise.resolve(user));

    // Assert
    assert.deepEqual(result, {
      id: 'user_a',
      name: 'User A',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_a',
              name: 'User A',
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
          },
        },
      ],
    });
  });

  test('should return an empty array when getting all records for a model when it does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    // Act
    const result = service.getAll('user');

    // Assert
    assert.deepEqual(result, []);
  });

  test('should return null when getting a single record for a model when it does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    // Act
    const result = service.getRecord('user', 'user_a');

    // Assert
    assert.equal(result, null);
  });

  test('should return all queried records for a model', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }];
    const service = this.owner.lookup('service:store');

    // Act
    const result = await service.query('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        country: null,
        groups: [],
        posts: [],
      },
    ]);
  });

  test('should trigger subscriptions when setting the record for a model', function (assert) {
    assert.expect(1);

    // Arrange
    const users = [{ id: 'user_a', name: 'Foo' }];
    const route = {
      routeName: 'foo',

      on() {},
      refresh() {},
    };
    const refreshSpy = sinon.spy(route, 'refresh');
    const service = this.owner.lookup('service:store');

    service.subscribe(route);

    // Act
    service.setRecord('user', users);

    // Assert
    assert.ok(refreshSpy.calledOnce);
  });

  test('should add the record for a model', function (assert) {
    assert.expect(2);

    // Arrange
    const recordToAdd = { id: 'user_100', name: 'User 100' };
    const service = this.owner.lookup('service:store');

    // Act
    service.addRecord('user', recordToAdd);

    // Assert
    assert.equal(service.getAll('user').length, 1);
    assert.deepEqual(service.getRecord('user', 'user_100'), {
      id: 'user_100',
      name: 'User 100',
      country: null,
      groups: [],
      posts: [],
    });
  });

  test('should add the record for a model with embedded relationships', function (assert) {
    assert.expect(2);

    // Arrange
    const recordToAdd = {
      id: 'user_100',
      name: 'User 100',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [{ id: 'group_a', name: 'Group A' }],
      posts: [{ id: 'post_a', message: 'Post A' }],
    };
    const service = this.owner.lookup('service:store');

    // Act
    service.addRecord('user', recordToAdd);

    // Assert
    assert.equal(service.getAll('user').length, 1);
    assert.deepEqual(service.getRecord('user', 'user_100'), {
      id: 'user_100',
      name: 'User 100',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_100',
              name: 'User 100',
              country: { id: 'monaco', name: 'Monaco' },
              groups: [
                {
                  id: 'group_a',
                  name: 'Group A',
                  members: [{ id: 'user_100' }],
                },
              ],
              posts: [
                {
                  id: 'post_a',
                  message: 'Post A',
                  author: { id: 'user_100' },
                },
              ],
            },
          ],
        },
      ],
      posts: [
        {
          id: 'post_a',
          message: 'Post A',
          author: {
            id: 'user_100',
            name: 'User 100',
            country: { id: 'monaco', name: 'Monaco' },
            groups: [
              {
                id: 'group_a',
                name: 'Group A',
                members: [{ id: 'user_100' }],
              },
            ],
            posts: [
              {
                id: 'post_a',
                message: 'Post A',
                author: { id: 'user_100' },
              },
            ],
          },
        },
      ],
    });
  });

  test('should trigger subscriptions when adding the record for a model', function (assert) {
    assert.expect(1);

    // Arrange
    const recordToAdd = { id: 'user_100', name: 'User 100' };
    const route = {
      routeName: 'foo',

      on() {},
      refresh() {},
    };
    const refreshSpy = sinon.spy(route, 'refresh');
    const service = this.owner.lookup('service:store');

    service.subscribe(route);

    // Act
    service.addRecord('user', recordToAdd);

    // Assert
    assert.ok(refreshSpy.calledOnce);
  });

  test('should update the attributes for a model', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [{ id: 'user_a', name: 'Foo' }]);

    // Act
    service.updateRecord('user', 'user_a', { name: 'Test' });

    // Assert
    assert.deepEqual(service.getRecord('user', 'user_a'), {
      id: 'user_a',
      name: 'Test',
      country: null,
      groups: [],
      posts: [],
    });
  });

  test('should update relationships by adding new ones', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }];
    const country = { id: 'monaco', name: 'Monaco' };
    const group = { id: 'group_a', name: 'Group A' };
    const post = { id: 'post_a', message: 'Post A' };
    const service = this.owner.lookup('service:store');

    service.setRecord('user', users);
    service.setRecord('country', [country]);
    service.setRecord('group', [group]);
    service.setRecord('post', [post]);

    // Act
    service.updateRecord('user', 'user_a', {
      country,
      groups: [group],
      posts: [post],
    });

    // Assert
    assert.deepEqual(service.getRecord('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      country: { id: 'monaco', name: 'Monaco' },
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_a',
              name: 'User A',
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
          },
        },
      ],
    });
  });

  test('should update relationships by removing old ones', async function (assert) {
    assert.expect(3);

    // Arrange
    const users = [
      {
        id: 'user_a',
        name: 'User A',
        country: 'country_a',
        groups: ['group_a', 'group_b'],
        posts: ['post_a', 'post_b'],
      },
    ];
    const country = { id: 'monaco', name: 'Monaco' };
    const groups = [
      {
        id: 'group_a',
        name: 'Group A',
        members: ['user_a'],
      },
      {
        id: 'group_b',
        name: 'Group B',
        members: ['user_a'],
      },
    ];
    const posts = [
      {
        id: 'post_a',
        message: 'Post A',
        author: 'user_a',
      },
      {
        id: 'post_b',
        message: 'Post B',
        author: 'user_a',
      },
    ];
    const service = this.owner.lookup('service:store');

    service.setRecord('user', users);
    service.setRecord('country', [country]);
    service.setRecord('group', groups);
    service.setRecord('post', posts);

    // Act
    service.updateRecord('user', 'user_a', {
      country: null,
      groups: [{ id: 'group_a', name: 'Group A', members: ['user_a'] }],
      posts: [{ id: 'post_a', message: 'Post A', author: 'user_a' }],
    });

    // Assert
    assert.deepEqual(service.getRecord('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      country: null,
      groups: [
        {
          id: 'group_a',
          name: 'Group A',
          members: [
            {
              id: 'user_a',
              name: 'User A',
              country: null,
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
            country: null,
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
          },
        },
      ],
    });
    assert.deepEqual(service.getRecord('group', 'group_b'), {
      id: 'group_b',
      name: 'Group B',
      members: [],
    });
    assert.deepEqual(service.getRecord('post', 'post_b'), {
      id: 'post_b',
      message: 'Post B',
      author: null,
    });
  });

  test('should trigger subscriptions when updating the record for a model', function (assert) {
    assert.expect(1);

    // Arrange
    const route = {
      routeName: 'foo',

      on() {},
      refresh() {},
    };
    const refreshSpy = sinon.spy(route, 'refresh');
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [{ id: 'user_a', name: 'Foo' }]);
    service.subscribe(route);

    // Act
    service.updateRecord('user', 'user_a', { name: 'Test' });

    // Assert
    assert.ok(refreshSpy.calledOnce);
  });

  test('should throw when record to update does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    try {
      // Act
      service.updateRecord('user', 'user_a', { name: 'Test' });
    } catch (error) {
      // Assert
      assert.equal(error.message, 'Record doesn\'t exist');
    }
  });

  test('should delete a record for a model', function (assert) {
    assert.expect(2);

    // Arrange
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [{ id: 'user_a', name: 'Foo' }]);

    // Act
    service.deleteRecord('user', 'user_a');

    // Assert
    assert.equal(service.getAll('user').length, 0);
    assert.equal(service.getRecord('user', 'user_a'), null);
  });

  test('should update relationships when delete a record for a model', function (assert) {
    assert.expect(3);

    // Arrange
    const users = [
      {
        id: 'user_a',
        name: 'User A',
        country: 'country_a',
        groups: ['group_a'],
        posts: ['post_a'],
      },
    ];
    const country = { id: 'monaco', name: 'Monaco' };
    const group = { id: 'group_a', name: 'Group A', members: ['user_a'] };
    const post = { id: 'post_a', message: 'Post A', author: 'user_a' };
    const service = this.owner.lookup('service:store');

    service.setRecord('user', users);
    service.setRecord('country', [country]);
    service.setRecord('group', [group]);
    service.setRecord('post', [post]);

    // Act
    service.deleteRecord('user', 'user_a');

    // Assert
    assert.equal(service.getAll('user').length, 0);
    assert.deepEqual(service.getRecord('group', 'group_a'), {
      id: 'group_a',
      name: 'Group A',
      members: [],
    });
    assert.deepEqual(service.getRecord('post', 'post_a'), {
      id: 'post_a',
      message: 'Post A',
      author: null,
    });
  });

  test('should trigger subscriptions when deleting the record for a model', function (assert) {
    assert.expect(1);

    // Arrange
    const route = {
      routeName: 'foo',

      on() {},
      refresh() {},
    };
    const refreshSpy = sinon.spy(route, 'refresh');
    const service = this.owner.lookup('service:store');

    service.setRecord('user', [{ id: 'user_a', name: 'Foo' }]);
    service.subscribe(route);

    // Act
    service.deleteRecord('user', 'user_a');

    // Assert
    assert.ok(refreshSpy.calledOnce);
  });

  test('should throw when record to delete does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    try {
      // Act
      service.deleteRecord('user', 'user_a');
    } catch (error) {
      // Assert
      assert.equal(error.message, 'Record doesn\'t exist');
    }
  });

  test('should get batch instance', function (assert) {
    assert.expect(1);

    // Arrange
    const service = this.owner.lookup('service:store');

    // Act
    const result = service.batch();

    // Assert
    assert.ok(result instanceof Batch);
  });
});
