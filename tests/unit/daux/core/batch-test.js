import { module, test } from 'qunit';

import sinon from 'sinon';

import Batch from 'ember-daux/daux/core/batch';

module('Unit | Core | batch', function () {
  test('should execute the batched operations sequentially without option', function (assert) {
    assert.expect(7);

    // Arrange
    const recordsToSet = [
      {
        id: 'user_a',
        name: 'User A',
      },
      {
        id: 'user_b',
        name: 'User B',
      },
    ];
    const recordToAdd = { id: 'user_100', name: '100' };
    const recordToUpdateNewAttribute = { name: 'Foowey' };
    const recordIdToDelete = 'user_b';
    const setStub = sinon.stub();
    const addStub = sinon.stub();
    const updateStub = sinon.stub();
    const deleteStub = sinon.stub();
    const store = {
      set: setStub,
      add: addStub,
      update: updateStub,
      delete: deleteStub,
    };
    const batch = new Batch(store);

    // Act
    batch.set('user', recordsToSet);
    batch.add('user', recordToAdd);
    batch.update('user', 'user_a', recordToUpdateNewAttribute);
    batch.delete('user', recordIdToDelete);
    batch.commit();

    // Assert
    assert.ok(setStub.calledWithExactly('user', recordsToSet, {
      isBackgroundOperation: true,
    }));
    assert.ok(addStub.calledWithExactly('user', recordToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addStub.calledAfter(setStub));
    assert.ok(updateStub.calledWithExactly('user', 'user_a', recordToUpdateNewAttribute, {
      isBackgroundOperation: true,
    }));
    assert.ok(updateStub.calledAfter(addStub));
    assert.ok(deleteStub.calledWithExactly('user', recordIdToDelete, {
      isBackgroundOperation: false,
    }));
    assert.ok(deleteStub.calledAfter(updateStub));
  });

  test('should execute the batched operations sequentially with option', function (assert) {
    assert.expect(7);

    // Arrange
    const recordsToSet = [
      {
        id: 'user_a',
        name: 'User A',
      },
      {
        id: 'user_b',
        name: 'User B',
      },
    ];
    const recordToAdd = { id: 'user_100', name: '100' };
    const recordToUpdateNewAttribute = { name: 'Foowey' };
    const recordIdToDelete = 'user_b';
    const setStub = sinon.stub();
    const addStub = sinon.stub();
    const updateStub = sinon.stub();
    const deleteStub = sinon.stub();
    const store = {
      set: setStub,
      add: addStub,
      update: updateStub,
      delete: deleteStub,
    };
    const batch = new Batch(store);

    // Act
    batch.set('user', recordsToSet);
    batch.add('user', recordToAdd);
    batch.update('user', 'user_a', recordToUpdateNewAttribute);
    batch.delete('user', recordIdToDelete);
    batch.commit({ isBackgroundOperation: true });

    // Assert
    assert.ok(setStub.calledWithExactly('user', recordsToSet, {
      isBackgroundOperation: true,
    }));
    assert.ok(addStub.calledWithExactly('user', recordToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addStub.calledAfter(setStub));
    assert.ok(updateStub.calledWithExactly('user', 'user_a', recordToUpdateNewAttribute, {
      isBackgroundOperation: true,
    }));
    assert.ok(updateStub.calledAfter(addStub));
    assert.ok(deleteStub.calledWithExactly('user', recordIdToDelete, {
      isBackgroundOperation: true,
    }));
    assert.ok(deleteStub.calledAfter(updateStub));
  });
});
