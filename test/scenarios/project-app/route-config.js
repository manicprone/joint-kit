// --------------------------------
// Routes for scenario: project-app
// (route-config)
// --------------------------------

module.exports = {

  routes: [
    // -------------------------------------------------------------------- User
    {
      uri: '/user',
      get: { method: 'User.getUser' },
      post: { method: 'User.createUser', successStatus: 201, body: true },
    },
    {
      uri: '/user/:id',
      get: { method: 'User.getUser' },
      post: { method: 'User.updateUser', body: true },
      delete: { method: 'User.deleteUser', successStatus: 204, query: false },
    },
    {
      uri: '/users',
      get: { method: 'User.getUsers' },
    },

    // ----------------------------------------------------------------- Project
    {
      uri: '/project',
      post: { method: 'Project.createProject', successStatus: 201, body: true },
    },
    {
      uri: '/project/:id',
      get: { method: 'Project.getProject' },
      post: { method: 'Project.updateProject', body: true },
      delete: { method: 'Project.deleteProject', successStatus: 204 },
    },
    {
      uri: '/projects',
      get: { method: 'Project.getProjects' },
    },

    // ----------------------------------------------------- Project Contributor
    {
      uri: '/project-contributor',
      post: { method: 'ProjectContributor.createRef', successStatus: 201, body: true },
    },
    {
      uri: '/project-contributor/:id',
      get: { method: 'ProjectContributor.getRef' },
      post: { method: 'ProjectContributor.updateRef', body: true },
      delete: { method: 'ProjectContributor.deleteRef', successStatus: 204 },
    },
    {
      uri: '/project-contributors',
      get: { method: 'ProjectContributor.getRefs' },
    },

    // ------------------------------------------------------- CodingLanguageTag
    {
      uri: '/coding-language-tag',
      post: { method: 'CodingLanguageTag.createCodingLanguageTag', successStatus: 201, body: true },
    },
    {
      uri: '/coding-language-tag/:id',
      post: { method: 'CodingLanguageTag.updateCodingLanguageTag', body: true },
      delete: { method: 'CodingLanguageTag.deleteCodingLanguageTag', successStatus: 204 },
    },
    {
      uri: '/coding-language-tags',
      get: { method: 'CodingLanguageTag.getCodingLanguageTags' },
    },

    // ------------------------------------------------------------- SoftwareTag
    {
      uri: '/software-tag',
      post: { method: 'SoftwareTag.createSoftwareTag', successStatus: 201, body: true },
    },
    {
      uri: '/software-tag/:id',
      post: { method: 'SoftwareTag.updateSoftwareTag', body: true },
      delete: { method: 'SoftwareTag.deleteSoftwareTag', successStatus: 204 },
    },
    {
      uri: '/software-tags',
      get: { method: 'SoftwareTag.getSoftwareTags' },
    },

    // ---------------------------------------------------------- TechConceptTag
    {
      uri: '/tech-concept-tag',
      post: { method: 'TechConceptTag.createTechConceptTag', successStatus: 201, body: true },
    },
    {
      uri: '/tech-concept-tag/:id',
      post: { method: 'TechConceptTag.updateTechConceptTag', body: true },
      delete: { method: 'TechConceptTag.deleteTechConceptTag', successStatus: 204 },
    },
    {
      uri: '/tech-concept-tags',
      get: { method: 'TechConceptTag.getTechConceptTags' },
    },
  ], // END - routes

};
