const bookshelf = require('./service')

const setupDB = async (seeds, debug = false) => {
  if (debug) console.log('[DB-UTILS] setting up database...')

  // Setup tables and seed data
  if (seeds && Array.isArray(seeds) && seeds.length > 0) {
    await bookshelf.knex.migrate.latest()

    const seedRootDir = bookshelf.knex.client.config.seeds.directory

    /* eslint-disable no-restricted-syntax */
    for (const dirName of seeds) {
      if (debug) console.log('[DB-UTILS] seeding data:', dirName)
      const directory = `${seedRootDir}/${dirName}`
      /* eslint-disable-next-line no-await-in-loop */
      await bookshelf.knex.seed.run({ directory })
    }
  }

  // Otherwise, just setup tables
  return bookshelf.knex.migrate.latest()
}

const teardownDB = async (debug) => {
  if (debug) console.log('[DB-UTILS] tearing down database...')
  await bookshelf.knex.migrate.rollback()
}

const closeDB = async (debug = false) => {
  if (debug) console.log('[DB-UTILS] closing database connection...')
  await bookshelf.knex.destroy()
}

const resetDB = async (seeds, debug) => {
  await teardownDB(debug)
  await setupDB(seeds, debug)
}

module.exports = {
  setupDB,
  closeDB,
  resetDB
}
