// --------------------------------
// Models for scenario: project-app
// (model-config)
// --------------------------------

module.exports = {

  modelsEnabled: [
    'UserCredentials',
    'UserInfo',
    'Role',
    'UserRole',
    'ProjectContributor',
    'User',
    'Profile',
    'CodingLanguageTag',
    'SoftwareTag',
    'TechConceptTag',
    'ProjectCodingLanguageTag',
    'ProjectSoftwareTag',
    'ProjectTechConceptTag',
    'Project',
  ],

  models: {
    // The user information (for managing identity and permissions)
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

    // Manages local user accounts (credentials and local account controls)
    UserCredentials: {
      tableName: 'user_credentials',
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

    // A user profile
    Profile: {
      tableName: 'user_profiles',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // A tag identifying a coding language (e.g. Java, Clojure, TypeScript)
    CodingLanguageTag: {
      tableName: 'tags_coding_languages',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // A tag identifying a software tool: library, service, framework, product, etc (e.g. React, Amazon AWS, Sketch)
    SoftwareTag: {
      tableName: 'tags_software',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // A tag identifying general tech concepts (e.g. software architecture, machine learning, test-driven development)
    TechConceptTag: {
      tableName: 'tags_tech_concepts',
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
        coding_language_tags: {
          type: 'toMany',
          path: 'id => ProjectCodingLanguageTag.project_id => ProjectCodingLanguageTag.tag_id => CodingLanguageTag.id',
        },
        software_tags: {
          type: 'toMany',
          path: 'id => ProjectSoftwareTag.project_id => ProjectSoftwareTag.tag_id => SoftwareTag.id',
        },
        tech_concept_tags: {
          type: 'toMany',
          path: 'id => ProjectTechConceptTag.project_id => ProjectTechConceptTag.tag_id => TechConceptTag.id',
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

    // The reference that maps a software tag to a project
    ProjectSoftwareTag: {
      tableName: 'project_software_tag_ref',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // The reference that maps a tech concept tag to a project
    ProjectTechConceptTag: {
      tableName: 'project_tech_concept_tag_ref',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },
  }, // END - models

};
