// -------------------------------------------
// Joint Persistence Service
// -------------------------------------------
// serviceKey: 'bookshelf'
// service: bookshelf/knex
// -------------------------------------------

// Configure knex for embedded database
const knex = require('knex')({
  debug: false,
  client: 'sqlite3',
  connection: {
    filename: './test/db/bookshelf/joint-kit.sqlite3',
  },
  migrations: {
    directory: './test/db/bookshelf/migrations',
  },
  seeds: {
    directory: './test/db/bookshelf/seeds',
  },
  useNullAsDefault: true,
})

// Initialize bookshelf
const bookshelf = require('bookshelf')(knex)

// Register models
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

module.exports = bookshelf
