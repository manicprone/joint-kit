module.exports = {
  paths: {
    public: 'dist',
  },
  files: {
    javascripts: {
      joinTo: {
        'lib.js': /^src/,
        'vendor.js': /^node_modules/,
      },
    },
  },
};
