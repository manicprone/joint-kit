// --------------
// Resource: User
// --------------

module.exports = {
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
          { name: 'avatar_url', type: 'String' },
        ],
      },
    },
    {
      name: 'updateUser',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true, lookupField: true },
          { name: 'username', type: 'String' },
          { name: 'email', type: 'String' },
          { name: 'display_name', type: 'String' },
          { name: 'avatar_url', type: 'String' },
        ],
      },
    },
    // {
    //   name: 'markLogin',
    //   action: 'updateItem',
    //   spec: {
    //     fields: [
    //       { name: 'id', type: 'Number', required: true, lookupField: true },
    //       { name: 'last_login_at', type: 'String', autoValue: '% now %' },
    //     ],
    //   },
    // },
    {
      name: 'getUser',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'username', type: 'String', requiredOr: true },
          { name: 'external_id', type: 'String', requiredOr: true },
        ],
        columnsToReturn: ['id', 'external_id', 'username', 'display_name', 'avatar_url'],
        // forceLoadDirect: ['roles:name'],
      },
    },
    {
      name: 'getUsers',
      action: 'getItems',
      spec: {
        columnsToReturn: ['id', 'external_id', 'username', 'display_name', 'avatar_url'],
        defaultOrderBy: '-created_at,username',
        // forceLoadDirect: ['roles:name'],
      },
    },
    {
      name: 'deleteUser',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'username', type: 'String', requiredOr: true },
          { name: 'external_id', type: 'String', requiredOr: true },
        ],
      },
    },
  ],
};
