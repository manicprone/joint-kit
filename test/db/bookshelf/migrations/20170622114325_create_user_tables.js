const tableNameUsers = 'users'
const tableNameUserCredentials = 'user_credentials'
const tableNameUserInfo = 'user_info'
const tableNameRoles = 'roles'
const tableNameUserRolesRef = 'user_roles_ref'
const tableNameUserProfiles = 'user_profiles'

exports.up = function up(knex) {
  return Promise.all([
    knex.schema.hasTable(tableNameUsers).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameUsers, (table) => {
        table.increments()
        table.string('external_id').nullable()
        table.string('username').notNullable().unique()
        table.string('email').nullable().unique()
        table.string('display_name').nullable()
        table.string('first_name').nullable()
        table.string('last_name').nullable()
        table.string('preferred_locale').nullable()
        table.string('avatar_url').nullable()
        table.dateTime('last_login_at').nullable()
        table.string('father_user_id').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameUserCredentials).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameUserCredentials, (table) => {
        table.string('username').notNullable().unique()
        table.string('credentials').nullable()
        table.integer('failed_attempts').notNullable().defaultTo(0)
        table.boolean('is_locked').notNullable().defaultTo(false)
        table.dateTime('last_accessed_at').nullable()
      })
    }),
    knex.schema.hasTable(tableNameUserInfo).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameUserInfo, (table) => {
        table.increments()
        table.integer('user_id').notNullable().unsigned().references('users.id')
        table.string('professional_title').nullable()
        table.string('tagline').nullable()
        table.text('description').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameRoles).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameRoles, (table) => {
        table.increments()
        table.string('name').notNullable().unique()
        table.string('display_name').nullable()
        table.string('description').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameUserRolesRef).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameUserRolesRef, (table) => {
        table.increments()
        table.integer('user_id').notNullable().unsigned().references('users.id')
        table.integer('role_id').notNullable().unsigned().references('roles.id')
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameUserProfiles).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameUserProfiles, (table) => {
        table.increments()
        table.integer('user_id').notNullable().unsigned().references('users.id')
        table.string('title').nullable()
        table.string('slug').nullable()
        table.string('tagline').nullable()
        table.string('avatar_url').nullable()
        table.text('description').nullable()
        table.boolean('is_default').notNullable().defaultTo(false)
        table.boolean('is_live').notNullable().defaultTo(false)
        table.timestamps()
      })
    }),
  ])
}

exports.down = function down(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists(tableNameUserProfiles),
    knex.schema.dropTableIfExists(tableNameUserRolesRef),
    knex.schema.dropTableIfExists(tableNameUserCredentials),
    knex.schema.dropTableIfExists(tableNameUserInfo),
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTableIfExists(tableNameRoles),
      knex.schema.dropTableIfExists(tableNameUsers),
    ])
  })
}
