# Joint Lib

A Node server library for rapidly implementing data logic and generating RESTful
endpoints.

Designed to be flexible. Mix it with existing code and/or use it to
generate an entire custom method library and client API router from scratch.

<br />

> Provides: DB model configuration, CRUD and relational data logic, authorization & field validation,
> data transformation, paginated & non-paginated datasets, rich error handling, payload serialization,
> HTTP router generation (for RESTful endpoints), and more.

<br />

## WIP

Not ready for public use until version 0.1.0 - Syntax and logic are in frequent flux.

The majority of this README content will eventually be migrated into a user's guide format.

<br />

## Table of Contents

* [Prerequisites][section-prerequisites]
* [Install][section-install]
* [The Joint Concept][section-the-joint-concept]
* [Joint in Practice][section-joint-in-practice]
* [Joint Actions][section-joint-actions]
* [Joint Action API][section-joint-action-api]
* [Generating Models][section-generating-models]
* [Generating Custom Methods][section-generating-custom-methods]
* [Generating a RESTful API][section-generating-a-restful-api]
* [The Joint Stack][section-the-joint-stack]
* [License][section-license]

<br />

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

If you wish to generate an API router on top of your custom methods, you need:

* a supported server framework (e.g. Express)

The Joint Library currently supports:

| Server                          |
| ------------------------------- |
| [Express][link-express-site]    |

<br />

## Install

``` sh
$ npm install joint-lib --save
```

<br />

## The Joint Concept

The attitude of Joint is to be flexible, not opinionated... handling the "85%" of your application requirements, while allowing the developer to provide the "15%" of nuance, if needed.

Though, for a standard application or service, the Joint Library can theoretically provide a complete implementation of your data layer, without any extra programming.

<span>---</span>

The Joint Library provides a robust set of abstract data actions that hook
directly to your persistence layer, handling the logic for common CRUD and relational data operations. The [Joint Actions][section-joint-actions] are configured to your data schema, and your desired functionality, using a simple JSON syntax.

<span>---</span>

Given you have established a `bookshelf.js` configuration file (which hooks to your database) and you have registered a set of models upon which to operate...

The conceptual idea of the library goes like this:

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf'; // your configured bookshelf service

// Fire up a joint, providing the service being used:
const joint = new Joint({
  service: bookshelf,
});

// The "spec" defines the functionality of your operation, and the fields permitted:
const spec = {
  modelName: 'Profile',
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
    user_id: 333,
    slug: 'functional-fanatic',
    title: 'Functional Fanatic',
    tagline: 'I don\'t have habits, I have algorithms.',
  },
};

// Leverage the appropriate Joint Action to handle the operation:
joint.createItem(spec, input)
  .then((result) => { ... })
  .catch((error) => { ... });
```

<br />

The Joint Action will automatically generate the appropriate errors, if the "input" does not satisfy the "spec" defined, otherwise it will perform the data operation and return the expected data result.

<span>---</span>

However, this example is only conceptual, and does not represent a realistic way one would utilize the Joint Library in an application.

Rather, only the "specs" for each operation would be defined in the application code (thus creating a method library), and the "inputs" would be generated on-the-fly by the users of the application.

<br />

## Joint in Practice

The idea of the Joint Library is, you can rapidly hand-roll a custom method library by wrapping custom functions around
the provided [Joint Actions][section-joint-actions] (with your defined `spec`), and expose those functions to your application.

<span>---</span>

**For Example:**

(A typical CRUD set of methods for a "Profile" resource)

/methods/profile.js
```javascript
export function createProfile(input) {
  const spec = {
    modelName: 'Profile',
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
    modelName: 'Profile',
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
    modelName: 'Profile',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
  };

  return joint.getItem(spec, input);
}

export function getProfiles(input) {
  const spec = {
    modelName: 'Profile',
    fields: [
      { name: 'user_id', type: 'Number' },
      { name: 'is_live', type: 'Boolean'},
    ],
  };

  return joint.getItems(spec, input);
}

export function deleteProfile(input) {
  const spec = {
    modelName: 'Profile',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
  };

  return joint.deleteItem(spec, input);
}
```

<br />

The beauty of the hand-rolled capability is that you can leverage the core logic behind each action
(which typically represents the majority of the programming), while maintaining the flexibility to write
your own logic alongside it:

<span>---</span>

**For Example:**

/methods/profile.js
```javascript
export function createProfile(input) {
  const spec = {
    modelName: 'Profile',
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
    modelName: 'Profile',
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
    modelName: 'Profile',
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

But, if you don't require any supplemental logic for an operation, you can bypass the hand-rolling of the method
entirely and generate the methods automatically from a JSON-based descriptor.

<span>---</span>

**For Example:**

Following the syntax for [generating methods][section-generating-custom-methods], you can create a "method config", which defines your method library:

/method-config.js
```javascript
export default {
  resources: [
    {
      modelName: 'Profile',
      methods: [
        {
          name: 'createProfile',
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
          name: 'getProfiles',
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

    ... other resources

  ],
};
```

<br />

Then, use the Joint `generate` function to dynamically generate the method library:

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';
import methodConfig from './method-config'; // your defined method logic

const joint = new Joint({
  service: bookshelf,
});

// Dynamically generate the defined methods:
joint.generate({ methodConfig });

// You can now utilize the methods using the syntax:
joint.method.Profile.createProfile(input)
  .then((result) => { ... })
  .catch((error) => { ... });
```

<br />

## Joint Actions

The Joint Action set is the backbone of the Joint Library.

The library provides a robust set of abstract data actions that hook
directly to your persistence layer, handling the logic for common CRUD and relational data operations. The actions are configured to your data schema, and your desired functionality, using a simple JSON syntax.

<span>---</span>

All Joint Actions return Promises, and have the same method signature:

```javascript
joint.<action>(spec = {}, input = {}, output = 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```

<br />

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

<br />

### The JSON Syntax

To use the Joint Actions, you communicate with a JSON syntax (see the [Joint Action API][section-joint-action-api]).

Each action has two required parts: the `spec` and the `input`.

+ The `spec` defines the functionality of the action.

+ The `input` supplies the data for an individual action request.

<span>---</span>

Each action also supports an optional `output` parameter, which specifies the format of the returned payload.

By default, the output is set to `"native"`, which effectively returns the queried data in the format
generated natively by the service (currently, i.e. Bookshelf). However, Joint also supports the value `"json-api"`, which transforms the data into a JSON API Spec-like format, making it ready-to-use for RESTful data transport.

<span>---</span>

##### Item Payload Example

<table>
<th>output = 'native'</th>
<th>output = 'json-api'</th>
<tr>
  <td>
    <pre>
      {
        cid: 'c1',
        &#95;knex: null,
        id: 1,
        attributes: {
          id: 1,
          user_id: 333,
          slug: 'functional-fanatic',
          title: 'Functional Fanatic',
          tagline: 'I don\'t have habits, I have algorithms.',
          is_live: false,
        },
        &#95;previousAttributes: { ... },
        changed: {},
        relations: {
          user: {
            cid: 'c2',
            id: 333,
            attributes: {
              display_name: '|M|',
              username: 'manicprone',
              sites: [
                { gitlab: 'https://gitlab.com/manicprone' },
                { github: 'https://github.com/manicprone' },
              ],
            },
            &#95;previousAttributes: { ... },
            changed: {},
            relations: {},
            relatedData: { ... },
          },
        },
      }
    </pre>
  </td>
  <td>
    <pre>
      {
        data: {
          type: 'Profile',
          id: 1,
          attributes: {
            user_id: 333,
            slug: 'functional-fanatic',
            title: 'Functional Fanatic',
            tagline: 'I don\'t have habits, I have algorithms.',
            is_live: false,
          },
          relationships: {
            user: {
              data: {
                type: 'User',
                id: 333,
              },
            },
          },
        },
        included: [
          {
            type: 'User',
            id: 333,
            attributes: {
              display_name: '|M|',
              username: 'manicprone',
              sites: [
                { gitlab: 'https://gitlab.com/manicprone' },
                { github: 'https://github.com/manicprone' },
              ],
            },
          },
        ],
      }
    </pre>
  </td>
</tr>
</table>

<br />

##### Collection Payload Example

<table>
<th>output = 'native'</th>
<th>output = 'json-api'</th>
<tr>
  <td>
    <pre>
    </pre>
  </td>
  <td>
    <pre>
    </pre>
  </td>
</tr>
</table>

<br />

### Example Usage

<details>
<summary>Writing a custom Express Router:</summary>

```javascript
import express from 'express';
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf'; // your configured bookshelf service
import modelConfig from './model-config';     // your defined models
import methodConfig from './method-config';   // your defined method logic

// Initialize a Joint using your service implementation:
const joint = new Joint({
  service: bookshelf,
  output: 'json-api', // auto-serialize to JSON API Spec format
});

// Dynamically generate the defined models and methods:
joint.generate({ modelConfig, methodConfig });

// Expose your data logic via Express router:
const router = express.Router();

router.route('/user')
  .post((req, res) => {
    const input = {};
    input.fields = Object.assign({}, req.body, req.query);

    return joint.method.User.createUser(input)
      .then(payload => handleDataResponse(payload, res, 201))
      .catch(error => handleErrorResponse(error, res));
  });

router.route('/user/:id')
  .get((req, res) => {
    const input = {
      fields: {
        id: req.params.id,
      },
      loadDirect: ['profile:{title,tagline,avatar_url,is_live}', 'roles:name'],
      associations: ['friends'],
    };

    return joint.method.User.getUser(input)
      .then(payload => handleDataResponse(payload, res, 200))
      .catch(error => handleErrorResponse(error, res));
  })
  .post((req, res) => {
    const input = {};
    input.fields = Object.assign({}, req.body, req.query, { id: req.params.id });

    return joint.method.User.updateUser(input)
      .then(payload => handleDataResponse(payload, res, 200))
      .catch(error => handleErrorResponse(error, res));
  })
  .delete((req, res) => {
    const input = {
      fields: {
        id: req.params.id,
      },
    };

    return joint.method.User.deleteUser(input)
      .then(payload => handleDataResponse(payload, res, 204))
      .catch(error => handleErrorResponse(error, res));
  });

router.route('/users')
  .get((req, res) => {
    const input = {};
    input.fields = Object.assign({}, req.query);
    input.loadDirect = ['profile:{title,tagline,avatar_url,is_live}', 'roles:name'];
    input.associations = ['friends'],

    return joint.method.User.getUsers(input)
      .then(payload => handleDataResponse(payload, res, 200))
      .catch(error => handleErrorResponse(error, res));
  });

function handleDataResponse(data, res, status = 200) {
  res.status(status).json(data);
}

function handleErrorResponse(error, res) {
  const status = error.status || 500;
  res.status(status).json(error);
}

module.exports = router;
```
</details>

<br />

## Joint Action API

[TBC]

All supported options:

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

<br />

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

<br />

## Generating Models

Maintaining the spirit of flexibility, you can continue defining the model definitions using
your service implementation, or you can dynamically generate them by providing a "model config".
Or, you can do both.

<span>---</span>

The Joint Library supports a JSON syntax for defining your Models, so you don't need to manually define or register
the model hook using the service directly (i.e. Bookshelf).

Any existing models registered to your service instance will be mixed-in with those
generated by Joint. The `methodConfig` and `routeConfig` definitions can therefore
operate on models registered by either means.

The `modelConfig` syntax supports an arrow notation for defining associations (relations),
making it easier to wield than the Bookshelf polymorphic method approach.

<span>---</span>

**For Example:**

/model-config.js
```javascript

export default {
  models: {
    // Define and register a Model named: "Profile"...
    Profile: {
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

Then, use the Joint `generate` function to dynamically generate your models:

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf';
import modelConfig from './model-config'; // your defined models

const joint = new Joint({
  service: bookshelf,
});

// Dynamically generate the defined models:
joint.generate({ modelConfig });

// You can access all models using the syntax joint.model.<modelName>:
if (joint.model.Profile) console.log('The Profile model exists !!!');

// Convenience mappings are also generated, allowing lookup of model object or name via the table name:
const Profile = joint.modelByTable['blog_profiles'];
const modelName = joint.modelNameByTable['blog_profiles'];
console.log(`The model name for table "blog_profiles" is: ${modelName}`);
```

<br />

### The Model Config Syntax

[TBC]

<br />

## Generating Custom Methods

Using the provided Joint Actions, you can rapidly implement custom methods for your specific data schema.

To implement custom methods, you can either write your own JavaScript functions by directly accessing
the `joint.<action>` set, or you can dynamically generate them by providing a "method config".

[TBC]

<br />

### The Method Config Syntax

[TBC]

<br />

## Generating a RESTful API

Dynamic router generation is supported using the library's JSON syntax (and with a supported server framework).
You can dynamically generate RESTful endpoints for your custom methods by providing a "route config".

NOTE: This feature is only available for dynamically-generated custom methods (via method config).

[TBC]

<br />

### The Route Config Syntax

[TBC]

<br />

## The Joint Stack

[TBC]

<br />

## License

[TBD]


[section-prerequisites]: #prerequisites
[section-install]: #install
[section-the-joint-concept]: #the-joint-concept
[section-joint-in-practice]: #joint-in-practice
[section-joint-actions]: #joint-actions
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
