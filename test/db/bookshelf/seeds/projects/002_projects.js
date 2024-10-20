const moment = require('moment')

const tableName = 'projects'

const seeds = [
  // ---------------------------------------------------------------------------
  // Internal Projects
  // ---------------------------------------------------------------------------
  {
    id: 1,
    name: 'Mega-Seed Mini-Sythesizer',
    alias: 'mega-seed-mini-sythesizer',
    image_url: 'http://vignette4.wikia.nocookie.net/rickandmorty/images/e/e8/Speed_Mega_Seed.png/revision/latest',
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: true,
    status_code: 4,
    started_at: '2016-07-30T11:20+08:00',
    finished_at: '2016-08-02T21:33+08:00',
    created_by: null
  },
  {
    id: 2,
    name: 'Turn Myself into a Pickle',
    alias: 'turn-myself-into-a-pickle',
    image_url: 'https://everydayaboverubies.files.wordpress.com/2011/11/jar_of_pickles_cb101311.jpg',
    location: null,
    brief_description: 'Turn myself into a pickle.',
    full_description: null,
    is_internal: true,
    status_code: 5,
    started_at: null,
    finished_at: null,
    created_by: null
  },
  {
    id: 3,
    name: 'Doppelgänger Finder',
    alias: 'doppelganger-finder',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: true,
    status_code: 5,
    started_at: '2017-03-10',
    finished_at: '2017-03-29',
    created_by: null
  },
  {
    id: 4,
    name: 'Blue Dreamsicles',
    alias: 'blue-dreamsicles',
    image_url: 'https://i.pinimg.com/736x/53/2e/e1/532ee1735e657073f4063a2cbed4e7f1--jello-popsicles-aqua-blue.jpg',
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: true,
    status_code: 3,
    started_at: null,
    finished_at: null,
    created_by: null
  },

  // ---------------------------------------------------------------------------
  // External Projects
  // (for pagination / orderBy testing)
  // ---------------------------------------------------------------------------
  {
    id: 5,
    name: 'E - Project 001',
    alias: 'project-001',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 4,
    started_at: '2017-01-01',
    finished_at: null,
    created_by: null
  },
  {
    id: 6,
    name: 'J - Project 002',
    alias: 'project-002',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 5,
    started_at: '2017-03-10',
    finished_at: '2017-03-29',
    created_by: null
  },
  {
    id: 7,
    name: 'P - Project 003',
    alias: 'project-003',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 3,
    started_at: null,
    finished_at: null,
    created_by: null
  },
  {
    id: 8,
    name: 'W - Project 004',
    alias: 'project-004',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 3,
    started_at: null,
    finished_at: null,
    created_by: null
  },
  {
    id: 9,
    name: 'L - Project 005',
    alias: 'project-005',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 5,
    started_at: '2017-06-02',
    finished_at: '2017-08-01',
    created_by: null
  },
  {
    id: 10,
    name: 'T - Project 006',
    alias: 'project-006',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 4,
    started_at: '2017-08-22',
    finished_at: null,
    created_by: null
  },
  {
    id: 11,
    name: 'H - Project 007',
    alias: 'project-007',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 5,
    started_at: '2017-09-03',
    finished_at: '2017-11-25',
    created_by: null
  },
  {
    id: 12,
    name: 'A - Project 008',
    alias: 'project-008',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 5,
    started_at: '2017-09-18',
    finished_at: '2017-09-22',
    created_by: null
  },
  {
    id: 13,
    name: 'N - Project 009',
    alias: 'project-009',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 5,
    started_at: '2017-10-01',
    finished_at: '2017-10-09',
    created_by: null
  },
  {
    id: 14,
    name: 'K - Project 010',
    alias: 'project-010',
    image_url: null,
    location: null,
    brief_description: null,
    full_description: null,
    is_internal: false,
    status_code: 4,
    started_at: '2017-11-17',
    finished_at: null,
    created_by: null
  }
]

exports.seed = function seed (knex) {
  return knex(tableName).del().then(() => {
    const time = moment().utc()

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes').format()

      return knex(tableName).insert({
        ...data,
        created_at: timestamp,
        updated_at: timestamp
      })
    }))
  })
}
