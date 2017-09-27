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
* [Example Usage][section-example-usage]
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


## Example Usage

index.js
```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';

// Fire up a joint, leveraging your Bookshelf configuration...
const joint = new Joint({
  service: bookshelf,
});

// Out-of-the-box, you can use any of the Joint Actions to handle common CRUD and relational logic...

// The "spec" defines the functionality of your operation:
// modelName - maps to the registered Model
// fields    - defines all fields allowed for this operation
const spec = {
  modelName: 'BlogProfile',
  fields: [
    { name: 'user_id', type: 'Number', required: true },
    { name: 'slug', type: 'String', required: true },
    { name: 'title', type: 'String', required: true },
    { name: 'tagline', type: 'String' },
    { name: 'is_live', type: 'Boolean', defaultValue: false },
  ],
};

// The "input" supplies the data for an individual operation request:
const input = {
  fields: {
    user_id: 3,
    title: 'Functional Fanatic',
    slug: 'functional-fanatic',
    tagline: 'I don\'t have habits, I have algorithms.',
  },
};

// Leverage the appropriate Joint Action to implement your operation:
joint.createItem(spec, input)
  .then((payload) => { ... })
  .catch((error) => { ... });
```

<br />

/resources/models.js
```javascript
import bookshelf from '../services/bookshelf';

// Declare model...
const BlogProfile = bookshelf.Model.extend({
  tableName: 'blog_profiles',
  idAttribute: 'id',
  hasTimestamps: ['created_at', 'updated_at'],
  user() {
    return this.belongsTo('User', 'user_id');
  },
  posts() {
    return this.hasMany('BlogPost', 'profile_id');
  },
});

// Add model to Bookshelf registry...
bookshelf.model('BlogProfile', BlogProfile),
```

<br />

/services/bookshelf.js
```javascript
// Configure knex...
const knex = require('knex')({ ... });

// Initialize bookshelf...
const bookshelf = require('bookshelf')(knex);

// Enable plugins...
bookshelf.plugin('registry');
bookshelf.plugin('pagination');

export default bookshelf;
```

<br />

The idea is, you can rapidly implement a custom method library (manually) via this architecture:

/methods/blog-profile.js
```javascript

export function createProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'user_id', type: 'Number', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'title', type: 'String', required: true },
      { name: 'tagline', type: 'String' },
      { name: 'is_live', type: 'Boolean', defaultValue: false },
    ],
  };

  return joint.createItem(spec, input);
}

export function updateProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'id', type: 'Number', required: true, lookupField: true },
      { name: 'slug', type: 'String' },
      { name: 'title', type: 'String' },
      { name: 'tagline', type: 'String' },
      { name: 'is_live', type: 'Boolean'},
    ],
  };

  return joint.updateItem(spec, input);
}

export function getProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
  };

  return joint.getItem(spec, input);
}

export function getProfiles(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'user_id', type: 'Number' },
      { name: 'is_live', type: 'Boolean'},
    ],
  };

  return joint.getItems(spec, input);
}

export function deleteProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
  };

  return joint.deleteItem(spec, input);
}
```

<br />

And, the beauty of the manual capability, is that you can leverage the core logic behind each action
(which typically represents the majority of the programming), while maintaining the flexibility to write
your customized logic alongside:

```javascript

export function createProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'user_id', type: 'Number', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'title', type: 'String' },
      { name: 'tagline', type: 'String' },
      { name: 'is_live', type: 'Boolean', defaultValue: false },
    ],
  };

  // Generate default title, if none provided...
  const defaultInput = { title: `New Profile ${Date()}` };
  const inputForCreate = Object.assign(defaultInput, input);

  return joint.createItem(spec, inputForCreate);
}

export function getLiveProfiles(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'user_id', type: 'Number' },
      { name: 'is_live', type: 'Boolean'},
    ],
  };

  // Force only "live" profiles to be returned...
  Object.assign(input, { is_live: true });

  return joint.getItems(spec, input);
}

export function getProfile(input) {
  const spec = {
    modelName: 'BlogProfile',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
  };

  // Apply "other" logic to the queried data...
  return joint.getItem(spec, input)
    .then((item) => {
      // Mutate the data before return...
      Object.assign(item, { ... });

      // Apply third-party service logic before return...
      return doOtherLogic(item);
    });
}

```

## Joint Actions

All Joint actions return Promises, and have the same method signature:

```javascript
joint.<action>(spec = {}, input = {}, output = 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```

The following abstract actions are immediately available once the library is installed:

| Action                   | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| createItem               | Create operation for a single item                                    |
| upsertItem               | Upsert operation for a single item                                    |
| updateItem               | Update operation for a single item                                    |
| getItem                  | Read operation for retrieving a single item                           |
| getItems                 | Read operation for retrieving a collection of items                   |
| deleteItem               | Delete operation for a single item                                    |
| addAssociatedItems       | Operation for associating one to many items to a main resource        |
| hasAssociatedItem        | Operation for checking the existence of an association                |
| removeAssociatedItem     | Operation for disassociating an item from a main resource             |
| removeAllAssociatedItems | Operation for disassociating all items of a type from a main resource |


See the [Action Guide][link-action-guide-bookshelf] for details on using each action.


## The JSON Syntax

To use the Joint Actions, you communicate with a JSON syntax.

Each action has two required parts: the `spec` and the `input`.

+ The `spec` defines the functionality of the action.

+ The `input` supplies the data for an individual action request.

Each action also supports an optional `output` parameter, which specifies the format of the returned payload.
By default, the `output` is set to `'native'`, which effectively returns the queried data in the format
generated natively by the service (currently, i.e. Bookshelf).

However, Joint supports the value `'json-api'`, which transforms the data into a JSON API Spec-like format, making
it ready-to-use for RESTful data transport.

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

[TBD]


[section-prerequisites]: #prerequisites
[section-install]: #install
[section-example-usage]: #example-usage
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
