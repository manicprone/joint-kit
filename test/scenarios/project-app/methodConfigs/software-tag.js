// ---------------------------------
// Methods for scenario: project-app
// Resource: SoftwareTag
// ---------------------------------

module.exports = {
  modelName: 'SoftwareTag',

  methods: [
    {
      name: 'createSoftwareTag',
      action: 'createItem',
      spec: {
        fields: [
          { name: 'label', type: 'String', required: true },
          { name: 'key', type: 'String', required: true },
          { name: 'created_by', type: 'Number' }
        ]
      }
    },
    {
      name: 'updateSoftwareTag',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true, lookupOr: true },
          { name: 'key', type: 'String', requiredOr: true, lookupOr: true },
          { name: 'label', type: 'String' }
        ]
      }
    },
    {
      name: 'getSoftwareTag',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true }
        ]
      }
    },
    {
      name: 'getSoftwareTags',
      action: 'getItems',
      spec: {
        defaultOrderBy: 'label'
      }
    },
    {
      name: 'deleteSoftwareTag',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true }
        ]
      }
    }
  ]
}
