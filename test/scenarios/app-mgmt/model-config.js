// -----------------------------
// Models for scenario: app-mgmt
// (model-config)
// -----------------------------

module.exports = {

  // modelsEnabled: [
  //   'AppRegistry',
  //   'AppContent',
  //   'AppSettings',
  // ],

  models: {
    // Manages all registered client applications
    AppRegistry: {
      tableName: 'app_registry',
      timestamps: { created: 'registered_at' },
    },

    // Provides a modest content persistence solution for registered applications
    AppContent: {
      tableName: 'app_content',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // Provides version and key-based storage of settings data for registered applications
    AppSettings: {
      tableName: 'app_settings',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },
  }, // END - models

};
