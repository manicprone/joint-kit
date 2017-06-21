// -------------------------------------------
// Joint Persistence Service
// -------------------------------------------
// serviceKey: 'bookshelf'
// service: bookshelf/knex
// -------------------------------------------

// Configure knex for test database...
const knex = require('knex')({
  // debug: true,
  client: 'sqlite3',
  connection: {
    filename: './test/db/bookshelf/joint_core_test.sqlite3',
  },
  migrations: {
    directory: './test/db/bookshelf/migrations',
  },
  useNullAsDefault: true,
});

// Initialize bookshelf...
const bookshelf = require('bookshelf')(knex);

// Enable plugins...
bookshelf.plugin('registry');
bookshelf.plugin('pagination');

module.exports = bookshelf;
