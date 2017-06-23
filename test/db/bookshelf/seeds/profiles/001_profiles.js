
const tableName = 'profiles';

const seeds = [
  // ----------------------------------------------------- Profiles from user: 4
  {
    id: 1,
    user_id: 4,
    title: 'Functional Fanatic',
    slug: 'functional-fanatic',
    tagline: 'I don\'t have habits, I have algorithms.',
    description: null,
    is_default: true,
    is_live: true,
  },
  {
    id: 2,
    user_id: 4,
    title: 'Heavy Synapse',
    slug: 'heavy-synapse',
    tagline: '',
    description: null,
    is_default: false,
    is_live: false,
  },
  {
    id: 3,
    user_id: 4,
    title: 'A Life Organized',
    slug: 'a-life-organized',
    tagline: 'Documents of obsessive compulsiveness.',
    description: null,
    is_default: false,
    is_live: true,
  },

  // ----------------------------------------------------- Profiles from user: 5
  {
    id: 4,
    user_id: 5,
    title: 'Blipped Out',
    slug: null,
    tagline: 'Is someone talking?',
    description: null,
    is_default: false,
    is_live: true,
  },
  {
    id: 5,
    user_id: 5,
    title: 'The Bearable Lightness of Disconnection',
    slug: 'the-bearable-lightness-of-disconnection',
    tagline: 'A fluffy life in the clouds.',
    description: null,
    is_default: true,
    is_live: true,
  },

  // ----------------------------------------------------- Profiles from user: 6
  {
    id: 6,
    user_id: 6,
    title: 'The Rickiest',
    slug: 'the-rickiest',
    tagline: '',
    description: null,
    is_default: true,
    is_live: true,
  },

  // ----------------------------------------------------- Profiles from user: 7
  {
    id: 7,
    user_id: 7,
    title: 'The Morty Page',
    slug: 'the-morty-page',
    tagline: '',
    description: null,
    is_default: true,
    is_live: true,
  },
];

exports.seed = function seed(knex, Promise) {
  return knex(tableName).del().then(() => {
    return Promise.all(seeds.map((data) => {
      const timestamp = '';

      return knex(tableName).insert({
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }));
  });
};
