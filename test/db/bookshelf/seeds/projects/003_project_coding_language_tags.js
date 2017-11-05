import moment from 'moment';

const tableName = 'project_coding_language_tags_ref';

const seeds = [
  // -------------------------
  // Mega-Seed Mini-Sythesizer
  // -------------------------
  {
    id: 1,
    project_id: 1,
    tag_id: 1, // java
  },
  {
    id: 2,
    project_id: 1,
    tag_id: 2, // jsp
  },
  {
    id: 3,
    project_id: 1,
    tag_id: 3, // javascript
  },

  // -------------------------
  // Turn Myself into a Pickle
  // -------------------------
  {
    id: 4,
    project_id: 2,
    tag_id: 1, // java
  },
  {
    id: 5,
    project_id: 2,
    tag_id: 2, // jsp
  },
  {
    id: 6,
    project_id: 2,
    tag_id: 9, // xslt
  },
  {
    id: 7,
    project_id: 2,
    tag_id: 10, // html
  },

  // ----------------
  // Blue Dreamsicles
  // ----------------
  {
    id: 8,
    project_id: 4,
    tag_id: 3, // javascript
  },
  {
    id: 9,
    project_id: 4,
    tag_id: 4, // coffee-script
  },

  // -------------------
  // Doppelgänger Finder
  // -------------------
  {
    id: 10,
    project_id: 3,
    tag_id: 6, // python
  },
];

exports.seed = function seed(knex, Promise) {
  return knex(tableName).del().then(() => {
    const time = moment().utc();

    return Promise.all(seeds.map((data) => {
      const timestamp = time.add(5, 'minutes').format();

      return knex(tableName).insert({
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }));
  });
};
