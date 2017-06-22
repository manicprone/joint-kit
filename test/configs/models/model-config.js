// --------------------------
// Demo Models (model-config)
// --------------------------

module.exports = {

  modelsEnabled: [
    'AppRegistry',
    'AppContent',
    'AppSettings',
    'User',
    'Role',
    'UserRole',
    'Profile',
    'Project',
  ],

  models: {
    // Manages all registered client applications
    AppRegistry: {
      tableName: 'app_registry',
      idAttribute: 'id',
      timestamps: {
        created: 'registered_at',
      },
    },

    // Provides a modest content persistence solution for registered applications
    AppContent: {
      tableName: 'app_content',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // Provides version and key-based storage of settings data for registered applications
    AppSettings: {
      tableName: 'app_settings',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A user model, for managing authorization, identity, and permissions
    User: {
      tableName: 'users',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A user role
    Role: {
      tableName: 'roles',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // The reference mapping a role to a user
    UserRole: {
      tableName: 'user_roles_ref',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // An abstract user profile
    Profile: {
      tableName: 'profiles',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A project entry
    Project: {
      tableName: 'projects',
      idAttribute: 'id',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },
  }, // END - models

};
