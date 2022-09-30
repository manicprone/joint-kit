// ---------------------------------
// Methods for scenario: project-app
// Resource: ProjectContributor
// ---------------------------------

module.exports = {
  modelName: 'ProjectContributor',

  methods: [
    {
      name: 'createRef',
      action: 'createItem',
      spec: {
        fields: [
          { name: 'project_id', type: 'Number', required: true },
          { name: 'user_id', type: 'Number', required: true },
          { name: 'contributor_role', type: 'String' },
          { name: 'is_active_contributor', type: 'Boolean', defaultValue: true },
          { name: 'started_at', type: 'String' },
          { name: 'finished_at', type: 'String' },
        ],
      },
    },
    {
      name: 'updateRef',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'contributor_role', type: 'String' },
          { name: 'is_active_contributor', type: 'Boolean' },
          { name: 'started_at', type: 'String' },
          { name: 'finished_at', type: 'String' },
        ],
      },
    },
    {
      name: 'getRef',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      },
    },
    {
      name: 'getRefs',
      action: 'getItems',
      spec: {
        fields: [
          { name: 'project_id', type: 'Number' },
          { name: 'is_active_contributor', type: 'Boolean' },
        ],
        defaultOrderBy: '-created_at',
      },
    },
    {
      name: 'deleteRef',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      },
    },
  ],
}
