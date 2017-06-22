
const seeds = [
  {
    id: 1,
    external_id: 301,
    email: 'super_admin@demo.com',
    username: 'super-admin',
    display_name: 'Supa Admin',
    avatar_url: null,
  },
  {
    id: 2,
    external_id: 302,
    email: 'admin@demo.com',
    username: 'admin',
    display_name: 'Admin',
    avatar_url: null,
  },
  {
    id: 3,
    external_id: 303,
    email: 'moderator@demo.com',
    username: 'hotmod',
    display_name: 'Hot Mod',
    avatar_url: null,
  },
];

exports.seed = function seed(knex, Promise) {
  return knex('users').del().then(() => {
    return Promise.all(seeds.map((data) => {
      const timestamp = '';

      return knex('users').insert({
        ...data,
        last_login_at: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }));
  });
};
