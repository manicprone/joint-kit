import moment from 'moment';

const tableName = 'users';

const seeds = [
  {
    id: 1,
    external_id: '301',
    email: 'super_admin@demo.com',
    username: 'super-admin',
    display_name: 'Supa Admin',
    avatar_url: null,
  },
  {
    id: 2,
    external_id: '302',
    email: 'admin@demo.com',
    username: 'admin',
    display_name: 'Admin',
    avatar_url: null,
  },
  {
    id: 3,
    external_id: '303',
    email: 'moderator@demo.com',
    username: 'hotmod',
    display_name: 'Hot Mod',
    avatar_url: null,
  },
  {
    id: 4,
    external_id: '304',
    email: 'the-manic-edge@demo.com',
    username: 'the_manic_edge',
    display_name: 'The Manic Edge',
  },
  {
    id: 5,
    external_id: '305',
    email: 'segmented@demo.com',
    username: 'segmented',
    display_name: 'Segmented',
  },
  {
    id: 6,
    external_id: '306',
    email: 'rick.sanchez@dimensionC-132.verse',
    username: 'ricksanchez',
    display_name: 'Rick',
  },
  {
    id: 7,
    external_id: '307',
    email: 'morty.smith@gmail.com',
    username: 'mortysmith',
    display_name: 'Morty',
  },
  {
    id: 8,
    external_id: '308',
    email: 'jerry.smith@aol.com',
    username: 'jerrysmith',
    display_name: 'Jerry',
  },
  {
    id: 9,
    external_id: '309',
    email: 'beth.smith@gmail.com',
    username: 'bethsmith',
    display_name: 'Beth',
  },
  {
    id: 10,
    external_id: '310',
    email: 'summer.smith@trendymail.org',
    username: 'summersmith',
    display_name: 'Summer',
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
