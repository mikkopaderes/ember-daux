# API

## Table of Contents

- [Daux.Core.Batch](#dauxcorebatch)
  - [Functions](#functions)
    - [commit](#commit)
    - [delete](#delete)
    - [set](#set)
    - [update](#update)
- [Daux.Core.Model](#dauxcoremodel)
  - [Static Properties](#static-properties)
    - [attributes](#attributes)
    - [relationship](#relationship)
  - [Static Functions](#static-functions)
    - [deserialize](#deserialize)
- [Daux.Core.Store](#dauxcorestore)
  - [Functions](#functions-1)
    - [batch](#batch)
    - [delete](#delete-1)
    - [getAll](#getall)
    - [get](#get)
    - [query](#query)
    - [set](#set-1)
    - [subscribe](#subscribe)
    - [update](#update-1)

## Daux.Core.Batch

### Functions

#### commit

Commits the batched operations

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| option | Object | optional   |             |

### delete

Batch a delete operation

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |

### set

Batch a set operation

##### Params:

| Name    | Type   | Attributes | Description |
| --------| ------ | ---------- | ------------|
| type    | string |            |             |
| record  | Object |            |             |

### update

Batch an update operation

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |
| record | Object |            |             |

## Daux.Core.Model

### Static Properties

#### attributes

Override this and return the attribute (non-relationship) names for a model

##### Returns:

Array of attribute names

Type: Array

#### relationship

Override this and return the relationship descriptor for a model

e.g.

```javascript
static get relationship() {
  return {
    country: {
      type: 'country',
      kind: 'belongsTo',
      inverse: null,
    },
    posts: {
      type: 'post',
      kind: 'hasMany',
      inverse: 'author',
    }
  };
}
```

##### Returns:

Object containing the relationship descriptors

Type: Object

### Static Functions

#### deserialize

Override this hook to deserialize your response if necessary

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| record | Object |            |             |

##### Returns:

Deserialized record

Type: Object

## Daux.Core.Store

### Functions

#### batch

Returns a `Daux.Core.Batch` class used for batching operations.

This is for the case where you want to update the state multiple times sequentially while just triggering the listeners for the subscribed Routes **once**.

e.g.

```javascript
const batch = store.batch();

batch.update('user', 'user_a', { name: 'Foo' });
batch.delete('user', 'user_b');
batch.commit();
```

##### Returns:

Instance of the `Daux.Core.Batch`

Type: `Daux.Core.Batch`

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

Sets a record for a type.

This accepts the following option:

- `isBackgroundOperation` - When true, this won't execute the listeners for the subscribed Routes.

##### Params:

| Name    | Type   | Attributes | Description |
| --------| ------ | ---------- | ------------|
| type    | string |            |             |
| record  | Object |            |             |
| option  | Object | optional   |             |

#### subscribe

Subscribes for any changes in the state.

##### Params:

| Name     | Type        | Attributes | Description |
| -------- | ----------- | ---------- | ------------|
| callback | callback    |            |             |

##### Returns:

Function that you can call to unsubscribe from changes.

Type: Function

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
