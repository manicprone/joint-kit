
const tableName = 'project_coding_language_tags_ref';

const seeds = [
  // ------------------------
  // NSA, profile: 2, user: 4
  // ------------------------
  {
    id: 1,
    project_id: 2,
    coding_language_tag_id: 1, // java
  },
  {
    id: 2,
    project_id: 2,
    coding_language_tag_id: 2, // jsp
  },
  {
    id: 3,
    project_id: 2,
    coding_language_tag_id: 3, // javascript
  },

  // ------------------------
  // DOT, profile: 2, user: 4
  // ------------------------
  {
    id: 4,
    project_id: 3,
    coding_language_tag_id: 1, // java
  },
  {
    id: 5,
    project_id: 3,
    coding_language_tag_id: 2, // jsp
  },
  {
    id: 6,
    project_id: 3,
    coding_language_tag_id: 9, // xslt
  },
  {
    id: 7,
    project_id: 3,
    coding_language_tag_id: 10, // html
  },

  // -------------------------------------
  // Deep Dark Secret, profile: 2, user: 4
  // -------------------------------------
  {
    id: 8,
    project_id: 4,
    coding_language_tag_id: 3, // javascript
  },
  {
    id: 9,
    project_id: 4,
    coding_language_tag_id: 4, // coffee-script
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
