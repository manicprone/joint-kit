const dbManager = require('knex-db-manager');
const dbConfig = require('../src/config/db-config');

const log = true;

const dbManagerConfig = {
  knex: {
    client: 'postgres',
    connection: dbConfig.dev.connection,
    pool: dbConfig.dev.pool,
    migrations: dbConfig.dev.migrations,
  },
  dbManager: {
    collate: ['C.UTF-8'],
    superUser: 'supa',
    superPassword: '',
  },
};

const DB = dbManager.databaseManagerFactory(dbManagerConfig);
const engine = dbManagerConfig.knex.client;
const owner = dbConfig.dev.connection.user;
const database = dbConfig.dev.connection.database;

if (log) console.log(`[JOINT] [INIT] joint engine bootstrapping (${engine})...`);

DB.createDbOwnerIfNotExist()
  .then(() => {
    if (log) console.log('[JOINT] [INIT] DB owner:', owner);
    return DB.createDb()
      .then(() => {
        if (log) console.log('[JOINT] [INIT] Database created:', database);
      })
      .catch((createDbError) => {
        if (log) console.error('[JOINT] [INIT] encountered an error =>', createDbError);
      });
  })
  .catch((createOwnerError) => {
    if (log) console.error('[JOINT] [INIT] encountered an error =>', createOwnerError);
  })
  .finally(() => {
    DB.close();
    return true;
  });
