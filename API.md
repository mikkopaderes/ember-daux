# API

## Table of Contents

- [Daux.Core.Store](#dauxcorestore)
  - [Functions](#functions)
    - [subscribe](#subscribe)
    - [getAll](#getall)
    - [get](#get)
    - [query](#query)
    - [set](#set)
    - [add](#add)
    - [update](#update)
    - [delete](#delete)

## Daux.Core.Store

### Functions

#### subscribe

Subscribes for any changes in the state.

##### Params:

| Name     | Type        | Attributes | Description |
| -------- | ----------- | ---------- | ------------|
| callback | callback    |            |             |

##### Returns:

Function that you can call to unsubscribe from changes.

Type: Function

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

#### get

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

#### set

Sets (overwrites completely) the records for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name    | Type           | Attributes | Description |
| --------| -------------- | ---------- | ------------|
| type    | string         |            |             |
| records | Array.<Object> |            |             |
| option  | Object         | optional   |             |

#### add

Adds a record for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name   | Type    | Attributes | Description |
| -------| ------- | ---------- | ------------|
| type   | string  |            |             |
| record | Object  |            |             |
| option | Object  | optional   |             |

#### update

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

#### delete

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

- `batch.set(type, records)`
- `batch.add(type, record)`
- `batch.update(type, id, attribute)`
- `batch.delete(type, id)`
- `batch.commit(option)`
  - Accepts the following option:
    - `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

e.g.

```javascript
const batch = store.batch();

batch.update('user', 'user_a', { name: 'Foo' });
batch.delete('user', 'user_b');
batch.commit();
```

##### Returns:

Instance of the `Batch`

Type: `Daux.Core.Batch`
