module.exports = {
  // ---------------------------
  // Test DB: sqlite3 (embedded)
  // ---------------------------
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test/db/bookshelf/joint_core_test.sqlite3',
    },
    migrations: {
      directory: './test/db/bookshelf/migrations',
    },
    seeds: {
      directory: './test/db/bookshelf/seeds',
    },
  },
};
