# Joint Kit Feature Planning


## Upcoming features

<br />

## README To Do

* Update README, now that the docs have moved to an official site.

* Build simple diagram to assist in the Joint concept (i.e. how it fits into the application stack).

<br />

## Backlog

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

* Hook input field validation framework into action logic/syntax.

* Support multiple configs on single `generate` call.
  e.g. `joint.generate({ modelConfig: [userModels, projectModels] })`;

* Update action "deleteItem" => "deleteItems", to support one to many deletes of a type (model).

* Provide action: `snapshotItem` => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.
  Description: An advanced create operation for "snapshotting" a single item into a version copy (with associations).

* Hook job framework into solution.
  (A starting use case can be the "delayed publish date", e.g.)

* Add "view count" tracking as a built-in feature.

* Add "APIConfig" resource API, to expose endpoint for client applications to manage
  their authorization and configure the API functionality (e.g. setting the resource properties
  that are currently managed in the /config/api-config.js, as well as generating an
  "authorizedApp" credential and saving it to the API for auth capabilities, etc).

<br />

## To Consider

* Mount Joint Actions under "action" root property: e.g. `Joint.action.getItem()` ???

<br />
