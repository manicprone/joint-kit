import moment from 'moment'

const tableName = 'project_status'

const seeds = [
  {
    code: 2,
    alias: 'talking',
    display_name: 'Talking',
    description: null,
  },
  {
    code: 3,
    alias: 'pending',
    display_name: 'Pending',
    description: null,
  },
  {
    code: 4,
    alias: 'started',
    display_name: 'Started',
    description: null,
  },
  {
    code: 5,
    alias: 'completed',
    display_name: 'Completed',
    description: null,
  },
]

exports.seed = function seed(knex, Promise) {
  const time = moment().utc()

  return Promise.all(seeds.map((data) => {
    const timestamp = time.add(5, 'minutes').format()

    return knex(tableName).insert({
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    })
  }))
}
