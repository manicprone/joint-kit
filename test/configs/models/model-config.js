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
    'CodingLanguageTag',
    'ProjectCodingLanguageTag',
    'Profile',
    'Project',
  ],

  models: {
    // Manages all registered client applications
    AppRegistry: {
      tableName: 'app_registry',
      timestamps: {
        created: 'registered_at',
      },
    },

    // Provides a modest content persistence solution for registered applications
    AppContent: {
      tableName: 'app_content',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // Provides version and key-based storage of settings data for registered applications
    AppSettings: {
      tableName: 'app_settings',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A user model, for managing authorization, identity, and permissions
    User: {
      tableName: 'users',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A user role
    Role: {
      tableName: 'roles',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // The reference that maps a role to a user
    UserRole: {
      tableName: 'user_roles_ref',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // Tags for identifying programming languages
    CodingLanguageTag: {
      tableName: 'tags_coding_languages',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // The reference that maps a coding language tag to a project
    ProjectCodingLanguageTag: {
      tableName: 'project_coding_language_tags_ref',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // An abstract user profile
    Profile: {
      tableName: 'profiles',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
    },

    // A project entry
    Project: {
      tableName: 'projects',
      timestamps: {
        created: 'created_at',
        updated: 'updated_at',
      },
      associations: {
        profile: {
          type: 'toOne',
          path: 'profile_id => Profile.id',
        },
        user: {
          type: 'toOne',
          path: 'profile_id => Profile.id => Profile.user_id => User.id',
        },
        codingLanguageTags: {
          type: 'toMany',
          path: 'id => ProjectCodingLanguageTag.project_id => ProjectCodingLanguageTag.coding_language_tag_id => CodingLanguageTag.id',
        },
      },
    },
  }, // END - models

};
