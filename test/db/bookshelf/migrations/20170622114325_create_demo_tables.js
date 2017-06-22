
exports.up = function up(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('users', (table) => {
      table.increments();
      table.integer('external_id').nullable();
      table.string('email').notNullable().unique();
      table.string('username').notNullable().unique();
      table.string('display_name').nullable();
      table.string('avatar_url').nullable();
      table.dateTime('last_login_at').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('roles', (table) => {
      table.increments();
      table.string('name').notNullable().unique();
      table.string('display_name').nullable();
      table.string('description').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('user_roles_ref', (table) => {
      table.increments();
      table.integer('user_id').notNullable().unsigned().references('users.id');
      table.integer('role_id').notNullable().unsigned().references('roles.id');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('profiles', (table) => {
      table.increments();
      table.integer('user_id').notNullable().unsigned().references('users.id');
      table.string('title').nullable();
      table.string('slug').nullable();
      table.string('tagline').nullable();
      table.text('description').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('projects', (table) => {
      table.increments();
      table.integer('profile_id').notNullable().unsigned().references('profiles.id');
      table.string('name').nullable();
      table.string('responsibility').nullable();
      table.string('slug').nullable();
      table.string('tagline').nullable();
      table.string('organization').nullable();
      table.string('image_url').nullable();
      table.text('brief_description').nullable();
      table.text('full_description').nullable();
      table.boolean('is_professional').notNullable().defaultTo(true);
      table.dateTime('started_at').nullable();
      table.dateTime('finished_at').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('tags_software', (table) => {
      table.increments();
      table.string('label').notNullable().unique();
      table.string('key').notNullable().unique();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('tags_coding_languages', (table) => {
      table.increments();
      table.string('label').notNullable().unique();
      table.string('key').notNullable().unique();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('tags_tech_concepts', (table) => {
      table.increments();
      table.string('label').notNullable().unique();
      table.string('key').notNullable().unique();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('project_software_tags_ref', (table) => {
      table.increments();
      table.integer('project_id').notNullable().unsigned().references('projects.id');
      table.integer('software_tag_id').notNullable().unsigned().references('tags_software.id');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('project_coding_language_tags_ref', (table) => {
      table.increments();
      table.integer('project_id').notNullable().unsigned().references('projects.id');
      table.integer('coding_language_tag_id').notNullable().unsigned().references('tags_coding_languages.id');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('project_tech_concepts_tags_ref', (table) => {
      table.increments();
      table.integer('project_id').notNullable().unsigned().references('projects.id');
      table.integer('tech_concept_tag_id').notNullable().unsigned().references('tags_tech_concepts.id');
      table.timestamps();
    }),
  ]);
};

exports.down = function down(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('project_tech_concepts_tags_ref'),
    knex.schema.dropTableIfExists('project_coding_language_tags_ref'),
    knex.schema.dropTableIfExists('project_software_tags_ref'),
    knex.schema.dropTableIfExists('user_roles_ref'),
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTableIfExists('tags_tech_concepts'),
      knex.schema.dropTableIfExists('tags_coding_languages'),
      knex.schema.dropTableIfExists('tags_software'),
      knex.schema.dropTableIfExists('roles'),
      knex.schema.dropTableIfExists('projects'),
    ]).then(() => {
      return Promise.all([
        knex.schema.dropTableIfExists('profiles'),
      ]).then(() => {
        return Promise.all([
          knex.schema.dropTableIfExists('users'),
        ]);
      });
    });
  });
};
