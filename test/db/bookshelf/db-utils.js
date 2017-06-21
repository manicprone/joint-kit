import bookshelf from './bookshelf';

const debug = false;

export function resetDB() {
  return teardownDB().then(() => setupDB());
}

export function setupDB() {
  if (debug) console.log('[DB-UTILS] setting up database...');
  return bookshelf.knex.migrate.latest();
}

export function teardownDB() {
  if (debug) console.log('[DB-UTILS] tearing down database...');
  return bookshelf.knex.migrate.rollback();
}
