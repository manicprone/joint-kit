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
          { name: 'version', type: 'String' },
          { name: 'key', type: 'String' },
        ],
      },
    },
    {
      name: 'getContent',
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
