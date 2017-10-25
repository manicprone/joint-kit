# Joint Kit

A Node server library & development kit for rapidly implementing data layers and RESTful endpoints.

Designed to be flexible. Mix it with existing code -_or_- use it to
generate an entire server-side method library and isomorphic HTTP API.

<br />

> DB model configuration, robust CRUD and relational data logic, resource-level & user-level authorization, field validation,
> data transformation, paginated & non-paginated datasets, rich error handling, payload serialization,
> HTTP router generation (for RESTful endpoints), and more.

<br />

## WIP

Not ready for public use until version 0.1.0 - Syntax and logic are in frequent flux.

<br />

## Table of Contents

### Installation
* [Prerequisites][section-prerequisites]
* [Install][section-install]

### Overview
* [The Joint Concept][section-the-joint-concept]

### API
* [Joint Constructor][section-joint-constructor]
* [Joint Instance][section-joint-instance]
* [Joint Actions][section-joint-actions]
* [Joint Action Errors][section-joint-action-errors]
* [Joint Action Authorization][section-joint-action-authorization]
* [Model Config Syntax][section-model-config-syntax]
* [Method Config Syntax][section-method-config-syntax]
* [Route Config Syntax][section-route-config-syntax]

### Guide
* [Defining Data Models][section-defining-data-models]
* [Building a Method Library][section-building-a-method-library]
* [Building a RESTful API][section-building-a-restful-api]

### Examples
* [Example Solutions][section-example-solutions]

### License
* [License][section-license]

<br />

## Prerequisites

To use the Joint Kit, you need:

* a supported persistence solution (_e.g. Postgres_)
* a configured data schema (_e.g. database & tables_)
* a supported service interface / ORM

The Joint Kit currently supports:

| Service                              | Required Plugins                              | Persistence Options          |
| ------------------------------------ | --------------------------------------------- | ---------------------------- |
| [Bookshelf][link-bookshelf-site]     | [registry][link-bookshelf-plugin-registry], [pagination][link-bookshelf-plugin-pagination] | Postgres, MySQL, SQLite3     |

<br />

If you wish to generate RESTful API endpoints, you need:

* a supported server framework

The Joint Kit currently supports:

| Server                          | Required Middleware                        |
| ------------------------------- | ------------------------------------------ |
| [Express][link-express-site]    | body-parser, cookie-parser |

<br />

## Install

``` sh
$ npm install joint-kit --save
```

<br />

## The Joint Concept

To implement solutions with the Joint Kit, you create _Joints_.

A Joint connects to:

* your persistence service &nbsp;&#10132;&nbsp; to implement a data method layer

* your server framework &nbsp;&#10132;&nbsp; to implement an HTTP API layer

The Joint Kit provides a set of data actions that are abstracted to handle common data operations for your resources. Actions are implemented using a config-like JSON syntax, making development simple and quick.

Leverage the built-in features to satisfy 100% of your required functionality, or use them as a base to augment with your own specialized logic.

### Create a Joint

```javascript
import express from 'express';
import Joint from 'joint-kit';
import bookshelf from './services/bookshelf'; // your configured bookshelf service

const joint = new Joint({
  service: bookshelf,
  server: express,
});
```

<span>---</span>

### Define Data Models

You can continue configuring data models with your service natively, or you can dynamically generate them with Joint using a JSON descriptor:

<details>
<summary>Defining models with a Joint descriptor</summary>

<br />
/model-config.js

```javascript
export default {
  models: {
    // Define and register a model named: "Profile"...
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
</details>
<br />

Use the `generate` function to dynamically generate your models:

```javascript
import modelConfig from './model-config'; // your defined models

// Dynamically generate the defined models:
joint.generate({ modelConfig });

// You can access all models using the syntax joint.model.<modelName>:
if (joint.model.Profile) console.log('The Profile model exists !!!');
```

<span>---</span>

### Create a Method Library

From the provided set of abstract data actions ([Joint Actions][section-joint-actions]), you can quickly implement a customized method library.

You can hand-roll the methods yourself:

<details>
<summary>Hand-rolling a CRUD set of methods</summary>

<br />
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
      { name: 'is_live', type: 'Boolean' },
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
      { name: 'is_live', type: 'Boolean' },
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
</details>
<br />
<span>-OR-</span>

<br />
You can dynamically generate them from a JSON descriptor:

<details>
<summary>Defining methods with a Joint descriptor</summary>

<br />
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
          name: 'updateProfile',
          action: 'updateItem',
          spec: {
            fields: [
              { name: 'id', type: 'Number', required: true, lookupField: true },
              { name: 'slug', type: 'String' },
              { name: 'title', type: 'String' },
              { name: 'tagline', type: 'String' },
              { name: 'is_live', type: 'Boolean'},
            ],
          },
        },
        {
          name: 'getProfile',
          action: 'getItem',
          spec: {
            fields: [
              { name: 'id', type: 'Number', requiredOr: true },
      		  { name: 'slug', type: 'String', requiredOr: true },
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
        {
          name: 'deleteProfile',
          action: 'deleteItem',
          spec: {
            fields: [
              { name: 'id', type: 'Number', requiredOr: true },
              { name: 'slug', type: 'String', requiredOr: true },
            ],
          },
        },
      ],
    },
  ],
};
```
</details>
<br />

Use the `generate` function to dynamically generate your methods:

```javascript
import methodConfig from './method-config'; // your defined method logic

// Dynamically generate the defined methods:
joint.generate({ methodConfig });

// You can now utilize the methods using the syntax:
joint.method.Profile.createProfile(input)
  .then((result) => { ... })
  .catch((error) => { ... });

joint.method.Profile.getProfiles(input)
  .then((result) => { ... })
  .catch((error) => { ... });

etc...
```

<span>---</span>

### Create RESTful Endpoints

On top of your Joint methods, you can easily expose a RESTful API layer.

You can hand-roll the router logic yourself:

<span>-OR-</span>

You can dynamically generate a router from a JSON descriptor:

<br />

## Joint Constructor

The Joint Kit module is an instantiable Class. Its instances are _Joints_.

Multiple Joint instances can be utilized within a single application.

**Example Joint Instantiation:**

```javascript
import express from 'express';
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf'; // your configured bookshelf service

const joint = new Joint({
  service: bookshelf,
  server: express,
  output: 'json-api',
});
```

### Constructor Options

| Name      | Description | Required? |
| --------- | ----------- | --------- |
| service   | The configured service instance for your persistence solution. | yes |
| server    | The server instance for your HTTP router handling.  | no |
| output    | The format of the returned data payloads. (defaults to `'native'`) | no |
| settings  | The configurable settings available for a Joint instance.  | no |

<br />

## Joint Instance

When a Joint has been instantiated, the following properties and functions are available on the instance:

### Properties

| Name         | Description |
| ------------ | ----------- |
| service      | The underlying service implementation (for persistence) provided at instantiation. |
| serviceKey   | A string value identifying the persistence service being used. |
| server       | The underlying server implementation, if configured.           |
| serverKey    | A string value identifying the server being used. <br /> `null` if not configured.  |
| output       | The string value for the globally configured output format. <br /> `'native'` by default.           |
| settings  | The active settings of the instance. |
| modelConfig  | The active "model config" descriptor, if provided with the `generate` function. |
| methodConfig | The active "method config" descriptor, if provided with the `generate` function.    |
| routeConfig  | The active "route config" descriptor, if provided with the `generate` function.    |

<br />

### Operational Functions

| Function   | Description |
| ------------------------------------ | ----------- |
| generate(&nbsp;options&nbsp;)        | Executes the dynamic generation of models, methods, and routes, per the config descriptors provided.  |
| setServer(&nbsp;server&nbsp;)        | Allows configuration of the server implementation, post-instantiation. |
| setOutput(&nbsp;output&nbsp;)        | Allows configuration of the output format, post-instantiation. |
| updateSettings(&nbsp;settings&nbsp;)    | Allows modification of the Joint settings, post-instantiation. |
| &lt;_action_&gt;(&nbsp;spec, input, output&nbsp;) | The action logic provided by the Joint instance. This is the backbone of the solution. See [Joint Actions][section-joint-actions] for the full list and usage details. |

<br />

### Convenience Functions

| Function      | Description |
| ------------- | ----------- |
| info( )       |             |

<br />

### Generated Models

| Syntax        | Description |
| ------------- | ----------- |
| model.&lt;_modelName_&gt; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | The registered Model object with name &lt;_modelName_&gt;. <br /> Any existing Models registered to the service instance will be mixed-in with those generated by Joint. |

<br />

### Generated Methods

| Syntax        | Description |
| ------------- | ----------- |
| method.&lt;_modelName_&gt;.&lt;_methodName_&gt;(&nbsp;input&nbsp;) |      |

<br />

### Generated Router

| Syntax        | Description |
| ------------- | ----------- |
| router        |             |

<br />

### Registries/Lookups

| Name                                 | Description |
| ------------------------------------ | ----------- |
| model.&lt;_modelName_&gt;            | Accesses the registered Model object with name &lt;_modelName_&gt;. |
| modelByTable.&lt;_tableName_&gt;     | Accesses the registered Model object by its &lt;_tableName_&gt;. |
| modelNameByTable.&lt;_tableName_&gt; | Accesses the registered Model name by its &lt;_tableName_&gt;. |
| specByMethod.&lt;_modelName_&gt;.&lt;_methodName_&gt; | Accesses the configured `spec` definition for a generated method by its &lt;_modelName_&gt;.&lt;_methodName_&gt; syntax.   |

<br />

## Joint Actions

The Joint Action set is the backbone of the Joint Kit solution.

Each Joint instance provides a robust set of abstract data actions that hook
directly to your persistence layer, handling the core logic for common data operations.

The actions are implemented to your data schema and your specification, using a config-like JSON syntax.

### Available Actions

| Action                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| createItem               | Create operation for a single item                                        |
| upsertItem               | Upsert operation for a single item                                        |
| updateItem               | Update operation for a single item                                        |
| getItem                  | Read operation for retrieving a single item                               |
| getItems                 | Read operation for retrieving a collection of items                       |
| deleteItems              | Delete operation for one to many items                                    |
| addAssociatedItems       | Operation for associating one to many items of a type to a main resource            |
| hasAssociatedItem        | Operation for checking the existence of an association on a main resource |
| getAllAssociatedItems    | Operation for retrieving all associations of a type from a main resource  |
| removeAssociatedItems    | Operation for disassociating one to many items of a type from a main resource       |
| removeAllAssociatedItems | Operation for removing all associations of a type from a main resource    |

<span>---</span>

### Joint Action Syntax

All Joint Actions return Promises, and have the signature:

```javascript
joint.<action>(spec = {}, input = {}, output = 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```

<span>---</span>

Each action has two required parts: the `spec` and the `input`.

+ The `spec` defines the functionality of the action.

+ The `input` supplies the data for an individual action request.

Each action also supports the optional parameter: `output`.

* The `output` specifies the format of the returned payload.

<span>---</span>

### Spec Options

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

#### modelName

[TBC]

#### fields

[TBC]

#### columnsToReturn

[TBC]

#### defaultOrderBy

[TBC]

#### forceAssociations

[TBC]

#### forceLoadDirect

[TBC]

#### auth

[TBC]

<br />

<span>---</span>

### Input Options

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

#### fields

[TBC]

#### columnSet

[TBC]

#### associations

[TBC]

#### loadDirect

[TBC]

#### orderBy

[TBC]

#### paginate

[TBC]

#### trx

[TBC]

#### authBundle

[TBC]

<br />

<span>---</span>

### Output Values

The `output` value configures the format of the returned payload.

**NOTE:** This setting can be configured globally on the Joint instance itself. (See the [Joint Instance API][section-joint-instance])

| Value                     | Description |
| ------------------------- | ----------- |  
| `'native'`     | Returns the queried data in the format generated natively by the service. This is the default setting. |   
| `'json-api'`   | Transforms the data into a [JSON API Spec][link-json-api-spec]-like format, making the data suitable for HTTP transport. |

<span>---</span>

#### output = 'native' <span style="font-weight:normal;margin-left:10px">(default)</span>

By default, the output is set to `'native'`, which effectively returns the queried data in the format generated natively by the service you are using.

**Item Example:**

<details>
<summary>Joint.getItem</summary>

```javascript
const spec = {
  modelName: 'Profile',
  fields: [
    { name: 'id', type: 'Number', required: true },
  ],
};

const input = {
  fields: { id: 1 },
  associations: ['user'],
};

joint.getItem(spec, input, 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```
</details>
<br />
**Returns:**

<details>
<summary>Item payload ( Bookshelf )</summary>

```javascript
{
  cid: 'c1',
  _knex: null,
  id: 1,
  attributes: {
    id: 1,
    user_id: 333,
    slug: 'functional-fanatic',
    title: 'Functional Fanatic',
    tagline: 'I don\'t have habits, I have algorithms.',
    is_live: false,
  },
  _previousAttributes: { ... },
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
      _previousAttributes: { ... },
      changed: {},
      relations: {},
      relatedData: { ... },
    },
  },
}
```
</details>

<br />

**Collection Example:**

<details>
<summary>Joint.getItems</summary>

```javascript
const spec = {
  modelName: 'Profile',
};

const input = {
  associations: ['user'],
  paginate: { skip: 0, limit: 3 },
};

joint.getItems(spec, input, 'native')
  .then((payload) => { ... })
  .catch((error) => { ... });
```
</details>
<br />
**Returns:**

<details>
<summary>Collection payload ( Bookshelf )</summary>

```

```
</details>

<br />

#### output = 'json-api'

When the output is set to `'json-api'`, the returned payload is transformed into a [JSON API Spec][link-json-api-spec]-like format, making it suitable for HTTP data transport.

**Item Example:**

<details>
<summary>Joint.getItem</summary>

```javascript
const spec = {
  modelName: 'Profile',
  fields: [
    { name: 'id', type: 'Number', required: true },
  ],
};

const input = {
  fields: { id: 1 },
  associations: ['user'],
};

joint.getItem(spec, input, 'json-api')
  .then((payload) => { ... })
  .catch((error) => { ... });
```
</details>
<br />
**Returns:**

<details>
<summary>Item payload</summary>

```
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
```
</details>

<br />

**Collection Example:**

<details>
<summary>Joint.getItems</summary>

```javascript
const spec = {
  modelName: 'Profile',
};

const input = {
  associations: ['user'],
  paginate: { skip: 0, limit: 3 },
};

joint.getItems(spec, input, 'json-api')
  .then((payload) => { ... })
  .catch((error) => { ... });
```
</details>
<br />
**Returns:**

<details>
<summary>Collection payload</summary>

```

```
</details>

<br />

## Joint Action Errors

[TBC]

<br />

## Joint Action Authorization

[TBC]

<br />

## Model Config Syntax

[TBC]

<br />

## Method Config Syntax

[TBC]

<br />

## Route Config Syntax

[TBC]

<br />

## Defining Data Models

[TBC]

You can continue to define data models using your service implementation, or you can dynamically generate them with Joint. Both approaches are supported simultaneously. Any existing models registered to your service instance will be mixed-in with those generated by the Joint instance.

<br />

## Building a Method Library

[TBC]

<br />

## Building a RESTful API

[TBC]

<br />

## Example Solutions

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

## License

[TBD]


[section-prerequisites]: #prerequisites
[section-install]: #install

[section-the-joint-concept]: #the-joint-concept

[section-joint-constructor]: #joint-constructor
[section-joint-instance]: #joint-instance
[section-joint-actions]: #joint-actions
[section-joint-action-errors]: #joint-action-errors
[section-joint-action-authorization]: #joint-action-authorization

[section-model-config-syntax]: #model-config-syntax
[section-method-config-syntax]: #method-config-syntax
[section-route-config-syntax]: #route-config-syntax

[section-defining-data-models]: #defining-data-models
[section-building-a-method-library]: #building-a-method-library
[section-building-a-restful-api]: #building-a-restful-api

[section-example-solutions]: #example-solutions

[section-license]: #license


[link-bookshelf-site]: http://bookshelfjs.org
[link-bookshelf-plugin-registry]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
[link-bookshelf-plugin-pagination]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination

[link-express-site]: http://expressjs.com

[link-json-api-spec]: http://jsonapi.org
