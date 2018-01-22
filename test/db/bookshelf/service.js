// -------------------------------------------
// Joint Persistence Service
// -------------------------------------------
// serviceKey: 'bookshelf'
// service: bookshelf/knex
// -------------------------------------------
import dbConfig from './knexfile';

const test = dbConfig.test;

// Configure knex for test database...
const knex = require('knex')({
  client: test.client,
  connection: test.connection,
  migrations: test.migrations,
  seeds: test.seeds,
  useNullAsDefault: true,
  // debug: true,
});

// Initialize bookshelf...
const bookshelf = require('bookshelf')(knex);

// Enable plugins...
bookshelf.plugin('registry');
bookshelf.plugin('pagination');

export default bookshelf;
