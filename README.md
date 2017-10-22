# Joint Kit

A Node server library & development kit for rapidly implementing data layers and RESTful endpoints.

Designed to be flexible. Mix it with existing code -_or_- use it to
generate an entire custom method library and client API from scratch.

<br />

> DB model configuration, robust CRUD and relational data logic, resource-level & user-level authorization, field validation,
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

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [The Joint Concept][section-the-joint-concept]
* [Joint in Practice][section-joint-in-practice]

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [Joint Actions][section-joint-actions]
* [Joint Action Syntax][section-joint-action-syntax]
* [Joint Action Errors][section-joint-action-errors]
* [Joint Action Authorization][section-joint-action-authorization]

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [Joint Constructor][section-joint-constructor]
* [Joint Instance API][section-joint-instance-api]

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [Generating Models][section-generating-models]
* [Generating Custom Methods][section-generating-custom-methods]
* [Generating a RESTful API][section-generating-a-restful-api]

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [Examples][section-examples]

<dl><dd style="color:#c9c9c9;">&#8213;</dd></dl>

* [The Joint Stack][section-the-joint-stack]
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
$ npm install joint-lib --save
```

<br />

## The Joint Concept

The Joint Kit module is an instantiable Class. Its instances are "_Joints_".

A Joint instance connects to:

* a persistence service &nbsp;&#10132;&nbsp; to implement a customized data operations layer

* a server framework &nbsp;&#10132;&nbsp; to implement a customized HTTP API layer

**Joint Instantiation:**

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

<span>---</span>

Joint Kit solutions are primarily implemented using a config-like JSON syntax, so development is simple and quick.

To implement data solutions, the Joint instance provides:

* [Joint Actions][section-joint-actions]: &nbsp; A library of abstract data functions for hand-rolling backend data architecture (e.g. CRUD and relational operations).



* [Joint Instance API][section-joint-instance-api]: &nbsp; A development kit for dynamically generating custom method libraries & RESTful endpoints from config files, and other features.

<span>---</span>

[TBC: Disperse the content of "The Concept, in Code". Provide a better approach to presenting the coding concepts. ]

**The Concept, in Code:**

Given you have configured the service instance for your persistence solution, and you have a set of models upon which to operate...

The conceptual idea of a Joint goes like this:

```javascript
import Joint from 'joint-lib';
import bookshelf from './services/bookshelf'; // your configured bookshelf service

// Instantiate a Joint, providing the service to use:
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

The [Joint Action][section-joint-actions] will automatically generate the appropriate [Joint Errors][section-joint-action-errors], if the `input` does not satisfy the `spec` defined, otherwise it will perform the data operation and return the expected data result.

<span>---</span>

However, this example is only conceptual, and does not represent a realistic way one would utilize the Joint Library in an application.

Rather, the "specs" for each operation would be defined in the application code (thus creating a method library), and the "inputs" would be generated on-the-fly by the users of the application.

<br />

## Joint in Practice

With a Joint instance, you can quickly hand-roll a robust method library by wrapping custom functions around its abstract [Joint Actions][section-joint-actions].

### Hand-rolling a Method


1) Export a named function that accepts the [Joint Action][section-joint-actions]  `input` as a parameter.


2) Select the [Joint Action][section-joint-actions] to use for the base logic.


3) Define the method implementation by providing a customized `spec`, following the [Joint Action Syntax][section-joint-action-syntax].


4) Return the Joint Action call, passing it the `spec` and `input`.


**Example:**

<details>
<summary>A typical CRUD set of methods for a "Profile" resource</summary>

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

<span>---</span>

The beauty of the hand-rolling capability is that you can leverage the core logic behind each action
(which typically represents the majority of the programming), while maintaining the flexibility to write your own logic alongside it.

**Example:**

<details>
<summary>Mixing other code with the "Profile" methods</summary>

<br />
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
      { name: 'is_live', type: 'Boolean' },
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
</details>

<span>---</span>

But, if you don't require any supplemental logic for an operation, you can bypass the hand-rolling of the method entirely and generate the methods dynamically from a JSON-based descriptor.

### Dynamically Generating Methods

Following the guidelines for [generating methods][section-generating-custom-methods], you can create a "method config", which defines a method library using a JSON-based descriptor.

Executing the Joint `generate` function on the descriptor will dynamically build the method library for you, and load the method logic onto your Joint instance.

**Example:**

<details>
<summary>Defining the "Profile" methods with a "method config"</summary>

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

<span>---</span>

With a "method config", you can use the Joint `generate` function to generate the method library for you:

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

joint.method.Profile.getProfiles(input)
  .then((result) => { ... })
  .catch((error) => { ... });

etc...
```

<br />

## Joint Actions

The Joint Action library is the backbone of the Joint solution.

The library provides a robust set of abstract data actions that hook
directly to your persistence layer, handling the logic for common CRUD and relational data operations. The actions are configured to your data schema, and your desired functionality, using a simple JSON syntax ( see the  [Joint Action Syntax][section-joint-action-syntax] ).

<span>---</span>

The following abstract actions are immediately available once the library is installed:

| Action                   | Description                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
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

<br />

## Joint Action Syntax

To use the Joint Actions, you communicate with a JSON syntax.

All Joint Actions return Promises, and have the same method signature:

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

All available options:

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

### Output <span style="font-size:75%;color:#525252;margin-left:10px">(supported by all actions)</span>

| Value                     | Description |
| ------------------------- | ----------- |  
| `'native'`     | Returns the queried data in the format generated natively by the service. This is the default setting. |   
| `'json-api'`   | Transforms the data into a [JSON API Spec][link-json-api-spec]-like format, making the data suitable for HTTP transport. |

<br />

### Spec Options

Details for each option, with examples:

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

### Input Options

Details for each option, with examples:

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

### Output Values

The `output` value configures the format of the returned payload.

**NOTE:** This setting can be configured globally on the Joint instance itself ( see the [Joint Instance API][section-joint-instance-api] ).

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

**Returns:**

<details>
<summary>Collection payload ( Bookshelf )</summary>

```

```
</details>

<span>---</span>

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

## Joint Constructor

The Joint Library is an instantiable Class. It's instances are "_Joints_".

The `joint-lib` package is exposed this way, so that multiple Joint instances can be utilized within an application.

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

| Name      | Description |
| --------- | ----------- |
| service   | The configured service instance for your persistence solution. |
| server    | The server instance for your HTTP router handling. ( *optional ) |
| output    | The format of the returned data payloads. ( defaults to `'native'` ) |

<br />

## Joint Instance API

When a valid Joint has been instantiated, the following properties and functions are available on the instance:

### Properties

| Name         | Description |
| ------------ | ----------- |
| service      | The underlying service implementation (for persistence) provided at instantiation. |
| serviceKey   | A string value identifying the persistence service being used. |
| server       | The underlying server implementation, if configured.           |
| serverKey    | A string value identifying the server being used. <br /> `null` if not configured  |
| output       | The string value for the globally configured output format. <br /> `'native'` by default           |
| modelConfig  | The active "model config" descriptor, if provided with the `generate` function. |
| methodConfig | The active "method config" descriptor, if provided with the `generate` function.    |
| routeConfig  | The active "route config" descriptor, if provided with the `generate` function.    |

<br />

### Operational Functions

| Function                   | Description |
| -------------------------- | ----------- |
| generate(&nbsp;options&nbsp;)        | Executes the dynamic generation of models, methods, and routes, per the config descriptors provided.  |
| setOutput(&nbsp;output&nbsp;)        | Allows configuration of the output format, post-instantiation.            |
| setServer(&nbsp;server&nbsp;)        | Allows configuration of the server implementation, post-instantiation. |
| &lt;_action_&gt;(&nbsp;spec, input, output&nbsp;) | The action logic provided by the Joint Library. This is the backbone of the solution. See [Joint Actions][section-joint-actions] for the full list and usage details. |

<br />

### Convenience Functions

| Function                   | Description |
| -------------------------- | ----------- |
| info( )                    |             |

<br />

### Generated Models

| Syntax                               | Description |
| ------------------------------------ | ----------- |
| model.&lt;_modelName_&gt; | Exposes the registered Model object with name &lt;_modelName_&gt;. <br /> Any existing Models registered to the service instance will be mixed-in with those generated by Joint. |

<br />

### Generated Methods

| Syntax                               | Description |
| ------------------------------------ | ----------- |
| method.&lt;_modelName_&gt;.&lt;_methodName_&gt;(&nbsp;input&nbsp;) |      |

<br />

### Generated Router

| Syntax        | Description |
| ------------- | ----------- |
| router        |      |

<br />

### Registries/Lookups

| Name                                 | Description |
| ------------------------------------ | ----------- |
| model.&lt;_modelName_&gt;            | Accesses the registered Model object with name &lt;_modelName_&gt;. |
| modelByTable.&lt;_tableName_&gt;     | Accesses the registered Model object by its &lt;_tableName_&gt;. |
| modelNameByTable.&lt;_tableName_&gt; | Accesses the registered Model name by its &lt;_tableName_&gt;. |
| specByMethod.&lt;_modelName_&gt;.&lt;_methodName_&gt; | Accesses the configured `spec` definition for a generated method by its &lt;_modelName_&gt;.&lt;_methodName_&gt; syntax.   |

<br />

## Generating Models

You can continue to define models using your service implementation, or you can dynamically generate them with Joint. Both approaches are supported simultaneously. Any existing models registered to your service instance will be mixed-in with those generated by Joint.

<span>---</span>

To dynamically generate models with the Joint Library, you must provide a "model config".

The "model config" syntax supports an arrow notation for defining associations (relations), making it easier to wield than the Bookshelf polymorphic method approach.

<span>---</span>

**For Example:**

<details>
<summary>Defining the "Profile" model with a "model config"</summary>

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

## Examples

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
[section-joint-action-syntax]: #joint-action-syntax
[section-joint-action-errors]: #joint-action-errors
[section-joint-action-authorization]: #joint-action-authorization
[section-joint-constructor]: #joint-constructor
[section-joint-instance-api]: #joint-instance-api

[section-generating-models]: #generating-models
[section-generating-custom-methods]: #generating-custom-methods
[section-generating-a-restful-api]: #generating-a-restful-api

[section-examples]: #examples

[section-the-joint-stack]: #the-joint-stack
[section-license]: #license

[link-bookshelf-site]: http://bookshelfjs.org
[link-bookshelf-plugin-registry]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
[link-bookshelf-plugin-pagination]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination

[link-express-site]: http://expressjs.com

[link-json-api-spec]: http://jsonapi.org
