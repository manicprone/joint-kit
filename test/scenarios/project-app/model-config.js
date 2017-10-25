// --------------------------------
// Models for scenario: project-app
// (model-config)
// --------------------------------

module.exports = {

  modelsEnabled: [
    'UserInfo',
    'Role',
    'UserRole',
    'ProjectContributor',
    'User',
    'CodingLanguageTag',
    'ProjectCodingLanguageTag',
    'Project',
  ],

  models: {
    // A user model, for managing authorization, identity, and permissions
    User: {
      tableName: 'users',
      timestamps: { created: 'created_at', updated: 'updated_at' },
      associations: {
        info: {
          type: 'toOne',
          path: 'id => UserInfo.user_id',
        },
        roles: {
          type: 'toMany',
          path: 'id => UserRole.user_id => UserRole.role_id => Role.id',
        },
        profiles: {
          type: 'toMany',
          path: 'id => Profile.user_id',
        },
      },
    },

    // Extra info supplementing the identity of a user
    UserInfo: {
      tableName: 'user_info',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // A user role
    Role: {
      tableName: 'roles',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // The reference that maps a role to a user
    UserRole: {
      tableName: 'user_roles_ref',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // Tags for identifying programming languages
    CodingLanguageTag: {
      tableName: 'tags_coding_languages',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // A collaborative project
    Project: {
      tableName: 'projects',
      timestamps: { created: 'created_at', updated: 'updated_at' },
      associations: {
        contributors: {
          type: 'toMany',
          path: 'id => ProjectContributor.project_id',
        },
        codingLanguageTags: {
          type: 'toMany',
          path: 'id => ProjectCodingLanguageTag.project_id => ProjectCodingLanguageTag.coding_language_tag_id => CodingLanguageTag.id',
        },
      },
    },

    // The entry that maps a user (contributor) to a project, with extra meta
    ProjectContributor: {
      tableName: 'project_contributors_ref',
      timestamps: { created: 'created_at', updated: 'updated_at' },
      associations: {
        contributor: {
          type: 'toOne',
          path: 'user_id => User.id',
        },
      },
    },

    // The reference that maps a coding language tag to a project
    ProjectCodingLanguageTag: {
      tableName: 'project_coding_language_tags_ref',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },
  }, // END - models

};
