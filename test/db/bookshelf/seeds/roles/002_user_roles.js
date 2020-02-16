import moment from 'moment'

const tableName = 'user_roles_ref'

const seeds = [
  // ---------------------------------
  // user: 4, username: the_manic_edge
  // ---------------------------------
  {
    id: 1,
    user_id: 4,
    role_id: 2, // admin
  },
  {
    id: 2,
    user_id: 4,
    role_id: 3, // moderator
  },
  {
    id: 3,
    user_id: 4,
    role_id: 4, // developer
  },
  {
    id: 4,
    user_id: 4,
    role_id: 5, // blogger
  },

  // ----------------------------
  // user: 5, username: segmented
  // ----------------------------
  {
    id: 5,
    user_id: 5,
    role_id: 5, // blogger
  },

  // ------------------------------
  // user: 6, username: ricksanchez
  // ------------------------------
  {
    id: 6,
    user_id: 6,
    role_id: 1, // transcendent
  },
  {
    id: 7,
    user_id: 6,
    role_id: 4, // developer
  },
  {
    id: 8,
    user_id: 6,
    role_id: 5, // blogger
  },

  // -----------------------------
  // user: 7, username: mortysmith
  // -----------------------------
  {
    id: 9,
    user_id: 7,
    role_id: 4, // developer
  },
  {
    id: 10,
    user_id: 7,
    role_id: 5, // blogger
  },
]

exports.seed = function seed(knex) {
  const time = moment().utc()

  return Promise.all(seeds.map((data) => {
    const timestamp = time.add(5, 'minutes').format()

    return knex(tableName).insert({
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    })
  }))
}
