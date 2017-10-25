// -----------------------------
// Models for scenario: blog-app
// (model-config)
// -----------------------------

module.exports = {

  modelsEnabled: [
    'UserInfo',
    'Role',
    'UserRole',
    'User',
    // 'ProfileTag',
    // 'PostTag',
    // 'Tag',
    'Profile',
    // 'Post',
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

    // A blog profile for generating posts
    Profile: {
      tableName: 'profiles',
      timestamps: { created: 'created_at', updated: 'updated_at' },
    },

    // Tags for describing profiles and posts
    // Tag: {
    //   tableName: 'tags',
    //   timestamps: { created: 'created_at', updated: 'updated_at' },
    // },

    // A blog post
    // Post: {
    //   tableName: 'blog_posts',
    //   timestamps: { created: 'created_at', updated: 'updated_at' },
    //   associations: {
    //     profile: {
    //       type: 'toOne',
    //       path: 'profile_id => Profile.id',
    //     },
    //     user: {
    //       type: 'toOne',
    //       path: 'profile_id => Profile.id => Profile.user_id => User.id',
    //     },
    //     tags: {
    //       type: 'toMany',
    //       path: 'id => PostTag.post_id => PostTag.tag_id => Tag.id',
    //     },
    //   },
    // },
  }, // END - models

};
