import moment from 'moment'

const tableName = 'user_info'

const seeds = [
  // ---------------------------------
  // user: 4, username: the_manic_edge
  // ---------------------------------
  {
    id: 1,
    user_id: 4,
    professional_title: 'EdgeCaser',
    tagline: 'Catapult like impulse, infect like madness',
    description: null,
  },

  // ----------------------------
  // user: 5, username: segmented
  // ----------------------------
  {
    id: 2,
    user_id: 5,
    professional_title: 'Divergent Thinker',
    tagline: 'History favors the impetus of the author',
    description: null,
  },

  // ------------------------------
  // user: 6, username: ricksanchez
  // ------------------------------
  {
    id: 3,
    user_id: 6,
    professional_title: 'Rickforcer',
    tagline: 'The Rickiest',
    description: null,
  },

  // -----------------------------
  // user: 7, username: mortysmith
  // -----------------------------
  {
    id: 4,
    user_id: 7,
    professional_title: 'Afterthought',
    tagline: 'Umm.',
    description: null,
  },

  // -----------------------------
  // user: 9, username: bethsmith
  // -----------------------------
  {
    id: 5,
    user_id: 9,
    professional_title: 'Space Beth',
    tagline: 'Defying dimensions, one adventure at a time.',
    description: null,
  },
]

exports.seed = function seed(knex) {
  return knex(tableName).del().then(() => {
    const time = moment().utc()

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes').format()

      return knex(tableName).insert({
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      })
    }))
  })
}
