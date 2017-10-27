
exports.up = function up(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('project_status', (table) => {
      table.increments();
      table.integer('code').notNullable().unique();
      table.string('alias').notNullable().unique();
      table.string('display_name').nullable();
      table.string('description').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('projects', (table) => {
      table.increments();
      table.string('name').nullable();
      table.string('alias').nullable();
      table.string('image_url').nullable();
      table.string('location').nullable();
      table.text('brief_description').nullable();
      table.text('full_description').nullable();
      table.boolean('is_internal').notNullable().defaultTo(false);
      table.integer('status_code').nullable();
      table.dateTime('started_at').nullable();
      table.dateTime('finished_at').nullable();
      table.integer('created_by').nullable();
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('project_contributors_ref', (table) => {
      table.increments();
      table.integer('project_id').notNullable().unsigned().references('projects.id');
      table.integer('user_id').notNullable().unsigned().references('users.id');
      table.string('contributor_role').nullable();
      table.boolean('is_active_contributor').notNullable().defaultTo(true);
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
    knex.schema.dropTableIfExists('project_contributors_ref'),
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTableIfExists('tags_tech_concepts'),
      knex.schema.dropTableIfExists('tags_coding_languages'),
      knex.schema.dropTableIfExists('tags_software'),
      knex.schema.dropTableIfExists('projects'),
    ]).then(() => {
      return Promise.all([
        knex.schema.dropTableIfExists('project_status'),
      ]);
    });
  });
};
