# Joint Actions / Data Operation Notation


## Features

| Feature                        | Description |
| ------------------------------ | ----------- |
| required field handling        | Supports required field declaration, with built-in validation and error handling. |
| resource relationship handling | Supports complex relationship management and automatic data transformations. |
| returned column data aliasing  | Allows for custom aliasing of returned column data sets. |
| paginated data sets            | Built-in support for the "fetchPage" pagination feature |
| filtered data sets             | Support for "filtered" queries with automatically-generated filter metadata. |
| user-level authorization handling  |   |
| application-level authorization handling |   |
| field input validation         |   |
| return data in native or JSON API Spec format |   |


## Joint Library Actions

### Supported actions

| Action                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| createItem               | The base create operation for a single item |
| upsertItem               | The base upsert operation for a single item |
| updateItem               | The base update operation for a single item |
| getItem                  | The base operation for retrieving a single item  |
| getItems                 | The base operation for retrieving a collection of items |
| deleteItem               | The base delete operation for a single item |
| addAssociatedItems       | Add one to many item associations to a main resource |
| hasAssociatedItem        | Returns the requested associated item, if it is associated, otherwise returns a 404 |
| removeAssociatedItem     | Removes an associated item from a main resource |
| removeAllAssociatedItems | Removes all item instances of an association from a main resource |

> The following actions always run on a transaction: create, upsertItem, updateItem, deleteItem, addAssociatedItems, removeAssociatedItem, removeAllAssociatedItems


### Upcoming actions

| Action                   | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| getAssociatedItems       | Retrieves a collection of associated items from a main resource |
| snapshotItem             | An advanced create operation for "snapshotting" a single item (with associations) |


## Action Examples

### createItem

##### _spec_

```
spec: {
  modelName: 'User',
  fields: [
    { name: 'username', type: 'String', required: true },
    { name: 'external_id', type: 'String' },
    { name: 'email', type: 'String' },
    { name: 'display_name', type: 'String' },
    { name: 'avatar_url', type: 'String' },
    { name: 'is_verified', type: 'Boolean', defaultValue: false },
  ],
}
```

##### _input_

```
input: {
  fields: {
    username: 'segmented',
    external_id: '100333',
    email: 'segmented@fluxmail.org',
    display_name: 'Segmented',
    avatar_url: 'https://the-deep/profile/100333/avatar.png',
  },
}
```


### upsertItem

(provide example)


### updateItem

##### _spec_

```
spec: {
  modelName: 'Post',
  fields: [
    { name: 'id', type: 'Number', lookupField: true },
    { name: 'title', type: 'String' },
    { name: 'body', type: 'String' },
  ],
  auth: {
    ownerCreds: ['profile_id'],
  },
}
```

##### _input_

```
input: {
  fields: {
    id: 1,
    title: 'Updated Post Title',
  },
  trx: trx | null,
  authBundle: {...},
}
```


### getItem

##### _spec_

```
spec: {
  modelName: 'User',
  fields: [
    { name: 'id', type: 'Number', requiredOr: true },
    { name: 'external_id', type: 'Number', requiredOr: true },
    { name: 'username', type: 'String', requiredOr: true },
    { name: 'email', type: 'String', requiredOr: true },
  ],
  columnsToReturn: {
    default: ['id', 'external_id', 'username', 'display_name', 'email', 'avatar_url', 'last_login_at'],
    list: ['id', 'username', 'display_name'],
  },
  auth: {
    ownerCreds: ['id => user_id', 'external_id'],
  },
}
```

##### _input_

```
input: {
  fields: {
    username: 'mastablasta',
  },
  columnSet: 'list',
  relations: ['profiles', 'posts'],
  loadDirect: ['roles:name'],
  trx: trx | null,
  authBundle: {...},
}
```

### getItems

##### _spec_

```
spec: {
  modelName: 'Post',
  fields: [
    { name: 'profile_id', type: 'Number', required: true },
    { name: 'status_id', type: 'Number' },
    { name: 'is_original_content', type: 'Boolean' },
  ],
  defaultOrderBy: '-updated_at,title',
  auth: {
    ownerCreds: ['profile_id'],
  },
}
```

##### _input_

```
input: {
  fields: {
    profile_id: 1,
    status_id: 3,
    is_original_content: true,
  },
  relations: ['profile', 'user', 'customTags'],
  loadDirect: ['roles:name'],
  orderBy: '-title',
  paginate: { skip, limit },
  trx: trx | null,
  authBundle: {...},
}
```


### deleteItem

##### _spec_

```
spec: {
  modelName: 'User',
  fields: [
    { name: 'id', type: 'Number', required: true },
  ],
  auth: {
    ownerCreds: ['id => user_id'],
  },
}
```

##### _input_

```
input: {
  fields: {
    id: 1,
  },
  trx: trx | null,
  authBundle: {...},
}
```


### addAssociatedItems

##### _spec_

```
spec: {
  main: {
    modelName: 'Post',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
    auth: {
      ownerCreds: ['profile_id'],
    },
  },
  association: {
    name: 'tags',
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
}
```

##### _input_ (single resource)

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  association: {
    fields: {
      key: 'tag-001',
    },
  },
  trx: trx | null,
}
```

##### _input_ (multiple resources)

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  association: {
    fields: {
      key: ['tag-002', 'tag-003', 'tag-005'],
    },
  },
  trx: trx | null,
}
```


### hasAssociatedItem

##### _spec_

```
spec: {
  main: {
    modelName: 'Post',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
    auth: {
      ownerCreds: ['profile_id'],
    },
  },
  association: {
    name: 'tags',
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
}
```

##### _input_

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  association: {
    fields: {
      key: 'tag-001',
    },
  },
  trx: trx | null,
}
```


### getAssociatedItems

##### _spec_

```
spec: {
  main: {
    modelName: 'Post',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
    auth: {
      ownerCreds: ['profile_id'],
    },
  },
  association: {
    name: 'tags',
    modelName: 'Tag',
    defaultOrderBy: 'title',
  },
}
```

##### _input_

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  association: {
    orderBy: '-title',
    paginate: { skip, limit },
  },
  trx: trx | null,
}
```


### removeAssociatedItem

##### _spec_

```
spec: {
  main: {
    modelName: 'Post',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
    auth: {
      ownerCreds: ['profile_id'],
    },
  },
  association: {
    name: 'tags',
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
}
```

##### _input_

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  association: {
    fields: {
      key: 'tag-001',
    },
  },
  trx: trx | null,
}
```


### removeAllAssociatedItems

##### _spec_

```
spec: {
  main: {
    modelName: 'Post',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'slug', type: 'String', requiredOr: true },
    ],
    auth: {
      ownerCreds: ['profile_id'],
    },
  },
  association: {
    name: 'tags',
  },
}
```

##### _input_

```
input: {
  main: {
    fields: {
      id: 1,
    },
    authBundle: {...},
  },
  trx: trx | null,
}
```


## To Do

* Mount Joint Actions under "action" root property: e.g. `Joint.action.getItem()`.

* Support AND/OR logic for `fields.lookupField` (for allowing aggregate field lookups)
  e.g. lookup with (app_id AND key), but utilize `required:true` to specify if the
       conjunction is needed. Thus, the option can reflect the pattern of "required / requiredOr"
       i.e. `lookup:true` (implied AND), `lookupOr:true` (uses `Or` like current implementation).

* Support model-config without a `modelsEnabled` property (just optional) ???

* Support `fields.defaultValue` for `getItem`, `getItems`, et al.

* Support auto-injected / overrides for input options (on method config)
  e.g. Enforce => `input.loadDirect: ['roles:key']` on all requests. (`spec.forceLoadDirect`, `spec.forceAssociations`)
  e.g. Support => the markLogin concept (where "now" is injected into input of updateItem action).

* Support `fields.locked: true` option, for permitting a field declaration on a spec, that is
  exposed for automatic handling (i.e. does not accept user-provided input).
  -or-
  Support as: `{ fields.autoValue: '% now %' }` => which locks, plus declares the auto-generated value.

* Implement advanced `fields.defaultValue` option, that supports auto-transforms and other
  useful dynamic mutations.
  e.g. `{ fields.defaultValue: '% camelcase(title) %' }` => which will set the default value
       to the camelcase of the provided "title" field.
  e.g. `{ fields.defaultValue: '% now %' }` => which will set a Date field value to the current date/time.

* Hook input field validation framework into action logic.

* Provide action: "snapshotItem" => which implements "createItem" (copy) on a source
  item (i.e. it looks up a source item, auth checks the source, creates a copy
  or subset copy). Also, handles associations to chain with the snapshot.

* Add "view count" tracking as a built-in feature.

* Add "APIConfig" resource API, to expose endpoint for client applications to manage
  their authorization and configure the API functionality (e.g. setting the resource properties
  that are currently managed in the /config/api-config.js, as well as generating an
  "authorizedApp" credential and saving it to the API for auth capabilities, etc).


## README To Do

* Abstract "The Concept" away from the service implementation (i.e. Bookshelf).
  Just show the "index.js" code snippet, with a comment referencing the "bookshelf configuration"
  and then another code snippet showing the output of the example joint.action... maybe show two action examples ???

* MAYBE: Add an overview section just after "in practice" that describes the concept of the configs / generate
  function.
