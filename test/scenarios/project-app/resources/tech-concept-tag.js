// ---------------------------------
// Methods for scenario: project-app
// Resource: TechConceptTag
// ---------------------------------

module.exports = {
  modelName: 'TechConceptTag',

  methods: [
    {
      name: 'createTechConceptTag',
      action: 'createItem',
      spec: {
        fields: [
          { name: 'label', type: 'String', required: true },
          { name: 'key', type: 'String', required: true },
          { name: 'created_by', type: 'Number' },
        ],
      },
    },
    {
      name: 'updateTechConceptTag',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true, lookupField: true },
          { name: 'key', type: 'String', requiredOr: true, lookupField: true },
          { name: 'label', type: 'String' },
        ],
      },
    },
    {
      name: 'getTechConceptTag',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true },
        ],
      },
    },
    {
      name: 'getTechConceptTags',
      action: 'getItems',
      spec: {
        defaultOrderBy: 'label',
      },
    },
    {
      name: 'deleteTechConceptTag',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true },
        ],
      },
    },
  ],
};
