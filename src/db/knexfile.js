import dbConfig from './db-config';

const dev = dbConfig.dev;
const prod = dbConfig.prod;

module.exports = {
  dev: {
    client: dev.client,
    connection: dev.connection,
    pool: dev.pool,
    migrations: dev.migrations,
    seeds: dev.seeds,
  },

  prod: {
    client: prod.client,
    connection: prod.connection,
    pool: prod.pool,
    migrations: prod.migrations,
    seeds: prod.seeds,
  },
};
