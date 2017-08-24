# Joint Lib
> Part of the Joint Stack

A Node server library for rapidly implementing data logic and generating RESTful
endpoints.

Designed to be flexible. Mix it with existing code and/or use it to
generate an entire custom method library and client API from scratch.

The Joint Library sits on top of your persistence layer (e.g. your ORM),
exposing ready-to-use action logic that supports your most common CRUD and
relational data operations. Leverage the generic actions to quickly write your
application-specific data methods.

Take it further, and automatically generate custom methods for your application
using a straight-forward JSON syntax. No programming logic required.

If you need to serve your custom methods as an HTTP API, use the JSON syntax
to automatically generate RESTful endpoints for your Node server.


## Table of Contents

* [Prerequisites][section-prerequisites]
* [Install][section-install]
* [How to Use the Library][section-how-to-use]
* [Joint Actions][section-joint-actions]
* [The JSON Syntax][section-the-json-syntax]
* [Generating Models][section-generating-models]
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


<br />


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

[Rename this section: Example Usage]

[Move "How to Use the Library" to the detail guide. Just provide a quick view of common code usage here]


You can use Joint as minimally or as thoroughly as you require.

Let's start with the most minimal use cases.

Let's say you have an existing application that connects to an existing database schema.
It uses Bookshelf as its ORM service (The only service supported at this time).

You have already defined your Models:
```
posts, tags

```

<br />

Next up, you want to implement the essential CRUD methods for these resources,
so your application can start managing this data.

[TBC]


## Joint Actions

All Joint actions return Promises.

The following abstract actions are immediately available once the library is installed:


| Action                   | Description                                                  | Usage
| ------------------------ | ------------------------------------------------------------ | ------------------------------------ |
| createItem               | A create operation for a single item                         | ``` joint.createItem(spec, input) ``` |
| upsertItem               | An upsert operation for a single item                        | ``` joint.upsertItem(spec, input) ``` |
| updateItem               | An update operation for a single item                        | ``` joint.updateItem(spec, input) ``` |
| getItem                  | A read operation for retrieving a single item                | ``` joint.getItem(spec, input) ```    |
| getItems                 | A read operation for retrieving a collection of items        | ``` joint.getItems(spec, input) ```   |
| deleteItem               | A delete operation for a single item                         | ``` joint.deleteItem(spec, input) ``` |
| addAssociatedItem        | An operation for associating an item to a main resource      | ``` joint.addAssociatedItem(spec, input) ``` |
| hasAssociatedItem        | An operation for checking the existence of an association    | ``` joint.hasAssociatedItem(spec, input) ``` |
| removeAssociatedItem     | An operation for disassociating an item from a main resource | ``` joint.removeAssociatedItem(spec, input) ``` |
| removeAllAssociatedItems | An operation for disassociating all items of a type from a main resource | ``` joint.removeAllAssociatedItems(spec, input) ``` |


See the [Action Guide][link-action-guide-bookshelf] for details on using each action.


## The JSON Syntax

To use the Joint Actions, you communicate with a JSON syntax.

Each action has two parts: the `spec` and the `input`.

The `spec` defines the functionality of the action (the schema to which it is attached,
the joint action it performs, the fields it accepts, who it authorizes to perform the action, etc).

The `input` supplies the data for an individual action request.

[TBC]

See the [Action Guide][link-action-guide-bookshelf] for details on using the notation.


## Generating Models

Dynamic model generation is also supported using the library's JSON syntax.

You can write the model definitions yourself (and make them as complex as you want),
or you can dynamically generate them by providing a "model config". Or, you can do both.

Any existing models registered to your service instance will be mixed-in with those
generated by Joint. The `method-config` and `route-config` definitions can therefore
operate on models registered by either means.

[TBC]


## Generating Custom Methods

Using the provided Joint Actions, you can rapidly implement custom methods
for your specific data schema.

To implement custom methods, you can write your own JavaScript functions by directly accessing
the `joint.<action>` set, or you can dynamically generate them by providing a "method config".

[TBC]

[Show code for `method-config.js` & application code using `joint.method.<model>.<method>`]


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
[section-the-json-syntax]: #the-json-syntax
[section-generating-models]: #generating-models
[section-generating-custom-methods]: #generating-custom-methods
[section-generating-a-restful-api]: #generating-a-restful-api
[section-the-joint-stack]: #the-joint-stack
[section-license]: #license

[link-bookshelf-site]: http://bookshelfjs.org
[link-action-guide-bookshelf]: https://github.com/manicprone/joint-lib/blob/master/src/actions/README.md

[link-express-site]: http://expressjs.com
