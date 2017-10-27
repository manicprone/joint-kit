// -----------------------------
// Routes for scenario: blog-app
// (route-config)
// -----------------------------

module.exports = {

  routes: [
    {
      uri: '/user',
      get: {
        method: 'User.getUser',
        successStatus: 200,
        query: true,
        body: false,
      },
      post: {
        method: 'User.createUser',
        successStatus: 201,
        query: true,
        body: true,
      },
    },
    {
      uri: '/user/:id',
      get: {
        method: 'User.getUser',
        successStatus: 200,
        query: true,
        body: false,
        // authRules: {},
        // debug: true,
      },
      post: {
        method: 'User.updateUser',
        successStatus: 200,
        query: true,
        body: true,
      },
      delete: {
        method: 'User.deleteUser',
        successStatus: 204,
        query: false,
        body: false,
      },
    },
    {
      uri: '/users',
      get: {
        method: 'User.getUsers',
        successStatus: 200,
        query: true,
        body: false,
      },
    },
  ], // END - routes

};
