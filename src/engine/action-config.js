module.exports = {
  // ----------------------
  // Joint Engine (Actions)
  // ----------------------

  modulesEnabled: [
    'app',
  ],

  modules: {
    // -----------
    // Module: app
    // -----------
    app: {
      resources: [
        // ---------------------
        // Resource: AppRegistry
        // ---------------------
        {
          modelName: 'AppRegistry',
          methods: [{
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
          }],
        }, // END - AppRegistry

        // ---------------------
        // Resource: AppContent
        // ---------------------
        {
          modelName: 'AppContent',
          methods: [{
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
          }],
        }, // END - AppContent
      ],
    }, // END - app

  }, // END - modules
};
