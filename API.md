# API

## Table of Contents

- [Service.Store](#servicestore)
  - [Functions](#functions)
    - [subscribe](#subscribe)
    - [getAll](#getall)
    - [getRecord](#getrecord)
    - [query](#query)
    - [setRecord](#setrecord)
    - [addRecord](#addrecord)
    - [updateRecord](#updaterecord)
    - [deleteRecord](#deleterecord)

## Service.Store

### Functions

#### subscribe

Subscribes a Route for any changes in the state.

Whenever the state changes, all subscribed Routes will call their `refresh()` function.

##### Params:

| Name  | Type        | Attributes | Description |
| ----- | ----------- | ---------- | ------------|
| route | Ember.Route |            |             |

#### getAll

Gets all the records for a type.

When `fetch` is unavailable, this will return the cached records in the store. Otherwise, this returns a promise that resolves to whatever gets resolved in `fetch`.

`fetch` will be skipped even when passed-in if all records are in the cache already.

##### Params:

| Name   | Type     | Attributes | Description                                             |
| -----  | -------- | ---------- | ------------------------------------------------------- |
| type   | string   |            |                                                         |
| fetch  | callback | optional   | Must return a promise that resolves to the fetched data |

##### Returns:

All the records for a type

Type: Array | Promise

#### getRecord

Gets the record for a type and ID.

When `fetch` is unavailable, this will return the cached record in the store. Otherwise, this returns a promise that resolves to whatever gets resolved in `fetch`.

`fetch` will be skipped even when passed-in if the record is in the cache already.

##### Params:

| Name   | Type     | Attributes | Description                                             |
| ------ | -------- | ---------- | --------------------------------------------------------|
| type   | string   |            |                                                         |
| id     | string   |            |                                                         |
| fetch  | callback | optional   | Must return a promise that resolves to the fetched data |

##### Returns:

Record for the type and ID

Type: Object | Promise | undefined

#### query

Queries records for a type.

Unlike `getAll()`, this will never return cached data.

##### Params:

| Name  | Type     | Attributes | Description                                             |
| ------| -------- | ---------- | ------------------------------------------------------- |
| type  | string   |            |                                                         |
| fetch | callback |            | Must return a promise that resolves to the fetched data |

##### Returns:

Queried records

Type: Promise

#### setRecord

Sets (overwrites completely) the records for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name    | Type           | Attributes | Description |
| --------| -------------- | ---------- | ------------|
| type    | string         |            |             |
| records | Array.<Object> |            |             |
| option  | Object         | optional   |             |

#### addRecord

Adds a record for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name   | Type    | Attributes | Description |
| -------| ------- | ---------- | ------------|
| type   | string  |            |             |
| record | Object  |            |             |
| option | Object  | optional   |             |

#### updateRecord

Updates a record for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |
| record | Object |            |             |
| option | Object | optional   |             |

#### deleteRecord

Deletes a record for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |
| option | Object | optional   |             |

#### batch

Returns a `Batch` class used for batching operations.

This is for the case where you want to update the state multiple times sequentially while just triggering the listeners for the subscribed Routes **once**.

This exposes the following functions:

- `batch.setRecord(type, records)`
- `batch.addRecord(type, record)`
- `batch.updateRecord(type, id, attribute)`
- `batch.deleteRecord(type, id)`
- `batch.commit(option)`
  - Accepts the following option:
    - `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

e.g.

```javascript
const batch = store.batch();

batch.updateRecord('user', 'user_a', { name: 'Foo' });
batch.deleteRecord('user', 'user_b');
batch.commit();
```

##### Returns:

Instance of the `Batch`

Type: `Utility.Batch`
