// -----------------------------
// Models for scenario: app-mgmt
// (model-config)
// -----------------------------

module.exports = [

  // Manages all registered client applications
  {
    name: 'AppRegistry',
    tableName: 'app_registry',
    timestamps: { created: 'registered_at' },
  },

  // Provides a modest content persistence solution for registered applications
  {
    name: 'AppContent',
    tableName: 'app_content',
    timestamps: { created: 'created_at', updated: 'updated_at' },
  },

  // Provides version and key-based storage of settings data for registered applications
  {
    name: 'AppSettings',
    tableName: 'app_settings',
    timestamps: { created: 'created_at', updated: 'updated_at' },
  },

];
