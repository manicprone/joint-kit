// -----------------------------------------------------------------------------
// Default Joint Settings
// -----------------------------------------------------------------------------

export default {

  // ----------------------
  // Model feature settings
  // ----------------------
  model: {
    debugGenerate: false,
  },

  // -----------------------
  // Method feature settings
  // -----------------------
  method: {
    debugGenerate: false,
  },

  // ----------------------
  // Route feature settings
  // ----------------------
  route: {
    debugGenerate: false,
  },

  // ----------------------
  // Authorization settings
  // ----------------------
  auth: {
    attributeForRoles: 'roles',
    sessionNameForUser: 'joint_user',
    debugBuild: false,
    debugCheck: false, // TODO: Add to auth-utils.isAllowed logic !!!
  },

}
