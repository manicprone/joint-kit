// ---------------------------------
// Methods for scenario: project-app
// Resource: CodingLanguageTag
// ---------------------------------

module.exports = {
  modelName: 'CodingLanguageTag',

  methods: [
    {
      name: 'createCodingLanguageTag',
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
      name: 'updateCodingLanguageTag',
      action: 'updateItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true, lookupOr: true },
          { name: 'key', type: 'String', requiredOr: true, lookupOr: true },
          { name: 'label', type: 'String' },
        ],
      },
    },
    {
      name: 'getCodingLanguageTag',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true },
        ],
      },
    },
    {
      name: 'getCodingLanguageTags',
      action: 'getItems',
      spec: {
        defaultOrderBy: 'label',
      },
    },
    {
      name: 'deleteCodingLanguageTag',
      action: 'deleteItem',
      spec: {
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'key', type: 'String', requiredOr: true },
        ],
      },
    },
  ],
}
