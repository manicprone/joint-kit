module.exports = {

  // -----------------
  // Development (dev)
  // -----------------
  dev: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      database: 'joint_engine_dev',
      user: 'joint',
      password: 'allrolledup',
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },

  // -----------------
  // Production (prod)
  // -----------------
  prod: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },

  // -----------
  // Test (test)
  // -----------
  // test: {
  //   // debug: true,
  //   client: 'sqlite3',
  //   connection: {
  //     filename: './api/test/test.sqlite3',
  //   },
  //   useNullAsDefault: true,
  // },
};
