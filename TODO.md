# Joint Kit Feature Planning


## Upcoming features

* Support model-config without a `modelsEnabled` property (make it optional).

<br />

## README To Do

* For Overview:
  - "The Joint Concept (In Code)" => A set of code blocks, to explain the overall concept of usage.
  - "Joint in Practice" => The current content of "The Joint Concept".

* Build simple diagram to assist in the Joint concept (i.e. how it fits into the application stack).

* Start a formal online doc!!! (jointjs.org)

<br />

## Backlog

* Complete support for `authorizedApps` auth rule / infrastructure.

* Add logic for `rolesAll` auth rule.

* Fix `owner` / `delegateRole` auth rule logic.

* Support multiple configs on single `generate` call.
  e.g. `joint.generate({ modelConfig: [userModels, projectModels] })`;

* Update action "deleteItem" => "deleteItems", to support one to many deletes of a type (model).

* Hook input field validation framework into action logic/syntax.

* Provide action: `snapshotItem` => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.
  Description: An advanced create operation for "snapshotting" a single item into a version copy (with associations).

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
