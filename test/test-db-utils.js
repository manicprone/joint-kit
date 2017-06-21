import knex from 'knex';

const debug = false;

const db = knex({
  // debug: true,
  client: 'sqlite3',
  connection: {
    filename: './test/joint_core_test.sqlite3',
  },
  migrations: {
    directory: './src/db/migrations',
  },
  useNullAsDefault: true,
});

export function resetDB() {
  return teardownDB().then(() => setupDB());
}

export function setupDB() {
  if (debug) console.log('[TEST-DB-UTILS setting up database...');
  return db.migrate.latest();
}

export function teardownDB() {
  if (debug) console.log('[TEST-DB-UTILS tearing down database...');
  return db.migrate.rollback();
}
