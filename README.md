# Joint Lib
> Part of the Joint Stack

A Node server library for rapidly implementing data logic and generating RESTful
endpoints.

Not opinionated. Super flexible. Use it with existing code or use it to
generate an entire custom method library and client API from scratch.

The Joint Library sits on top of your persistence layer (e.g. ORM), exposing
ready-to-use action logic that is abstracted to support your most common CRUD
and relational data operations. Use the abstract actions to quickly write your
concrete data methods.

Take it further, and automatically generate custom methods for your application
using a straight-forward JSON syntax. No programming logic required.

If you need to serve your custom methods as a client API, automatically generate
RESTful endpoints using the JSON syntax.


## Table of Contents

* [Prerequisites][section-prerequisites]
* [Install][section-install]
* [How to Use the Library][section-how-to-use]
* [Joint Actions][section-joint-actions]
* [Data Operation Notation][section-data-operation-notation]
* [Generating Custom Methods][section-generating-custom-methods]
* [Generating a RESTful API][section-generating-a-restful-api]
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


To generate a RESTful API on top of your custom methods, you need:

* a supported server framework (e.g. Express)

The Joint Library currently supports:

| Server                          |
| ------------------------------- |
| [Express][link-express-site]    |


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


## Generating a RESTful API

This feature is only available for dynamically-generated custom methods.

To dynamically generate RESTful endpoints for your custom methods, you must
provide a "route config".

[TBC]


## The Joint Stack

[TBC]


## License

[TBC]


[section-prerequisites]: #prerequisites
[section-install]: #install
[section-how-to-use]: #how-to-use-the-library
[section-joint-actions]: #joint-actions
[section-data-operation-notation]: #data-operation-notation
[section-generating-custom-methods]: #generating-custom-methods
[section-generating-a-restful-api]: #generating-a-restful-api
[section-the-joint-stack]: #the-joint-stack
[section-license]: #license

[link-bookshelf-site]: http://bookshelfjs.org
[link-action-guide-bookshelf]: https://github.com/manicprone/joint-lib/blob/master/src/actions/README.md

[link-express-site]: http://expressjs.com
