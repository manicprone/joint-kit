# Joint Kit Feature Planning


## Upcoming Features

* Encapsulate action validation logic into `field-validation-handlers.js` (and possibly other handlers, e.g. authorization).

* Support determined error specification syntax (for client response error data).

* Rename `removeAssociatedItems` / `removeAllAssociatedItems` => `detach...`.

* Update action `deleteItem` => `deleteItems`, to support one to many deletes of a type (model).

* Eliminate the declaration ordering issue with the `generate` logic for models:

  - Populate the `joint.modelNameByTable` registry upfront, before invoking the
    `registerModel` logic.
  - Pass the full joint instance to `registerModel`, instead of just the service
    (to access the lookup registry).

* Change modelConfig property `idAttribute` => `idField`, and add scenario/tests.

* Utilize the constants (for all syntax) within the code.

* Support successive `generate` calls (i.e. merge provided configs into the existing set, then run the generate logic on the full set).

* Handle `removeAssociatedItems` 404 error scenarios better: e.g. it might represent an invalid association name, etc.

* Support client-provided debug options.

<br />

## README To Do

* Add general info / overview, once jointkit.org is ready.

* Add software stack info, etc.

<br />

## Backlog

* Complete `routeConfig` functional testing, using the updated db scenarios.

* Replace moment with date-fns !!!

* Replace promises with `async/await` (esp in tests) !!!

* Remove the quotes on the modelNames in the error messages.

* Support `orderBy` on associations (via <b>model config</b>).

* Modify `hasAssociatedItem` action to either return only thin metadata (like a head request).

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

* Hook input field validation framework into action logic/syntax.

* Provide action: `snapshotItem` => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.
  Description: An advanced create operation for "snapshotting" a single item into a version copy (with associations).

* Hook job framework into solution.

  Initial jobs to provide:
  - the "delayed publish date"
  - delete specific data, after a TTL has been reached (for the Storytold sample app)

* Add "view count" tracking as a built-in feature.

<br />

## To Consider

* Complete support for `authorizedApps` auth rule / infrastructure.

* Add "APIConfig" resource API, to expose endpoint for client applications to manage
  their authorization and configure the API functionality (e.g. setting the resource properties
  that are currently managed in the /config/api-config.js, as well as generating an
  "authorizedApp" credential and saving it to the API for auth capabilities, etc).

* Mount Joint Actions under "action" root property: e.g. `Joint.action.getItem()` ???

* Update the db scenarios for testing:

  - Change all tables to use singular names
  - Rename "users" => "user_account"
  - Rename "user_info" => "user_ext_info"
  - Rename "roles" => "user_role"
  - Finish the schema for the blog_app scenario

* Change the nomenclature of the package/service from "Joint" => "Joint Kit"
  (namely in the logging and error messages, et al).
