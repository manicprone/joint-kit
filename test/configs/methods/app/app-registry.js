// ---------------------
// Resource: AppRegistry
// ---------------------

module.exports = {
  modelName: 'AppRegistry',

  methods: [
    {
      name: 'saveRegistry',
      action: 'upsertItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true, lookupField: true },
          { name: 'app_name', type: 'String' },
        ],
      },
    },
    {
      name: 'getRegistry',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'version', type: 'String' },
          { name: 'key', type: 'String' },
        ],
      },
    },
  ],
};
