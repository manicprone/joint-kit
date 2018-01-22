# Joint Kit Feature Planning


## Upcoming Features

* Remove Bookshelf and Knex from the dependencies!!! Why are they even there to begin with ???

* Eliminate the declaration ordering issue with the `generate` logic for models
  (build a modelName => table lookup registry to solve).

* Update the config syntax:

  ```
  {

    modelConfig: [
      { name: 'User', tableName: 'user_account' },
    ],

    methodConfig: [
      { modelName: 'User', methods: [ ... ] },
    ],

    routeConfig: [
      { uri: '/user', get: { ... }, post: { ... } },
    ],

  }
  ```

* Change modelConfig property `idAttribute` => `idField`, and add scenario/tests.

* Utilize the constants (for all syntax) within the code.

* Update the db scenarios for testing:

  - Change all tables to use singular names
  - Rename "users" => "user_account"
  - Rename "user_info" => "user_ext_info"
  - Rename "roles" => "user_role"
  - Finish the schema for the blog_app scenario

* Support successive `generate` calls (i.e. merge provided configs into the
  existing set, then run the generate logic on the full set).

<br />

## README To Do

* Update README, now that the docs have moved to an official site.

* Add software stack info, etc.

<br />

## Backlog

* Remove the quotes on the modelNames in the error messages.

* Change the nomenclature of the package/service from "Joint" => "Joint Kit"
  (namely in the logging and error messages, et al).

* Support `orderBy` on associations (via <b>model config</b>).

* Complete support for `authorizedApps` auth rule / infrastructure.

* Add logic for `rolesAll` auth rule.

* Fix `owner` / `delegateRole` auth rule logic.

* Complete route-config handling

  - In buildRouter.js => determine if method being built is an association action,
    and prepare the input appropriately (currently only building base action syntax).

* Support multiple fields on uri spec for route-config.
  Likely, this will only work if the fields are of different types
  (otherwise, the first field of matching type is presumed).
  e.g.
  ```
  {
    uri: '/profile/{id,slug}',
    get: { method: 'Profile.getProfile' },
  },
  ```

* Complete `routeConfig` functional testing, using the updated db scenarios.

* Hook input field validation framework into action logic/syntax.

* Update action "deleteItem" => "deleteItems", to support one to many deletes of a type (model).

* Provide action: `snapshotItem` => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.
  Description: An advanced create operation for "snapshotting" a single item into a version copy (with associations).

* Hook job framework into solution.

  Initial jobs to provide:
  - the "delayed publish date"
  - delete specific data, after a TTL has been reached (for the Storytold sample app)

* Add "view count" tracking as a built-in feature.

* Add "APIConfig" resource API, to expose endpoint for client applications to manage
  their authorization and configure the API functionality (e.g. setting the resource properties
  that are currently managed in the /config/api-config.js, as well as generating an
  "authorizedApp" credential and saving it to the API for auth capabilities, etc).

<br />

## To Consider

* Mount Joint Actions under "action" root property: e.g. `Joint.action.getItem()` ???


```
const config = {

  modelConfig: [
    {
      name: 'User',
      idField: 'id',
      tableName: 'user_account',
      timestamps: { created: 'created_at', updated: 'updated_at' },
      associations: {
        profile: {
          type: 'toOne',
          path: 'id => UserProfile.user_id',
        },
        roles: {
          type: 'toMany',
          path: 'id => UserRoleRef.user_id => UserRoleRef.role_id => UserRole.id',
        },
      },
    },
  ],

  methodConfig: [
    {
      modelName: 'User',
      methods: [
        {
          name: 'createUser',
          action: 'createItem',
          spec: {
            fields: [
              { name: 'username', type: 'String', required: true },
              { name: 'external_id', type: 'String' },
              { name: 'email', type: 'String' },
              { name: 'display_name', type: 'String' },
              { name: 'first_name', type: 'String' },
              { name: 'last_name', type: 'String' },
              { name: 'preferred_locale', type: 'String' },
              { name: 'avatar_url', type: 'String' },
            ],
          },
        },
        {
          name: 'getUser',
          action: 'getItem',
          spec: {
            fields: [
              { name: 'id', type: 'Number', requiredOr: true },
              { name: 'username', type: 'String', requiredOr: true },
              { name: 'external_id', type: 'String', requiredOr: true },
            ],
            forceLoadDirect: ['roles:name'],
          },
        },
      ],
    },
  ],

  routeConfig: [
    {
      uri: '/user',
      get: { method: 'User.getUser' },
      post: { method: 'User.createUser', successStatus: 201, body: true },
    },
    {
      uri: '/user/:id/mark_login',
      post: { method: 'User.markLogin' },
    },
  ],
},
```
