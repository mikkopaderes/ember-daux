import QUnit, { module, test } from 'qunit';

import sinon from 'sinon';

import { Store } from 'ember-daux/daux';
import Batch from 'ember-daux/daux/core/batch';
import model from '../../../helpers/model';

module('Unit | Core | store', function () {
  QUnit.dump.maxDepth = 10;

  test('should set record without relationship', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    store.set('user', { id: 'user_a', name: 'User A' });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });
  });

  test('should set record with embedded relationship', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    store.set('user', {
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
      groups: [{ id: 'group_a', name: 'Group A', members: ['user_a', 'user_c'] }],
      posts: [{ id: 'post_a', message: 'Post A', author: 'user_a' }],
      username: { id: 'username_a', user: 'user_a' },
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
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
          members: [
            {
              id: 'user_a',
              name: 'User A',
              blockedUsers: ['user_b'],
              country: 'monaco',
              groups: ['group_a'],
              posts: ['post_a'],
              username: 'username_a',
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
            blockedUsers: ['user_b'],
            country: 'monaco',
            groups: ['group_a'],
            posts: ['post_a'],
            username: 'username_a',
          },
        },
      ],
      username: {
        id: 'username_a',
        user: {
          id: 'user_a',
          name: 'User A',
          blockedUsers: ['user_b'],
          country: 'monaco',
          groups: ['group_a'],
          posts: ['post_a'],
          username: 'username_a',
        },
      },
    });
  });

  test('should set record with non-embedded relationship', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    store.set('user', {
      id: 'user_a',
      name: 'User A',
      blockedUsers: ['user_b'],
      country: 'm0naco',
      groups: ['group_a'],
      posts: ['post_a'],
      username: 'username_a',
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [
        {
          id: 'user_b',
          name: null,
          blockedUsers: [],
          country: null,
          groups: [],
          posts: [],
          username: null,
        },
      ],
      country: { id: 'monaco', name: null },
      groups: [
        {
          id: 'group_a',
          name: null,
          members: [
            {
              id: 'user_a',
              name: 'User A',
              blockedUsers: ['user_b'],
              country: 'monaco',
              groups: ['group_a'],
              posts: ['post_a'],
              username: 'username_a',
            },
          ],
        },
      ],
      posts: [
        {
          id: 'post_a',
          message: null,
          author: {
            id: 'user_a',
            name: 'User A',
            blockedUsers: ['user_b'],
            country: 'monaco',
            groups: ['group_a'],
            posts: ['post_a'],
            username: 'username_a',
          },
        },
      ],
      username: {
        id: 'username_a',
        user: {
          id: 'user_a',
          name: 'User A',
          blockedUsers: ['user_b'],
          country: 'monaco',
          groups: ['group_a'],
          posts: ['post_a'],
          username: 'username_a',
        },
      },
    });
  });

  test('should throw error when setting a record without ID', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    try {
      // Act
      store.set('user', { name: 'User A' });
    } catch (error) {
      // Assert
      assert.equal(error.message, 'Record to set has no ID');
    }
  });

  test('should sync new one-to-one relationship when setting record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('username', { id: 'username_a' });

    // Act
    store.set('user', {
      id: 'user_a',
      name: 'User A',
      username: 'username_a',
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: {
        id: 'username_a',
        user: {
          id: 'user_a',
          name: 'User A',
          blockedUsers: [],
          country: null,
          groups: [],
          posts: [],
          username: 'username_a',
        },
      },
    });
    assert.equal(store.get('username', 'username_a').user.id, 'user_a');
  });

  test('should sync new one-to-many relationship when setting record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('post', { id: 'post_a', author: 'user_a' });

    // Act
    store.set('user', {
      id: 'user_a',
      name: 'User A',
      posts: ['post_a'],
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [
        {
          id: 'post_a',
          message: null,
          author: {
            id: 'user_a',
            name: 'User A',
            blockedUsers: [],
            country: null,
            groups: [],
            posts: ['post_a'],
            username: null,
          },
        },
      ],
      username: null,
    });
    assert.equal(store.get('post', 'post_a').author.id, 'user_a');
  });

  test('should sync new many-to-many relationship when setting record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('group', { id: 'group_a', members: ['user_a'] });

    // Act
    store.set('user', {
      id: 'user_a',
      name: 'User A',
      groups: ['group_a'],
    });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [
        {
          id: 'group_a',
          name: null,
          members: [
            {
              id: 'user_a',
              name: 'User A',
              blockedUsers: [],
              country: null,
              groups: ['group_a'],
              posts: [],
              username: null,
            },
          ],
        },
      ],
      posts: [],
      username: null,
    });
    assert.equal(store.get('group', 'group_a').members[0].id, 'user_a');
  });

  test('should trigger subscription when setting record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.subscribe(stub);

    // Act
    store.set('user', { id: 'user_a' });

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
    store.set('user', { id: 'user_a' }, { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should call set when updating record', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);
    const setStub = sinon.spy(store, 'set');

    store.set('user', { id: 'user_a', name: 'User A' });

    // Act
    store.update('user', 'user_a', { country: { id: 'monaco', name: 'Monaco' } });

    // Assert
    assert.ok(setStub.calledWithExactly('user', {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: { id: 'monaco', name: 'Monaco' },
      groups: [],
      posts: [],
      username: null,
    }, { isBackgroundOperation: true, isDeserialized: true }));
  });

  test('throw error when updating a record that does not exist', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    try {
      // Act
      store.update('user', { id: 'user_a' });
    } catch (error) {
      // Assert
      assert.equal(error.message, 'Record doesn\'t exist');
    }
  });

  test('should sync removed one-to-one relationship when updating record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('user', {
      id: 'user_a',
      name: 'User A',
      username: 'username_a',
    });

    // Act
    store.update('user', 'user_a', { username: null });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });
    assert.equal(store.get('username', 'username_a').user, null);
  });

  test('should sync removed one-to-many relationship when setting record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('user', {
      id: 'user_a',
      name: 'User A',
      posts: ['post_a'],
    });

    // Act
    store.update('user', 'user_a', { posts: [] });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });
    assert.equal(store.get('post', 'post_a').author, null);
  });

  test('should sync removed many-to-many relationship when setting record', function (assert) {
    assert.expect(2);

    // Arrange
    const store = new Store(model);

    store.set('user', {
      id: 'user_a',
      name: 'User A',
      groups: ['group_a'],
    });

    // Act
    store.update('user', 'user_a', { groups: [] });

    // Assert
    assert.deepEqual(store.get('user', 'user_a'), {
      id: 'user_a',
      name: 'User A',
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    });
    assert.deepEqual(store.get('group', 'group_a').members, []);
  });

  test('should trigger subscription when updating record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.set('user', { id: 'user_a' });
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

    store.set('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.update('user', 'user_a', { name: 'Foo' }, { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should call update when deleting record', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);
    const updateStub = sinon.spy(store, 'update');

    store.set('user', { id: 'user_a', name: 'User A' });

    // Act
    store.delete('user', 'user_a');

    // Assert
    assert.ok(updateStub.calledWithExactly('user', 'user_a', {
      name: null,
      blockedUsers: [],
      country: null,
      groups: [],
      posts: [],
      username: null,
    }, { isBackgroundOperation: true }));
  });

  test('should delete a record for a model type', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    store.set('user', { id: 'user_a', name: 'User A' });

    // Act
    store.delete('user', 'user_a');

    // Assert
    assert.equal(store.get('user', 'user_a'), null);
  });

  test('should trigger subscription when deleting record', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);

    store.set('user', { id: 'user_a' });
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

    store.set('user', { id: 'user_a' });
    store.subscribe(stub);

    // Act
    store.delete('user', 'user_a', { isBackgroundOperation: true });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should not trigger subscription when unsubscribing', function (assert) {
    assert.expect(1);

    // Arrange
    const stub = sinon.stub();
    const store = new Store(model);
    const unsubscribe = store.subscribe(stub);

    unsubscribe();

    // Act
    store.set('user', { id: 'user_a' });

    // Assert
    assert.ok(stub.notCalled);
  });

  test('should return an instance of Daux.Core.Batch when calling batch', function (assert) {
    assert.expect(1);

    // Arrange
    const store = new Store(model);

    // Act
    const result = store.batch();

    // Assert
    assert.ok(result instanceof Batch);
  });

  test('should get record for a model type using cache', function (assert) {
    assert.expect(1);

    // Arrange
    const user = { id: 'user_a', name: 'User A' };
    const store = new Store(model);

    store.set('user', user);

    // Act
    const result = store.get('user', 'user_a');

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

  test('should call set when getting a non-cached record using a promise', async function (assert) {
    assert.expect(1);

    // Arrange
    const user = { id: 'user_a', name: 'User A' };
    const store = new Store(model);
    const setSpy = sinon.spy(store, 'set');

    // Act
    await store.get('user', 'user_a', () => Promise.resolve(user));

    // Assert
    assert.ok(setSpy.calledWithExactly('user', user, { isBackgroundOperation: true }));
  });

  test('should call set when getting a cached but unpopulated record using a promise', async function (assert) {
    assert.expect(1);

    // Arrange
    const user = { id: 'user_a', name: 'User A' };
    const store = new Store(model);
    const setSpy = sinon.spy(store, 'set');

    store.set('user', { id: 'user_a', country: 'monaco' });

    // Act
    await store.get('user', 'user_a', () => Promise.resolve(user));

    // Assert
    assert.ok(setSpy.calledWithExactly('user', user, { isBackgroundOperation: true }));
  });

  test('should get record for a model type using a promise', async function (assert) {
    assert.expect(1);

    // Arrange
    const user = { id: 'user_a', name: 'User A' };
    const store = new Store(model);

    // Act
    const result = await store.get('user', 'user_a', () => Promise.resolve(user));

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

  test('should call set per every record when getting all for a model type using a promise', async function (assert) {
    assert.expect(2);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }, { id: 'user_b', name: 'User B' }];
    const store = new Store(model);
    const setSpy = sinon.spy(store, 'set');

    // Act
    await store.getAll('user', () => Promise.resolve(users));

    // Assert
    assert.ok(setSpy.firstCall.calledWithExactly('user', users[0], {
      isBackgroundOperation: true,
    }));
    assert.ok(setSpy.secondCall.calledWithExactly('user', users[1], {
      isBackgroundOperation: true,
    }));
  });

  test('should get all record for a model type using a promise', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }, { id: 'user_b', name: 'User B' }];
    const store = new Store(model);

    // Act
    const result = await store.getAll('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: null,
        groups: [],
        posts: [],
        username: null,
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

  test('should call set per every record when querying for a model type using a promise', async function (assert) {
    assert.expect(2);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }, { id: 'user_b', name: 'User B' }];
    const store = new Store(model);
    const setSpy = sinon.spy(store, 'set');

    // Act
    await store.query('user', () => Promise.resolve(users));

    // Assert
    assert.ok(setSpy.firstCall.calledWithExactly('user', users[0], {
      isBackgroundOperation: true,
    }));
    assert.ok(setSpy.secondCall.calledWithExactly('user', users[1], {
      isBackgroundOperation: true,
    }));
  });

  test('should query records for a model type using a promise', async function (assert) {
    assert.expect(1);

    // Arrange
    const users = [{ id: 'user_a', name: 'User A' }, { id: 'user_b', name: 'User B' }];
    const store = new Store(model);

    // Act
    const result = await store.query('user', () => Promise.resolve(users));

    // Assert
    assert.deepEqual(result, [
      {
        id: 'user_a',
        name: 'User A',
        blockedUsers: [],
        country: null,
        groups: [],
        posts: [],
        username: null,
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
});
