const tableNameAppRegistry = 'app_registry'
const tableNameAppContent = 'app_content'
const tableNameAppSettings = 'app_settings'

exports.up = function up(knex) {
  return Promise.all([
    knex.schema.hasTable(tableNameAppRegistry).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameAppRegistry, (table) => {
        table.increments()
        table.string('app_id').notNullable()
        table.string('app_name').nullable()
        table.dateTime('registered_at').nullable()
      })
    }),
    knex.schema.hasTable(tableNameAppContent).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameAppContent, (table) => {
        table.increments()
        table.string('app_id').notNullable()
        table.string('key').nullable()
        table.jsonb('data').nullable()
        table.timestamps()
      })
    }),
    knex.schema.hasTable(tableNameAppSettings).then((exists) => {
      if (exists) return false
      return knex.schema.createTable(tableNameAppSettings, (table) => {
        table.increments()
        table.string('app_id').notNullable()
        table.string('key').nullable()
        table.jsonb('data').nullable()
        table.timestamps()
      })
    }),
  ])
}

exports.down = function down(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists(tableNameAppRegistry),
    knex.schema.dropTableIfExists(tableNameAppContent),
    knex.schema.dropTableIfExists(tableNameAppSettings),
  ])
}
