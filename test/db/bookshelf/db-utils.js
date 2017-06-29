import Promise from 'bluebird';
import bookshelf from './bookshelf';

const debug = false;

export function resetDB(seeds) {
  return teardownDB().then(() => setupDB(seeds));
}

export function setupDB(seeds) {
  if (debug) console.log('[DB-UTILS] setting up database...');

  // Setup tables and seed data...
  if (seeds && Array.isArray(seeds) && seeds.length > 0) {
    return bookshelf.knex.migrate.latest()
      .then(() => {
        const seedRootDir = bookshelf.knex.client.config.seeds.directory;

        return Promise.mapSeries(seeds, (dirName) => {
          if (debug) console.log('[DB-UTILS] seeding data:', dirName);
          const directory = `${seedRootDir}/${dirName}`;
          return bookshelf.knex.seed.run({ directory });
        });
      });
  }

  // Otherwise, just setup tables...
  return bookshelf.knex.migrate.latest();
}

export function teardownDB() {
  if (debug) console.log('[DB-UTILS] tearing down database...');
  return bookshelf.knex.migrate.rollback();
}
