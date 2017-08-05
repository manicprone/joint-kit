# Joint Lib

A Node server library for rapidly implementing persisted data action logic.


> Part of the Joint Stack


## Table of Contents

* [Prerequisites][#prerequisites]
* [Install][#install]
* [How to Use the Library][#how-to-use-the-library]
* [Joint Actions][#joint-actions]
* [The Joint Stack][#the-joint-stack]
* [License][#license]


## Prerequisites

To use the Joint Library, you need:

* a supported persistence solution / database (e.g. Postgres)
* a superuser account
* a supported service interface / ORM (e.g. Bookshelf)

The Joint Library currently supports:

| Service                                 | Persistence Options          |
| --------------------------------------- | ---------------------------- |
| [Bookshelf][http://bookshelfjs.org/]    | Postgres, MySQL, SQLite3     |


## Install

``` sh
$ npm install joint-lib --save
```


## How to Use the Library

[TBC]


## Joint Actions

| Action                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| createItem               | The base create operation for a single item |
| upsertItem               | The base upsert operation for a single item |
| updateItem               | The base update operation for a single item |
| getItem                  | The base operation for retrieving a single item  |
| getItems                 | The base operation for retrieving a collection of items |
| deleteItem               | The base delete operation for a single item |
| addAssociatedItem        | Add an item association to a main resource |
| hasAssociatedItem        | Returns the requested associated item, if it is associated, otherwise returns a 404 |
| removeAssociatedItem     | Removes an associated item from a main resource |
| removeAllAssociatedItems | Removes all item instances of an association from a main resource |


See the [Action Guide][action-guide-bookshelf] for details.


## The Joint Stack


```

   JointServer                                   -  route-config.js
   [HTTP API] Express

                      |
                      |
. __________________________________________ .
|                                            |
|  JointLib                                  |   -  method-config.js
|  [SDK] Bookshelf/knex, DON                 |   -  model-config.js
|                                            |                       
. __________________________________________ .

                      |
                      |
   JointEngine                                   -  db-config.js
   [Persistence] Postgres, Bookshelf/knex

```

## License


[action-guide-bookshelf]: https://github.com/manicprone/joint-lib/blob/master/src/actions/README.md
