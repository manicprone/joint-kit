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
          // { name: 'app_name', type: 'String', defaultValue: '% namify(app_id) %' },
        ],
      },
    },
    {
      name: 'getRegistry',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true },
        ],
      },
    },
  ],
};
