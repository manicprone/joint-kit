/* eslint-disable no-use-before-define */
const Promise = require('bluebird')
const bookshelf = require('./service')

const resetDB = (seeds, debug) => {
  return teardownDB(debug).then(() => setupDB(seeds, debug))
}

const setupDB = (seeds, debug = false) => {
  if (debug) console.log('[DB-UTILS] setting up database...')

  // Setup tables and seed data
  if (seeds && Array.isArray(seeds) && seeds.length > 0) {
    return bookshelf.knex.migrate.latest()
      .then(() => {
        const seedRootDir = bookshelf.knex.client.config.seeds.directory

        return Promise.mapSeries(seeds, (dirName) => {
          if (debug) console.log('[DB-UTILS] seeding data:', dirName)
          const directory = `${seedRootDir}/${dirName}`
          return bookshelf.knex.seed.run({ directory })
        })
      })
  }

  // Otherwise, just setup tables
  return bookshelf.knex.migrate.latest()
}

const teardownDB = (debug) => {
  if (debug) console.log('[DB-UTILS] tearing down database...')
  return bookshelf.knex.migrate.rollback()
}

const closeDB = (debug = false) => {
  if (debug) console.log('[DB-UTILS] closing database connection...')
  return bookshelf.knex.destroy()
}

module.exports = {
  resetDB,
  setupDB,
  closeDB,
}
