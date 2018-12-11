import moment from 'moment'

const tableName = 'users'

const seeds = [
  {
    id: 1,
    username: 'super-admin',
    external_id: '301',
    email: 'super_admin@demo.com',
    display_name: 'Supa Admin',
    first_name: null,
    last_name: null,
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 2,
    username: 'admin',
    external_id: '302',
    email: 'admin@demo.com',
    display_name: 'Admin',
    first_name: null,
    last_name: null,
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 3,
    username: 'hotmod',
    external_id: '303',
    email: 'moderator@demo.com',
    display_name: 'Hot Mod',
    first_name: null,
    last_name: null,
    preferred_locale: 'en-GB',
    avatar_url: null,
  },
  {
    id: 4,
    username: 'the_manic_edge',
    external_id: '304',
    display_name: 'The Manic Edge',
    email: 'the-manic-edge@demo.com',
    first_name: null,
    last_name: null,
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 5,
    username: 'segmented',
    external_id: '305',
    email: 'segmented@demo.com',
    display_name: 'Segmented',
    first_name: null,
    last_name: null,
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 6,
    username: 'ricksanchez',
    external_id: '306',
    email: 'rick.sanchez@dimensionC-132.verse',
    display_name: 'Rick',
    first_name: null,
    last_name: null,
    preferred_locale: null,
    avatar_url: null,
  },
  {
    id: 7,
    username: 'mortysmith',
    external_id: '307',
    email: 'morty.smith@gmail.com',
    display_name: 'Morty',
    first_name: 'Morty',
    last_name: 'Smith',
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 8,
    username: 'jerrysmith',
    external_id: '308',
    email: 'jerry.smith@aol.com',
    display_name: 'Jerry',
    first_name: 'Jerry',
    last_name: 'Smith',
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 9,
    username: 'bethsmith',
    external_id: '309',
    email: 'beth.smith@gmail.com',
    display_name: 'Beth',
    first_name: 'Beth',
    last_name: 'Smith',
    preferred_locale: 'en-US',
    avatar_url: null,
  },
  {
    id: 10,
    username: 'summersmith',
    external_id: '310',
    email: 'summer.smith@trendymail.org',
    display_name: 'Summer',
    first_name: 'Summer',
    last_name: 'Smith',
    preferred_locale: 'en-US',
    avatar_url: null,
  },
]

exports.seed = function seed(knex, Promise) {
  return knex(tableName).del().then(() => {
    const time = moment().utc()

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes').format()

      return knex(tableName).insert({
        ...data,
        last_login_at: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
      })
    }))
  })
}
