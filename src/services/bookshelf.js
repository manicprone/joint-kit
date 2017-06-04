const dbConfig = require('../config/db-config');

const env = process.env.NODE_ENV || 'dev';

const knex = require('knex')(dbConfig[env]);
const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry');
bookshelf.plugin('pagination');

module.exports = bookshelf;
