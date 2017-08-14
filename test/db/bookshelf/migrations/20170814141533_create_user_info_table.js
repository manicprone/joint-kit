
exports.up = function up(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('user_info', (table) => {
      table.increments();
      table.integer('user_id').notNullable().unsigned().references('users.id');
      table.string('professional_title').nullable();
      table.string('tagline').nullable();
      table.text('description').nullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function down(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_info'),
  ]);
};
