
exports.up = function up(knex, Promise) {
  return Promise.all([
    // knex.schema.createTableIfNotExists('blog_posts', (table) => {
    //   table.increments();
    //   table.integer('profile_id').notNullable().unsigned().references('blog_profiles.id');
    //   table.string('title').nullable();
    //   table.string('slug').nullable();
    //   table.string('lead_image_url').nullable();
    //   table.text('body').nullable();
    //   table.boolean('is_live').notNullable().defaultTo(false);
    //   table.dateTime('published_at').nullable();
    //   table.timestamps();
    // }),
    knex.schema.createTableIfNotExists('tags', (table) => {
      table.increments()
      table.string('label').notNullable().unique()
      table.string('key').notNullable().unique()
      table.timestamps()
    }),
    knex.schema.createTableIfNotExists('profile_tags_ref', (table) => {
      table.increments()
      table.integer('profile_id').notNullable().unsigned().references('user_profiles.id')
      table.integer('tag_id').notNullable().unsigned().references('tags.id')
      table.timestamps()
    }),
    // knex.schema.createTableIfNotExists('blog_post_tags_ref', (table) => {
    //   table.increments();
    //   table.integer('post_id').notNullable().unsigned().references('blog_posts.id');
    //   table.integer('tag_id').notNullable().unsigned().references('tags.id');
    //   table.timestamps();
    // }),
  ])
}

exports.down = function down(knex, Promise) {
  return Promise.all([
    // knex.schema.dropTableIfExists('blog_post_tags_ref'),
    knex.schema.dropTableIfExists('profile_tags_ref'),
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTableIfExists('tags'),
      // knex.schema.dropTableIfExists('blog_posts'),
    ])
  })
}
