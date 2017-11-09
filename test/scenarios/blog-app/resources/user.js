// ------------------------------
// Methods for scenario: blog-app
// Resource: User
// ------------------------------

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
          { name: 'first_name', type: 'String' },
          { name: 'last_name', type: 'String' },
          { name: 'preferred_locale', type: 'String' },
          { name: 'avatar_url', type: 'String' },
        ],
      },
    },
    {
      name: 'updateUser',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'username', type: 'String' },
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
      name: 'markLogin',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'last_login_at', type: 'String', locked: true, defaultValue: '% now %' },
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
        fieldsToReturn: ['id', 'username', 'display_name', 'avatar_url'],
        // forceLoadDirect: ['roles:name'],
      },
    },
    {
      name: 'getUsers',
      action: 'getItems',
      spec: {
        fields: [
          { name: 'preferred_locale', type: 'String' },
        ],
        fieldsToReturn: ['id', 'username', 'display_name', 'avatar_url'],
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
