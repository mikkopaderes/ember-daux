import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import sinon from 'sinon';

module('Unit | Service | store', function (hooks) {
  setupTest(hooks);

  module('function: getAll', function () {
    test('should return all records for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      service.setRecord('user', records);

      // Act
      const result = service.getAll('user');

      // Assert
      assert.deepEqual(result, records);
    });

    test('should return all records for a type using a callback', async function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      // Act
      const result = await service.getAll('user', () => Promise.resolve(records));

      // Assert
      assert.deepEqual(result, records);
    });

    test('should return all records for a type using cache', async function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      await service.getAll('user', () => Promise.resolve(records));

      // Act
      const result = service.getAll('user', () => Promise.resolve(records));

      // Assert
      assert.deepEqual(result, records);
    });

    test('should return an empty array when records for a type does not exist', function (assert) {
      assert.expect(1);

      // Arrange
      const service = this.owner.lookup('service:store');

      // Act
      const result = service.getAll('user');

      // Assert
      assert.deepEqual(result, []);
    });
  });

  module('function: getRecord', function () {
    test('should return specific record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      service.setRecord('user', records);

      // Act
      const result = service.getRecord('user', 'user_a');

      // Assert
      assert.deepEqual(result, records[0]);
    });

    test('should return specific record for a type using a callback', async function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'Foo' };
      const service = this.owner.lookup('service:store');

      // Act
      const result = await service.getRecord('user', 'user_a', () => Promise.resolve(record));

      // Assert
      assert.deepEqual(result, record);
    });

    test('should return specific record for a type using cache', async function (assert) {
      assert.expect(1);

      // Arrange
      const record = { id: 'user_a', name: 'Foo' };
      const service = this.owner.lookup('service:store');

      await service.getRecord('user', 'user_a', () => Promise.resolve(record));

      // Act
      const result = service.getRecord('user', 'user_a', () => Promise.resolve(record));

      // Assert
      assert.deepEqual(result, record);
    });

    test('should return undefined when record for a type does not exist', function (assert) {
      assert.expect(1);

      // Arrange
      const service = this.owner.lookup('service:store');

      // Act
      const result = service.getRecord('user', 'user_a');

      // Assert
      assert.equal(result, undefined);
    });
  });

  module('function: query', function () {
    test('should return all fetched records for a type', async function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      // Act
      const result = await service.query('user', () => Promise.resolve(records));

      // Assert
      assert.deepEqual(result, records);
    });

    test('should cache all fetched records for a type', async function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      await service.query('user', () => Promise.resolve(records));

      // Act
      const result = service.getAll('user');

      // Assert
      assert.deepEqual(result, records);
    });
  });

  module('function: setRecord', function () {
    test('should set the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const service = this.owner.lookup('service:store');

      // Act
      service.setRecord('user', records);

      // Assert
      assert.deepEqual(service.getAll('user'), records);
    });

    test('should trigger subscriptions when setting the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const records = [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ];
      const route = {
        routeName: 'foo',

        on() {},
        refresh() {},
      };
      const refreshSpy = sinon.spy(route, 'refresh');
      const service = this.owner.lookup('service:store');

      service.subscribe(route);

      // Act
      service.setRecord('user', records);

      // Assert
      assert.ok(refreshSpy.calledOnce);
    });
  });

  module('function: addRecord', function () {
    test('should add the record for a type', function (assert) {
      assert.expect(2);

      // Arrange
      const recordToAdd = { id: 'user_100', name: 'Foobar' };
      const service = this.owner.lookup('service:store');

      // Act
      service.addRecord('user', recordToAdd);

      // Assert
      assert.equal(service.getAll('users').length, 1);
      assert.deepEqual(service.getRecord('user', 'user_100'), recordToAdd);
    });

    test('should trigger subscriptions when adding the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const recordToAdd = { id: 'user_100', name: 'Foobar' };
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
  });

  module('function: updateRecord', function () {
    test('should update the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const service = this.owner.lookup('service:store');

      service.setRecord('user', [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ]);

      // Act
      service.updateRecord('user', 'user_a', { name: 'Test' });

      // Assert
      assert.deepEqual(service.getRecord('user', 'user_a'), {
        id: 'user_a',
        name: 'Test',
      });
    });

    test('should trigger subscriptions when updating the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const route = {
        routeName: 'foo',

        on() {},
        refresh() {},
      };
      const refreshSpy = sinon.spy(route, 'refresh');
      const service = this.owner.lookup('service:store');

      service.setRecord('user', [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ]);
      service.subscribe(route);

      // Act
      service.updateRecord('user', 'user_a', { name: 'Test' });

      // Assert
      assert.ok(refreshSpy.calledOnce);
    });

    test('should throw when record does not exist', function (assert) {
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
  });

  module('function: deleteRecord', function () {
    test('should delete the record for a type', function (assert) {
      assert.expect(2);

      // Arrange
      const service = this.owner.lookup('service:store');

      service.setRecord('user', [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ]);

      // Act
      service.deleteRecord('user', 'user_a');

      // Assert
      assert.equal(service.getAll('user').length, 1);
      assert.equal(service.getRecord('user', 'user_a'), undefined);
    });

    test('should trigger subscriptions when deleting the record for a type', function (assert) {
      assert.expect(1);

      // Arrange
      const route = {
        routeName: 'foo',

        on() {},
        refresh() {},
      };
      const refreshSpy = sinon.spy(route, 'refresh');
      const service = this.owner.lookup('service:store');

      service.setRecord('user', [
        {
          id: 'user_a',
          name: 'Foo',
        },
        {
          id: 'user_b',
          name: 'Bar',
        },
      ]);
      service.subscribe(route);

      // Act
      service.deleteRecord('user', 'user_a');

      // Assert
      assert.ok(refreshSpy.calledOnce);
    });

    test('should throw when record does not exist', function (assert) {
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
  });
});
