import moment from 'moment';

const tableName = 'users';

const seeds = [
  {
    id: 1,
    external_id: '301',
    username: 'super-admin',
    display_name: 'Supa Admin',
    email: 'super_admin@demo.com',
    avatar_url: null,
  },
  {
    id: 2,
    external_id: '302',
    username: 'admin',
    display_name: 'Admin',
    email: 'admin@demo.com',
    avatar_url: null,
  },
  {
    id: 3,
    external_id: '303',
    username: 'hotmod',
    display_name: 'Hot Mod',
    email: 'moderator@demo.com',
    avatar_url: null,
  },
  {
    id: 4,
    external_id: '304',
    username: 'the_manic_edge',
    display_name: 'The Manic Edge',
    email: 'the-manic-edge@demo.com',
  },
  {
    id: 5,
    external_id: '305',
    username: 'segmented',
    display_name: 'Segmented',
    email: 'segmented@demo.com',
    avatar_url: null,
  },
  {
    id: 6,
    external_id: '306',
    username: 'ricksanchez',
    display_name: 'Rick',
    email: 'rick.sanchez@dimensionC-132.verse',
    avatar_url: null,
  },
  {
    id: 7,
    external_id: '307',
    username: 'mortysmith',
    display_name: 'Morty',
    email: 'morty.smith@gmail.com',
    avatar_url: null,
  },
  {
    id: 8,
    external_id: '308',
    username: 'jerrysmith',
    display_name: 'Jerry',
    email: 'jerry.smith@aol.com',
    avatar_url: null,
  },
  {
    id: 9,
    external_id: '309',
    username: 'bethsmith',
    display_name: 'Beth',
    email: 'beth.smith@gmail.com',
    avatar_url: null,
  },
  {
    id: 10,
    external_id: '310',
    username: 'summersmith',
    display_name: 'Summer',
    email: 'summer.smith@trendymail.org',
    avatar_url: null,
  },
];

exports.seed = function seed(knex, Promise) {
  return knex(tableName).del().then(() => {
    const time = moment().utc();

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes');

      return knex(tableName).insert({
        ...data,
        last_login_at: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }));
  });
};
