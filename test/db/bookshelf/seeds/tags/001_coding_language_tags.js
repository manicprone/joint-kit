
const tableName = 'tags_coding_languages';

const seeds = [
  {
    id: 1,
    label: 'Java',
    key: 'java',
  },
  {
    id: 2,
    label: 'JSP',
    key: 'jsp',
  },
  {
    id: 3,
    label: 'JavaScript',
    key: 'javascript',
  },
  {
    id: 4,
    label: 'CoffeeScript',
    key: 'coffee-script',
  },
  {
    id: 5,
    label: 'TypeScript',
    key: 'type-script',
  },
  {
    id: 6,
    label: 'Python',
    key: 'python',
  },
  {
    id: 7,
    label: 'Ruby',
    key: 'ruby',
  },
  {
    id: 8,
    label: 'PHP',
    key: 'php',
  },
  {
    id: 9,
    label: 'XSLT',
    key: 'xslt',
  },
  {
    id: 10,
    label: 'HTML',
    key: 'html',
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
