// -------------------------------------------
// Joint Persistence Service
// -------------------------------------------
// serviceKey: 'bookshelf'
// service: bookshelf/knex
// -------------------------------------------
import dbConfig from './knexfile'

const test = dbConfig.test

// Configure knex for test database...
const knex = require('knex')({
  client: test.client,
  connection: test.connection,
  migrations: test.migrations,
  seeds: test.seeds,
  useNullAsDefault: true,
  // debug: true,
})

// Initialize bookshelf...
const bookshelf = require('bookshelf')(knex)

// Enable plugins...
bookshelf.plugin('registry')
bookshelf.plugin('pagination')

// Register models...
const Role = bookshelf.Model.extend({
  tableName: 'roles',
  idAttribute: 'id',
  hasTimestamps: ['created_at', 'updated_at'],
})

const UserRole = bookshelf.Model.extend({
  tableName: 'user_roles_ref',
  idAttribute: 'id',
  hasTimestamps: ['created_at', 'updated_at'],
})

bookshelf.model('Role', Role)
bookshelf.model('UserRole', UserRole)

export default bookshelf
