// ---------------------------------
// Methods for scenario: project-app
// Resource: UserInfo
// ---------------------------------

module.exports = {
  modelName: 'UserInfo',

  methods: [
    {
      name: 'createUserInfo',
      action: 'createItem',
      spec: {
        fields: [
          { name: 'user_id', type: 'Number', required: true },
          { name: 'tagline', type: 'String' },
          { name: 'description', type: 'String' },
          { name: 'professional_title', type: 'String' }
        ]
      }
    },
    {
      name: 'updateUserInfo',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'user_id', type: 'Number', required: true, lookup: true },
          { name: 'tagline', type: 'String' },
          { name: 'description', type: 'String' },
          { name: 'professional_title', type: 'String' }
        ]
      }
    }
  ]
}
