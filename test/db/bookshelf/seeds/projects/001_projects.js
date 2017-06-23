
const tableName = 'projects';

const seeds = [
  // ----------------------------------------- Projects from user: 4, profile: 1
  {
    id: 1,
    profile_id: 1,
    name: 'How to Organize Anything',
    role: 'Author',
    slug: null,
    tagline: '',
    organization: null,
    image_url: null,
    brief_description: '',
    full_description: '',
    is_professional: false,
    started_at: '2016-07-30T11:20+08:00',
    finished_at: '2016-08-02T21:33+08:00',
  },

  // ----------------------------------------- Projects from user: 4, profile: 2
  {
    id: 2,
    profile_id: 2,
    name: 'NSA',
    role: 'Top Secret Bit Flipper',
    slug: null,
    tagline: 'Alone in a tiny windowless room',
    organization: 'The Collective',
    image_url: null,
    brief_description: '',
    full_description: 'Steady months of isolation and obfuscation.',
    is_professional: true,
    started_at: '2004-05-01',
    finished_at: '2004-12-31',
  },
  {
    id: 3,
    profile_id: 2,
    name: 'DOT',
    role: 'Software Architect/Developer',
    slug: null,
    tagline: '',
    organization: 'The Collective',
    image_url: null,
    brief_description: '',
    full_description: '',
    is_professional: true,
    started_at: '2005-01-01',
    finished_at: '2006-03-05',
  },
  {
    id: 4,
    profile_id: 2,
    name: 'Deep Dark Secret',
    role: 'Software Architect/Developer',
    slug: null,
    tagline: 'Divulge your deep, dark secrets...',
    organization: 'Soloist',
    image_url: null,
    brief_description: '',
    full_description: '',
    is_professional: false,
    started_at: '2007-02-12',
    finished_at: '2007-08-30',
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
