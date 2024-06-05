// ---------------------------------
// Methods for scenario: project-app
// Resource: Project
// ---------------------------------

module.exports = {
  modelName: 'Project',

  methods: [
    {
      name: 'createProject',
      action: 'createItem',
      spec: {
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'alias', type: 'String' /* , defaultValue: '% slugify(name) %' */ },
          { name: 'image_url', type: 'String' },
          { name: 'location', type: 'String' },
          { name: 'brief_description', type: 'String' },
          { name: 'full_description', type: 'String' },
          { name: 'is_internal', type: 'Boolean', defaultValue: false },
          { name: 'status_code', type: 'Number' },
          { name: 'started_at', type: 'String' },
          { name: 'finished_at', type: 'String' },
          { name: 'created_by', type: 'Number' }
        ]
      }
    },
    {
      name: 'updateProject',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true, lookupOr: true },
          { name: 'alias', type: 'String', requiredOr: true, lookupOr: true },
          { name: 'name', type: 'String' },
          { name: 'image_url', type: 'String' },
          { name: 'location', type: 'String' },
          { name: 'brief_description', type: 'String' },
          { name: 'full_description', type: 'String' },
          { name: 'is_internal', type: 'Boolean' },
          { name: 'status_code', type: 'Number' },
          { name: 'started_at', type: 'String' },
          { name: 'finished_at', type: 'String' }
        ]
      }
    },
    {
      name: 'getProject',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'alias', type: 'String', requiredOr: true }
        ]
      }
    },
    {
      name: 'getProjectWithAllRefs',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', required: true }
        ],
        forceLoadDirect: ['coding_language_tags:{id,key}']
      }
    },
    {
      name: 'getProjects',
      action: 'getItems',
      spec: {
        fields: [
          { name: 'status_code', type: 'Number' },
          { name: 'is_internal', type: 'Boolean' }
        ],
        defaultOrderBy: 'name,-updated_at'
      }
    },
    {
      name: 'deleteProject',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'alias', type: 'String', requiredOr: true }
        ]
      }
    },

    // -------------------------------------------------------------------------
    // CodingLanguageTag (association: coding_language_tags)
    // -------------------------------------------------------------------------
    {
      name: 'addCodingLanguageTags',
      action: 'addAssociatedItems',
      spec: {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', required: true }
          ]
        },
        association: {
          name: 'coding_language_tags',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true }
          ]
        }
      }
    },
    {
      name: 'getAllCodingLanguageTags',
      action: 'getAllAssociatedItems',
      spec: {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', required: true }
          ]
        },
        association: {
          name: 'coding_language_tags'
        }
      }
    },
    {
      name: 'detachCodingLanguageTags',
      action: 'removeAssociatedItems',
      spec: {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', required: true }
          ]
        },
        association: {
          name: 'coding_language_tags',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true }
          ]
        }
      }
    },
    {
      name: 'detachAllCodingLanguageTags',
      action: 'removeAllAssociatedItems',
      spec: {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', required: true }
          ]
        },
        association: {
          name: 'coding_language_tags'
        }
      }
    }
  ]
}
