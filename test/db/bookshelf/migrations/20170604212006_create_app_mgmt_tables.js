
exports.up = function up(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('app_registry', (table) => {
      table.increments();
      table.string('app_id').notNullable();
      table.string('app_name').nullable();
      table.dateTime('registered_at').nullable();
    }),
    knex.schema.createTableIfNotExists('app_content', (table) => {
      table.increments();
      table.string('app_id').notNullable();
      table.string('key').nullable();
      table.jsonb('data').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('app_settings', (table) => {
      table.increments();
      table.string('app_id').notNullable();
      table.string('key').nullable();
      table.jsonb('data').nullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function down(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('app_registry'),
    knex.schema.dropTableIfExists('app_content'),
    knex.schema.dropTableIfExists('app_settings'),
  ]);
};
