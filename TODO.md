# Joint Kit Feature Planning


## Upcoming features

* Support AND/OR logic for `fields.lookupField` (for allowing aggregate field lookups)
  e.g. lookup with (app_id AND key), but utilize `required:true` to specify if the
       conjunction is needed. Thus, the option can reflect the pattern of "required / requiredOr"
       i.e. `lookup:true` (implied AND), `lookupOr:true` (uses `Or` like current implementation).

<br />

## README To Do

- [] For Overview:
  - "The Joint Concept (In Code)" => A set of code blocks, to explain the overall concept of usage.
  - "Joint in Practice" => The current content of "The Joint Concept".

- [] Build simple diagram to assist in the Joint concept (i.e. how it fits into the application stack).

<br />

## Backlog

* Update action "deleteItem" => "deleteItems", to support one to many deletes of a type (model).

* Add concept/logic for supporting authorization rules on the server-side (as a method library).
  Effectively, abstract `joint.buildAuthBundle` to operate on both a true "session" object (from the request)
  as well as a server-side managed "user" object.

* Support model-config without a `modelsEnabled` property (make it optional).

* Support multiple configs on single `generate` call.
  e.g. `joint.generate({ modelConfig: [userModels, projectModels] })`;

* Support `fields.defaultValue` for `getItem`, `getItems`, et al. (See app-content method config for use case)

* Support auto-injected / overrides for input options (on method config)
  e.g. Enforce => `input.loadDirect: ['roles:key']` on all requests. (`spec.forceLoadDirect`, `spec.forceAssociations`)
  e.g. Support => the markLogin concept (where "now" is injected into input of updateItem action).

* Support `fields.locked: true` option, for permitting a field declaration on a spec, that is
  exposed for automatic handling (i.e. does not accept user-provided input).
  -or-
  Support as: `{ fields.autoValue: '% now %' }` => which locks, plus declares the auto-generated value.

* Implement advanced `fields.defaultValue` option, that supports auto-transforms and other
  useful dynamic mutations.
  e.g. `{ fields.defaultValue: '% camelCase(title) %' }` => which will set the default value
       to the camelcase of the provided "title" field.
  e.g. `{ fields.defaultValue: '% now %' }` => which will set a Date field value to the current date/time.

* Hook input field validation framework into action logic/syntax.

* Provide action: "snapshotItem" => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.
  Description: An advanced create operation for "snapshotting" a single item into a "version" copy (with associations).

* Hook job framework into solution.

* Add "view count" tracking as a built-in feature.

* Add "APIConfig" resource API, to expose endpoint for client applications to manage
  their authorization and configure the API functionality (e.g. setting the resource properties
  that are currently managed in the /config/api-config.js, as well as generating an
  "authorizedApp" credential and saving it to the API for auth capabilities, etc).

<br />

## To Consider

* Mount Joint Actions under "action" root property: e.g. `Joint.action.getItem()` ???

<br />
