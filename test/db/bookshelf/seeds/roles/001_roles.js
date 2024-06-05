const moment = require('moment')

const tableName = 'roles'

const seeds = [
  {
    id: 1,
    name: 'transcendent',
    display_name: 'Transcendent',
    description: 'Has no limits.'
  },
  {
    id: 2,
    name: 'admin',
    display_name: 'Admin',
    description: 'Can view and manage users, system data, and application settings'
  },
  {
    id: 3,
    name: 'moderator',
    display_name: 'Moderator',
    description: 'Can view and moderate all user-generated content'
  },
  {
    id: 4,
    name: 'developer',
    display_name: 'Developer',
    description: 'Can access Developer Tools.'
  },
  {
    id: 5,
    name: 'blogger',
    display_name: 'Blogger',
    description: 'Can create blog profiles and blog posts.'
  }
]

exports.seed = function seed (knex) {
  const time = moment().utc()

  return Promise.all(seeds.map((data) => {
    const timestamp = time.add(5, 'minutes').format()

    return knex(tableName).insert({
      ...data,
      created_at: timestamp,
      updated_at: timestamp
    })
  }))
}
