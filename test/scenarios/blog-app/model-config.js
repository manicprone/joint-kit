// -----------------------------
// Models for scenario: blog-app
// (model-config)
// -----------------------------

module.exports = [
  // Extra info supplementing the identity of a user
  {
    name: 'UserInfo',
    tableName: 'user_info',
    timestamps: { created: 'created_at', updated: 'updated_at' }
  },

  // The reference that maps a role to a user
  {
    name: 'UserRole',
    tableName: 'user_roles_ref',
    timestamps: { created: 'created_at', updated: 'updated_at' }
  },

  // The user information (for managing identity and permissions)
  {
    name: 'User',
    tableName: 'users',
    timestamps: { created: 'created_at', updated: 'updated_at' },
    associations: {
      info: {
        type: 'toOne',
        path: 'id => UserInfo.user_id'
      },
      roles: {
        type: 'toMany',
        path: 'id => UserRole.user_id => UserRole.role_id => Role.id'
      },
      profiles: {
        type: 'toMany',
        path: 'id => Profile.user_id'
      }
    }
  },

  // Manages local user accounts (credentials and local account controls)
  {
    name: 'UserCredentials',
    tableName: 'user_credentials'
  },

  // A user role
  {
    name: 'Role',
    tableName: 'roles',
    timestamps: { created: 'created_at', updated: 'updated_at' }
  },

  // A user profile
  {
    name: 'Profile',
    tableName: 'user_profiles',
    timestamps: { created: 'created_at', updated: 'updated_at' }
  }

]
