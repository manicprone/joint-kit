# Joint Lib

A Node server library for rapidly implementing persisted data action logic.  


> [Part of the Joint Stack]


## Install

`npm install joint-lib`


## How to Use the Library

[TBC]


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
| addAssociatedItem        | Add an item association to a main resource |
| hasAssociatedItem        | Returns the requested associated item, if it is associated, otherwise returns a 404 |
| removeAssociatedItem     | Removes an associated item from a main resource |
| removeAllAssociatedItems | Removes all item instances of an association from a main resource |

> The following actions always run on a transaction: create, upsertItem, updateItem, deleteItem, addAssociatedItem, removeAssociatedItem, removeAllAssociatedItems


### Upcoming actions

| Action                   | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| getAssociatedItems       | Retrieves a collection of associated items from a main resource |
| snapshotItem             | An advanced create operation for "snapshotting" a single item (with associations) |


## Data Operation Notation (Spec/Input Options)

All available properties

### Spec

| Option              | Description | Actions Supported               | Required? |
| ------------------- | ----------- | ------------------------------  | --------- |
| modelName           |             | (all)                           |  Yes      |
| fields              |             | (all)                           |  Yes (* except getItems) |
| fields.lookupField  |             | (all)                           |  Yes for upsertItem, updateItem |
| fields.defaultValue |             | createItem, upsertItem, getItem |  No       |
| columnsToReturn     |             | getItem, getItems               |  No       |
| defaultOrderBy      |             | getItems                        |  No       |
| forceRelations      |             | getItem, getItems               |  No       |
| forceLoadDirect     |             | getItem, getItems               |  No       |
| auth                |             | (all)                           |  No       |

### Input

| Option         | Description | Actions Supported | Required? |
| -------------- | ----------- | ----------------  | --------- |
| fields         |             | (all)             |  Yes (* except getItems) |
| columnSet      |             | getItem, getItems |  No       |
| relations      |             | getItem, getItems |  No       |
| loadDirect     |             | getItem, getItems |  No       |
| orderBy        |             | getItems          |  No       |
| paginate       |             | getItems          |  No       |
| trx            |             | (all)             |  No       |
| authBundle     |             | (all)             |  No       |


## Action Examples

### createItem

(provide example)


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


### addAssociatedItem

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
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
  associationName: 'tags',
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
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
  associationName: 'tags',
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
    modelName: 'Tag',
    defaultOrderBy: 'title',
  },
  associationName: 'tags',
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
    modelName: 'Tag',
    fields: [
      { name: 'id', type: 'Number', requiredOr: true },
      { name: 'key', type: 'String', requiredOr: true },
    ],
  },
  associationName: 'tags',
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
  associationName: 'tags',
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



## The Joint Stack


```

   JointServer                                   -  route-config.js
   [HTTP API] Express

                      |
                      |
. __________________________________________ .
|                                            |
|  JointLib                                  |   -  method-config.js
|  [SDK] Bookshelf/knex, DON                 |   -  model-config.js
|                                            |                       
. __________________________________________ .

                      |
                      |
   JointEngine                                   -  db-config.js
   [Persistence] Postgres, Bookshelf/knex

```

## License
