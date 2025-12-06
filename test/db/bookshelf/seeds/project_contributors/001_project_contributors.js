const moment = require('moment')

const tableName = 'project_contributors_ref'

const seeds = [
  // -------------------------
  // Mega-Seed Mini-Sythesizer
  // -------------------------
  {
    id: 1,
    project_id: 1,
    user_id: 6, // ricksanchez
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2016-07-30T11:20+08:00',
    finished_at: '2018-08-02T21:30+08:00'
  },

  // -------------------------
  // Turn Myself into a Pickle
  // -------------------------
  {
    id: 2,
    project_id: 2,
    user_id: 6, // ricksanchez
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2015-01-01',
    finished_at: '2015-12-08'
  },
  {
    id: 3,
    project_id: 2,
    user_id: 7, // mortysmith
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2015-09-01',
    finished_at: '2015-11-30'
  },

  // ----------------
  // Blue Dreamsicles
  // ----------------
  {
    id: 4,
    project_id: 4,
    user_id: 4, // the_manic_edge
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2018-01-03',
    finished_at: '2020-09-29'
  },

  // -------------------
  // Doppelgänger Finder
  // -------------------
  {
    id: 5,
    project_id: 3,
    user_id: 4, // the_manic_edge
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2020-03-01',
    finished_at: null
  },
  {
    id: 6,
    project_id: 3,
    user_id: 5, // segmented
    contributor_role: null,
    is_active_contributor: true,
    started_at: '2020-03-14',
    finished_at: null
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
