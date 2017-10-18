# Joint Lib
> Part of the Joint Stack

A Node server library for rapidly implementing data logic and generating RESTful
endpoints.

Designed to be flexible. Mix it with existing code and/or use it to
generate an entire custom method library and client API from scratch.

Provides: DB model configuration, CRUD and relational data logic, authorization & field validation,
data transformation, paginated & non-paginated datasets, rich error handling, payload serialization, HTTP router generation (for RESTful endpoints), and more.


## WIP

Not ready for public use until version 0.1.0 - Syntax and logic are in frequent flux.


## Table of Contents

* [Prerequisites][section-prerequisites]
* [Install][section-install]
* [Joint Actions][section-joint-actions]
* [The JSON Syntax][section-the-json-syntax]
* [The Joint Concept][section-the-joint-concept]
* [Joint in Practice][section-joint-in-practice]
* [Joint Action API][section-joint-action-api]
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

| Service                              | Required Plugins                              | Persistence Options          |
| ------------------------------------ | --------------------------------------------- | ---------------------------- |
| [Bookshelf][link-bookshelf-site]     | [registry][link-bookshelf-plugin-registry], [pagination][link-bookshelf-plugin-pagination] | Postgres, MySQL, SQLite3     |


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


## Joint Actions

All Joint actions return Promises, and have the same method signature:

```javascript
joint.<action>(spec = {}, input = {}, output = 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```

The following abstract actions are immediately available once the library is installed:

| Action                   | Description                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| createItem               | Create operation for a single item                                        |
| upsertItem               | Upsert operation for a single item                                        |
| updateItem               | Update operation for a single item                                        |
| getItem                  | Read operation for retrieving a single item                               |
| getItems                 | Read operation for retrieving a collection of items                       |
| deleteItems              | Delete operation for one to many items                                    |
| addAssociatedItems       | Operation for associating one to many items to a main resource            |
| hasAssociatedItem        | Operation for checking the existence of an association on a main resource |
| getAllAssociatedItems    | Operation for retrieving all associations of a type from a main resource  |
| removeAssociatedItems    | Operation for disassociating one to many items from a main resource       |
| removeAllAssociatedItems | Operation for removing all associations of a type from a main resource    |


## The JSON Syntax

To use the Joint Actions, you communicate with a JSON syntax.

Each action has two required parts: the `spec` and the `input`.

+ The `spec` defines the functionality of the action.

+ The `input` supplies the data for an individual action request.

<br />

Each action also supports an optional `output` parameter, which specifies the format of the returned payload.
By default, the output is set to `'native'`, which effectively returns the queried data in the format
generated natively by the service (currently, i.e. Bookshelf).

However, Joint also supports the value `'json-api'`, which transforms the data into a JSON API Spec-like format,
making it ready-to-use for RESTful data transport.

**output = 'native' (default)**
```javascript
const joint = new Joint({
  service: bookshelf,
});
```

<table>
<th>Action</th>
<th>Payload</th>
<tr>
  <td>
    <pre>joint.getItem().then((payload) => { ... });</pre>
  </td>
  <td>
    <pre>
      <show example payload>
    </pre>
  </td>
</tr>
</table>


**output = 'json-api'**
```javascript
const joint = new Joint({
  service: bookshelf,
  output: 'json-api',
});
```

<table>
<th>Action</th>
<th>Payload</th>
<tr>
  <td>
    <pre>joint.getItem().then((payload) => { ... });</pre>
  </td>
  <td>
    <pre>
      <show example payload>
    </pre>
  </td>
</tr>
</table>


## The Joint Concept

Out-of-the-box, you can use any of the [Joint Actions][section-joint-actions] to handle common CRUD and relational data logic.

Given you have established a `bookshelf.js` configuration file (which hooks to your database) and you have registered a set of Models upon which to operate...

The conceptual idea of the library goes like this:

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';

// Fire up a joint, specifying your Bookshelf configuration:
const joint = new Joint({
  service: bookshelf,
});

// The "spec" defines the functionality of your operation, and the fields permitted:
const spec = {
  modelName: 'BlogProfile',
  fields: [
    { name: 'user_id', type: 'Number', required: true },
    { name: 'title', type: 'String', required: true },
    { name: 'slug', type: 'String', required: true },
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

// Leverage the appropriate Joint Action to handle the operation:
joint.createItem(spec, input)
  .then((result) => { ... })
  .catch((error) => { ... });
```


## Joint in Practice

The idea is, you can rapidly hand-roll a custom method library by wrapping custom functions around
the provided Joint Actions, with a defined `spec`:

<br />

**For Example:**

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

And, the beauty of the hand-rolled capability is that you can leverage the core logic behind each action
(which typically represents the majority of the programming), while maintaining the flexibility to write
your own logic alongside:

<br />

**For Example:**

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
      return doOtherAsyncLogic(item);
    });
}
```

<br />

But, if you don't require any supplemental logic for an operation, bypass the hand-rolling of the method
entirely and generate the methods automatically from a JSON-based config file.

<br />

**For Example:**

method-config.js
```javascript
export default {
  resources: [
    {
      modelName: 'BlogProfile',
      methods: [
        {
          name: 'createBlogProfile',
          action: 'createItem',
          spec: {
            fields: [
              { name: 'user_id', type: 'Number', required: true },
              { name: 'slug', type: 'String', required: true },
              { name: 'title', type: 'String' },
              { name: 'tagline', type: 'String' },
              { name: 'is_live', type: 'Boolean', defaultValue: false },
            ],
          },
        },
        {
          name: 'getBlogProfiles',
          action: 'getItems',
          spec: {
            fields: [
              { name: 'id', type: 'Number', requiredOr: true },
              { name: 'slug', type: 'String', requiredOr: true },
            ],
          },
        },

        ... other methods

      ],
    },

    ... other resources (models)

  ],
};
```

<br />
Then, use the Joint `generate` function to dynamically generate your custom method library:
<br />

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';
import methodConfig from './method-config';

const joint = new Joint({
  service: bookshelf,
});

// Dynamically generate the defined methods:
joint.generate({ methodConfig });

// You can now utilize the methods using the syntax:
joint.method.BlogProfile.createBlogProfile(input)
  .then((result) => { ... })
  .catch((error) => { ... });
```

<br />

Joint also supports a JSON syntax for defining your Models, so you don't need to manually define or register
the model hook via Bookshelf. The syntax supports an arrow notation for defining associations (relations),
making it easier to wield than the Bookshelf polymorphic method approach.

<br />

**For Example:**

model-config.js
```javascript

export default {
  models: {
    // Define and register a Model named: "BlogProfile"...
    BlogProfile: {
      tableName: 'blog_profiles',
      timestamps: { created: 'created_at', updated: 'updated_at' },
      associations: {
        user: {
          type: 'toOne',
          path: 'user_id => User.id', // one-to-one
        },
        posts: {
          type: 'toMany',
          path: 'id => BlogPost.profile_id', // one-to-many
        },
        tags: {
          type: 'toMany',
          path: 'id => ProfileTag.profile_id => ProfileTag.tag_id => Tag.id', // many-to-many
        },
      },
    },

    ... other models

  },
};
```

<br />
Similarly, use the Joint `generate` function to dynamically generate your models.
Any manually defined models on your bookshelf config will be merged into the Joint
instance along with those defined in the model-config. So, you can use both approaches as you see fit:
<br />

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';
import modelConfig from './model-config';
import methodConfig from './method-config';

const joint = new Joint({
  service: bookshelf,
});

// Dynamically generate the defined models and methods...
joint.generate({ modelConfig, methodConfig });

// You can access all models using the syntax joint.model.<modelName>:
if (joint.model.BlogProfile) console.log('BlogProfile exists !!!');

// Convenience mappings are also generated, allowing lookup of model object or name via the table name:
const BlogProfile = joint.modelByTable['blog_profiles'];
const modelName = joint.modelNameByTable['blog_profiles'];
console.log(`The model name for table "blog_profiles" is: ${modelName}`);
```


## Joint Action API

[TBC]

### Spec

| Option              | Description | Actions Supported               | Required? |
| ------------------- | ----------- | ------------------------------  | --------- |
| modelName           |             | (all)                           |  Yes      |
| fields              |             | (all)                           |  Yes (* except getItems) |
| fields.required     |             | (all)                           |  No       |
| fields.requiredOr   |             | (all)                           |  No       |
| fields.lookupField  |             | (all)                           |  Yes for upsertItem, updateItem |
| fields.defaultValue |             | createItem, upsertItem, getItem |  No       |
| columnsToReturn     |             | getItem, getItems               |  No       |
| defaultOrderBy      |             | getItems                        |  No       |
| forceAssociations   |             | getItem, getItems               |  No       |
| forceLoadDirect     |             | getItem, getItems               |  No       |
| auth                |             | (all)                           |  No       |

### Input

| Option         | Description | Actions Supported | Required? |
| -------------- | ----------- | ----------------  | --------- |
| fields         |             | (all)             |  Yes (* except getItems) |
| columnSet      |             | getItem, getItems |  No       |
| associations   |             | getItem, getItems |  No       |
| loadDirect     |             | getItem, getItems |  No       |
| orderBy        |             | getItems          |  No       |
| paginate       |             | getItems          |  No       |
| trx            |             | (all)             |  No       |
| authBundle     |             | (all)             |  No       |


## Generating Models

Dynamic model generation is supported using the library's JSON syntax.

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


## Generating a RESTful API

Dynamic router generation is supported using the library's JSON syntax (and with a supported server framework).
You can dynamically generate RESTful endpoints for your custom methods by providing a "route config".

NOTE: This feature is only available for dynamically-generated custom methods (via method config).

[TBC]


## The Joint Stack

[TBC]


## License

[TBD]


[section-prerequisites]: #prerequisites
[section-install]: #install
[section-joint-actions]: #joint-actions
[section-the-json-syntax]: #the-json-syntax
[section-the-joint-concept]: #the-joint-concept
[section-joint-in-practice]: #joint-in-practice
[section-joint-action-api]: #joint-action-api
[section-generating-models]: #generating-models
[section-generating-custom-methods]: #generating-custom-methods
[section-generating-a-restful-api]: #generating-a-restful-api
[section-the-joint-stack]: #the-joint-stack
[section-license]: #license

[link-bookshelf-site]: http://bookshelfjs.org
[link-bookshelf-plugin-registry]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
[link-bookshelf-plugin-pagination]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination

[link-express-site]: http://expressjs.com
