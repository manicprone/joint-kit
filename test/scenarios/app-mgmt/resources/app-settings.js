// ------------------------------
// Methods for scenario: app-mgmt
// Resource: AppSettings
// ------------------------------

module.exports = {
  modelName: 'AppSettings',

  methods: [
    {
      name: 'saveSettings',
      action: 'upsertItem',
      spec: {
        fields: [
          { name: 'app_id', type: 'String', required: true, lookup: true },
          // { name: 'app_id', type: 'String', required: true, lookup: true },
          { name: 'data', type: 'JSON', required: true },
          { name: 'key', type: 'String', required: true },
          // { name: 'key', type: 'String', defaultValue: 'default', lookup: true },
        ],
      },
    },
    {
      name: 'getSettings',
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
