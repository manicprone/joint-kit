# Joint Lib
> Part of the Joint Stack


A Node server library for rapidly implementing persisted data action logic.

The Joint Library sits on top of your persistence layer (e.g. ORM), exposing
ready-to-use action logic that is abstracted to support your most common data
CRUD and relational operations.

By simply defining the functionality of your actions using a straight-forward
JSON syntax, you can implement an entire data method library for your application
in minutes.


## Table of Contents

* [Prerequisites][section-prerequisites]
* [Install][section-install]
* [How to Use the Library][section-how-to-use]
* [Joint Actions][section-joint-actions]
* [Data Operation Notation][section-data-operation-notation]
* [Generating Custom Methods][section-generating-custom-methods]
* [The Joint Stack][section-the-joint-stack]
* [License][section-license]


## Prerequisites

To use the Joint Library, you need:

* a supported persistence solution (e.g. Postgres)
* a configured data schema (e.g. database and tables)
* a supported service interface / ORM (e.g. Bookshelf)

The Joint Library currently supports:

| Service                              | Persistence Options          |
| ------------------------------------ | ---------------------------- |
| [Bookshelf][link-bookshelf-site]     | Postgres, MySQL, SQLite3     |


## Install

``` sh
$ npm install joint-lib --save
```


## How to Use the Library

[TBC]


## Joint Actions

The following abstract actions are immediately available once the library is installed:


| Action                   | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| createItem               | A create operation for a single item                         |
| upsertItem               | An upsert operation for a single item                        |
| updateItem               | An update operation for a single item                        |
| getItem                  | A read operation for retrieving a single item                |
| getItems                 | A read operation for retrieving a collection of items        |
| deleteItem               | A delete operation for a single item                         |
| addAssociatedItem        | An operation for associating an item to a main resource      |
| hasAssociatedItem        | An operation for checking the existence of an association    |
| removeAssociatedItem     | An operation for disassociating an item from a main resource |
| removeAllAssociatedItems | An operation for disassociating all items of a type from a main resource |


See the [Action Guide][link-action-guide-bookshelf] for details on using each action.


## Data Operation Notation

To use the Joint Actions, you communicate with a JSON syntax called Data Operation Notation.

Each action has two parts: the `spec` and the `input`.

The `spec` defines the functionality of the action (the schema to which it is attached,
the joint action it performs, the fields it accepts, who it authorizes to perform the action, etc).

The `input` supplies the data for an individual action request.

[TBC]

See the [Action Guide][link-action-guide-bookshelf] for details on using the notation.


## Generating Custom Methods

Using the provided Joint Actions, you can rapidly implement custom methods
for your data schema.

To implement custom methods, you can write your own JavaScript functions by directly accessing
the `joint.<action>` set, or you can dynamically generate them by providing a "method config".

[TBC]

See the [Action Guide][link-action-guide-bookshelf] for more details.


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



[section-prerequisites]: #prerequisites
[section-install]: #install
[section-how-to-use]: #how-to-use-the-library
[section-joint-actions]: #joint-actions
[section-data-operation-notation]: #data-operation-notation
[section-generating-custom-methods]: #generating-custom-methods
[section-the-joint-stack]: #the-joint-stack
[section-license]: #license

[link-bookshelf-site]: http://bookshelfjs.org
[link-action-guide-bookshelf]: https://github.com/manicprone/joint-lib/blob/master/src/actions/README.md
