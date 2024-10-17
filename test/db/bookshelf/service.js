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
    filename: './test/db/bookshelf/joint-kit.sqlite3'
  },
  migrations: {
    directory: './test/db/bookshelf/migrations'
  },
  seeds: {
    directory: './test/db/bookshelf/seeds'
  },
  useNullAsDefault: true
})

// Initialize bookshelf
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf
