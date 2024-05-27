const moment = require('moment')

const tableName = 'app_content'

const seeds = [
  // ---------------------------------------------------------------------------
  // app_id: app-001
  // ---------------------------------------------------------------------------
  {
    id: 1,
    app_id: 'app-001',
    key: 'default',
    data: '{ "items_per_page": 50, "is_activated": false, "modules": ["a", "b", "c"] }',
  },
  {
    id: 2,
    app_id: 'app-001',
    key: 'v1.0',
    data: '{ "items_per_page": 25, "is_activated": true, "modules": ["a", "b", "c", "x", "y", "z"] }',
  },
  {
    id: 3,
    app_id: 'app-001',
    key: 'v2.0',
    data: '{ "items_per_page": 100, "is_activated": true, "modules": ["d", "e", "f", "g"] }',
  },

  // ---------------------------------------------------------------------------
  // app_id: app-002
  // ---------------------------------------------------------------------------
  {
    id: 4,
    app_id: 'app-002',
    key: 'default',
    data: '{ "title": "The Standard", "is_activated": false, "modules": ["one", "two", "three"] }',
  },
  {
    id: 5,
    app_id: 'app-002',
    key: 'advanced',
    data: '{ "title": "The Advanced", "is_activated": true, "modules": ["six", "seven", "eight", "nine", "ten"] }',
  },
]

exports.seed = function seed(knex) {
  return knex(tableName).del().then(() => {
    const time = moment().utc()

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes').format()

      return knex(tableName).insert({
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      })
    }))
  })
}
