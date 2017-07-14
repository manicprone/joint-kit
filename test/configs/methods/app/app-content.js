// --------------------
// Resource: AppContent
// --------------------

module.exports = {
  modelName: 'AppContent',

  methods: [
    {
      name: 'saveContent',
      action: 'upsertItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true, lookupField: true },
          // { name: 'app_id', type: 'String', required: true, lookup: true },
          { name: 'data', type: 'JSON', required: true },
          { name: 'key', type: 'String', required: true },
          // { name: 'key', type: 'String', defaultValue: 'default', lookup: true },
        ],
      },
    },
    {
      name: 'getContent',
      action: 'getItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'key', type: 'String', required: true },
          // { name: 'key', type: 'String', defaultValue: 'default' },
        ],
      },
    },
  ],
};
