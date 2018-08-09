# API

## Table of Contents

- [Service.Store](#service.store)
  - [Functions](#functions)
    - [getAll](#getall)
    - [getRecord](#getrecord)
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

When `fetchCallback` is unavailable, this will return the cached records in the store. Otherwise, this returns a promise that resolves to whatever gets resolved in `fetchCallback`.

`fetchCallback` will be skipped even when passed-in if all records are in the cache already.

##### Params:

| Name          | Type     | Attributes | Description                                             |
| ------------- | -------- | ---------- | ------------------------------------------------------- |
| type          | string   |            |                                                         |
| fetchCallback | callback | optional   | Must return a promise that resolves to the fetched data |

##### Returns:

All the records for a type

Type: Array | Promise

#### getRecord

Gets the record for a type and ID.

When `fetchCallback` is unavailable, this will return the cached record in the store. Otherwise, this returns a promise that resolves to whatever gets resolved in `fetchCallback`.

`fetchCallback` will be skipped even when passed-in if the record is in the cache already.

##### Params:

| Name          | Type     | Attributes | Description                                             |
| ------------- | -------- | ---------- | --------------------------------------------------------|
| type          | string   |            |                                                         |
| id            | string   |            |                                                         |
| fetchCallback | callback | optional   | Must return a promise that resolves to the fetched data |

##### Returns:

Record for the type and ID

Type: Object | Promise | undefined

#### setRecord

Sets (overwrites) the records for a type

##### Params:

| Name    | Type           | Attributes | Description |
| --------| -------------- | ---------- | ------------|
| type    | string         |            |             |
| records | Array.<Object> |            |             |

#### addRecord

Adds a record for a type

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| record | Object |            |             |

#### updateRecord

Updates a record for a type

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |
| record | Object |            |             |

#### deleteRecord

Deletes a record for a type

##### Params:

| Name   | Type   | Attributes | Description |
| -------| -------| ---------- | ------------|
| type   | string |            |             |
| id     | string |            |             |
