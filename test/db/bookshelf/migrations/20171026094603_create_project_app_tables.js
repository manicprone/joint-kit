const tableNameProjectStatus = 'project_status'
const tableNameProjects = 'projects'
const tableNameProjectContributorsRef = 'project_contributors_ref'
const tableNameProjectTagsSoftware = 'tags_software'
const tableNameProjectTagsCodingLanguages = 'tags_coding_languages'
const tableNameProjectTagsTechConcepts = 'tags_tech_concepts'
const tableNameProjectSoftwareTagsRef = 'project_software_tags_ref'
const tableNameProjectCodingLanguageTagsRef = 'project_coding_language_tags_ref'
const tableNameProjectTechConceptsTagsRef = 'project_tech_concepts_tags_ref'

exports.up = function up (knex) {
  return Promise.all([
    knex.schema.hasTable(tableNameProjectStatus).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectStatus, (table) => {
        table.increments()
        table.integer('code').notNullable().unique()
        table.string('alias').notNullable().unique()
        table.string('display_name').nullable()
        table.string('description').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjects).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjects, (table) => {
        table.increments()
        table.string('name').nullable()
        table.string('alias').nullable()
        table.string('image_url').nullable()
        table.string('location').nullable()
        table.text('brief_description').nullable()
        table.text('full_description').nullable()
        table.boolean('is_internal').notNullable().defaultTo(false)
        table.integer('status_code').nullable()
        table.dateTime('started_at').nullable()
        table.dateTime('finished_at').nullable()
        table.integer('created_by').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectContributorsRef).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectContributorsRef, (table) => {
        table.increments()
        table.integer('project_id').notNullable().unsigned().references('projects.id')
        table.integer('user_id').notNullable().unsigned().references('users.id')
        table.string('contributor_role').nullable()
        table.boolean('is_active_contributor').notNullable().defaultTo(true)
        table.dateTime('started_at').nullable()
        table.dateTime('finished_at').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectTagsSoftware).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectTagsSoftware, (table) => {
        table.increments()
        table.string('label').notNullable().unique()
        table.string('key').notNullable().unique()
        table.integer('created_by').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectTagsCodingLanguages).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectTagsCodingLanguages, (table) => {
        table.increments()
        table.string('label').notNullable().unique()
        table.string('key').notNullable().unique()
        table.integer('created_by').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectTagsTechConcepts).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectTagsTechConcepts, (table) => {
        table.increments()
        table.string('label').notNullable().unique()
        table.string('key').notNullable().unique()
        table.integer('created_by').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectSoftwareTagsRef).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectSoftwareTagsRef, (table) => {
        table.increments()
        table.integer('project_id').notNullable().unsigned().references('projects.id')
        table.integer('tag_id').notNullable().unsigned().references('tags_software.id')
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectCodingLanguageTagsRef).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectCodingLanguageTagsRef, (table) => {
        table.increments()
        table.integer('project_id').notNullable().unsigned().references('projects.id')
        table.integer('tag_id').notNullable().unsigned().references('tags_coding_languages.id')
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameProjectTechConceptsTagsRef).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameProjectTechConceptsTagsRef, (table) => {
        table.increments()
        table.integer('project_id').notNullable().unsigned().references('projects.id')
        table.integer('tag_id').notNullable().unsigned().references('tags_tech_concepts.id')
        table.timestamps()
      })
    })
  ])
}

exports.down = function down (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists(tableNameProjectTechConceptsTagsRef),
    knex.schema.dropTableIfExists(tableNameProjectCodingLanguageTagsRef),
    knex.schema.dropTableIfExists(tableNameProjectSoftwareTagsRef),
    knex.schema.dropTableIfExists(tableNameProjectContributorsRef)
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTableIfExists(tableNameProjectTagsTechConcepts),
      knex.schema.dropTableIfExists(tableNameProjectTagsCodingLanguages),
      knex.schema.dropTableIfExists(tableNameProjectTagsSoftware),
      knex.schema.dropTableIfExists(tableNameProjects)
    ]).then(() => {
      return Promise.all([
        knex.schema.dropTableIfExists(tableNameProjectStatus)
      ])
    })
  })
}
