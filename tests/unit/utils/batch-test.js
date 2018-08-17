import { module, test } from 'qunit';

import sinon from 'sinon';

import Batch from 'ember-daux/utils/batch';

module('Unit | Utility | batch', function () {
  test('should execute the batched operations sequentially without option', function (assert) {
    assert.expect(11);

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
    const relationshipToAdd = { id: 'repo_a', name: 'Repo A' };
    const relationshipToRemove = { id: 'repo_b', name: 'Repo B' };
    const setRecordStub = sinon.stub();
    const addRecordStub = sinon.stub();
    const updateRecordStub = sinon.stub();
    const deleteRecordStub = sinon.stub();
    const addRelationshipStub = sinon.stub();
    const removeRelationshipStub = sinon.stub();
    const store = {
      setRecord: setRecordStub,
      addRecord: addRecordStub,
      updateRecord: updateRecordStub,
      deleteRecord: deleteRecordStub,
      relationship: sinon.stub().returns({
        add: addRelationshipStub,
        remove: removeRelationshipStub,
      }),
    };
    const batch = new Batch(store);

    // Act
    batch.setRecord('user', recordsToSet);
    batch.addRecord('user', recordToAdd);
    batch.updateRecord('user', 'user_a', recordToUpdateNewAttribute);
    batch.deleteRecord('user', recordIdToDelete);
    batch.addRelationship('user', 'user_a', 'repos', relationshipToAdd);
    batch.removeRelationship('user', 'user_a', 'repos', relationshipToRemove);
    batch.commit();

    // Assert
    assert.ok(setRecordStub.calledWithExactly('user', recordsToSet, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRecordStub.calledWithExactly('user', recordToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRecordStub.calledAfter(setRecordStub));
    assert.ok(updateRecordStub.calledWithExactly('user', 'user_a', recordToUpdateNewAttribute, {
      isBackgroundOperation: true,
    }));
    assert.ok(updateRecordStub.calledAfter(addRecordStub));
    assert.ok(deleteRecordStub.calledWithExactly('user', recordIdToDelete, {
      isBackgroundOperation: true,
    }));
    assert.ok(deleteRecordStub.calledAfter(updateRecordStub));
    assert.ok(addRelationshipStub.calledWithExactly('user', 'user_a', 'repos', relationshipToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRelationshipStub.calledAfter(deleteRecordStub));
    assert.ok(removeRelationshipStub.calledWithExactly(
      'user',
      'user_a',
      'repos',
      relationshipToRemove,
      { isBackgroundOperation: false },
    ));
    assert.ok(removeRelationshipStub.calledAfter(addRelationshipStub));
  });

  test('should execute the batched operations sequentially with option', function (assert) {
    assert.expect(11);

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
    const relationshipToAdd = { id: 'repo_a', name: 'Repo A' };
    const relationshipToRemove = { id: 'repo_b', name: 'Repo B' };
    const setRecordStub = sinon.stub();
    const addRecordStub = sinon.stub();
    const updateRecordStub = sinon.stub();
    const deleteRecordStub = sinon.stub();
    const addRelationshipStub = sinon.stub();
    const removeRelationshipStub = sinon.stub();
    const store = {
      setRecord: setRecordStub,
      addRecord: addRecordStub,
      updateRecord: updateRecordStub,
      deleteRecord: deleteRecordStub,
      relationship: sinon.stub().returns({
        add: addRelationshipStub,
        remove: removeRelationshipStub,
      }),
    };
    const batch = new Batch(store);

    // Act
    batch.setRecord('user', recordsToSet);
    batch.addRecord('user', recordToAdd);
    batch.updateRecord('user', 'user_a', recordToUpdateNewAttribute);
    batch.deleteRecord('user', recordIdToDelete);
    batch.addRelationship('user', 'user_a', 'repos', relationshipToAdd);
    batch.removeRelationship('user', 'user_a', 'repos', relationshipToRemove);
    batch.commit({ isBackgroundOperation: true });

    // Assert
    assert.ok(setRecordStub.calledWithExactly('user', recordsToSet, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRecordStub.calledWithExactly('user', recordToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRecordStub.calledAfter(setRecordStub));
    assert.ok(updateRecordStub.calledWithExactly('user', 'user_a', recordToUpdateNewAttribute, {
      isBackgroundOperation: true,
    }));
    assert.ok(updateRecordStub.calledAfter(addRecordStub));
    assert.ok(deleteRecordStub.calledWithExactly('user', recordIdToDelete, {
      isBackgroundOperation: true,
    }));
    assert.ok(deleteRecordStub.calledAfter(updateRecordStub));
    assert.ok(addRelationshipStub.calledWithExactly('user', 'user_a', 'repos', relationshipToAdd, {
      isBackgroundOperation: true,
    }));
    assert.ok(addRelationshipStub.calledAfter(deleteRecordStub));
    assert.ok(removeRelationshipStub.calledWithExactly(
      'user',
      'user_a',
      'repos',
      relationshipToRemove,
      { isBackgroundOperation: true },
    ));
    assert.ok(removeRelationshipStub.calledAfter(addRelationshipStub));
  });
});
