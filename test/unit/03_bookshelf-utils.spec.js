import chai from 'chai'
import * as BookshelfUtils from '../../src/actions/bookshelf/utils/bookshelf-utils'

const expect = chai.expect

const itemData = {}

// -----------------------
// LIBRARY bookshelf-utils
// -----------------------
describe('BOOKSHELF-UTILS', function () {
  // ---------------------
  // Testing: buildOrderBy
  // ---------------------
  describe('buildOrderBy', function () {
    it('should return an empty array if no value is provided', function () {
      const orderBy = BookshelfUtils.buildOrderBy()

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(0)
    })

    it('should return the Bookshelf-compatible spec for a single order value (positive/ascending)', function () {
      const fieldValue = 'title'
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue)

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(1)

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'asc',
        })
    })

    it('should return the Bookshelf-compatible spec for a single order value (negative/descending)', function () {
      const fieldValue = '-title'
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue)

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(1)

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        })
    })

    it('should return the Bookshelf-compatible spec for multiple values (comma-delimited)', function () {
      const fieldValue = '-title,updated_at,status_id'
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue)

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(3)

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        })
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'asc',
        })
      expect(orderBy[2])
        .to.contain({
          col: 'status_id',
          order: 'asc',
        })
    })

    it('should handle extraneous spaces between values', function () {
      const fieldValue = ' -title, updated_at  ,    status_id'
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue)

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(3)

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        })
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'asc',
        })
      expect(orderBy[2])
        .to.contain({
          col: 'status_id',
          order: 'asc',
        })
    })

    it('should handle empty values within commas', function () {
      const fieldValue = 'title,  ,   -updated_at  , ,'
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue)

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(2)

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'asc',
        })
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'desc',
        })
    })
  }) // END - buildOrderBy

  // --------------------------------
  // Testing: loadRelationsToItemBase
  // --------------------------------
  describe('loadRelationsToItemBase', function () {
    beforeEach(() => {
      itemData.attributes = {
        id: 1,
        user_id: 4,
        name: 'Project Apathy',
        status_code: 5,
      }
      itemData.relations = {
        profile: {
          id: 9999,
          attributes: {
            id: 1,
            user_id: 4,
            title: 'Functional Fanatic',
            slug: 'functional-fanatic',
            tagline: 'I don\'t have habits, I have algorithms.',
            description: null,
            is_default: true,
            is_live: false,
          },
        },
        user: {
          id: 4,
          attributes: {
            id: 4,
            username: 'the_manic_edge',
            external_id: '304',
            email: 'the-manic-edge@demo.com',
            display_name: 'The Manic Edge',
          },
        },
        team: {
          id: 27,
          attributes: {
            id: 27,
            name: 'The Coalition',
            slug: 'the-coalition',
            email: 'team@the-coalition.org',
            member_count: 5,
          },
        },
        techConceptTags: {
          length: 5,
          models: [
            { id: 1, attributes: { id: 1, label: 'Software Architecture', key: 'software-architecture', created_by: 1 } },
            { id: 2, attributes: { id: 2, label: 'Machine Learning', key: 'machine-learning', created_by: 1 } },
            { id: 3, attributes: { id: 3, label: 'Blockchain', key: 'blockchain', created_by: 1 } },
            { id: 4, attributes: { id: 4, label: 'Crypto Currency', key: 'crypto-currency', created_by: 8 } },
            { id: 5, attributes: { id: 5, label: 'Big Data', key: 'big-data', created_by: 9 } },
          ],
        },
        codingLanguageTags: {
          length: 3,
          models: [
            { id: 1, attributes: { id: 1, label: 'Java', key: 'java' } },
            { id: 2, attributes: { id: 2, label: '.NET', key: 'dot-net' } },
            { id: 3, attributes: { id: 3, label: 'JavaScript', key: 'javascript' } },
          ],
        },
        softwareTags: {
          length: 3,
          models: [
            { id: 1, attributes: { id: 1, label: 'Vue', key: 'vue', created_by: 1 } },
            { id: 2, attributes: { id: 2, label: 'React', key: 'react', created_by: 4 } },
            { id: 3, attributes: { id: 3, label: 'Express', key: 'express', created_by: 7 } },
          ],
        },
      }
    })

    it('should do nothing if the parsed "loadDirect" info does not contain an "associations" property', function () {
      const originalItemData = Object.assign({}, itemData)
      const loadDirect = {}

      BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect)

      expect(itemData).to.deep.equal(originalItemData)
    })

    it('should hoist the specified field data to the base attributes of the main resource', function () {
      const loadDirect = {
        associations: ['techConceptTags', 'codingLanguageTags', 'softwareTags', 'user', 'profile', 'team'],
        colMappings: {
          techConceptTags: 'key', // toMany relation, single col
          codingLanguageTags: ['label', 'key'], // toMany relation, multiple explicit cols
          softwareTags: '*', // toMany relation, wildcard (all) cols
          user: 'username', // toOne relation, single col
          profile: ['title', 'tagline', 'is_live'], // toOne relation, multiple explicit cols
          team: '*', // toOne relation, wildcard (all) cols
        },
      }

      BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect)

      expect(itemData.attributes)
        .to.have.property('tech_concept_tags')
        .that.has.members(['software-architecture', 'machine-learning', 'blockchain', 'crypto-currency', 'big-data'])

      expect(itemData.attributes)
        .to.have.property('coding_language_tags')
        .that.deep.equals([
          { label: 'Java', key: 'java' },
          { label: '.NET', key: 'dot-net' },
          { label: 'JavaScript', key: 'javascript' },
        ])

      expect(itemData.attributes)
        .to.have.property('software_tags')
        .that.deep.equals([
          { id: 1, label: 'Vue', key: 'vue', created_by: 1 },
          { id: 2, label: 'React', key: 'react', created_by: 4 },
          { id: 3, label: 'Express', key: 'express', created_by: 7 },
        ])

      expect(itemData.attributes)
        .to.contain({
          user: 'the_manic_edge',
        })

      expect(itemData.attributes)
        .to.have.property('profile')
        .to.contain({
          title: 'Functional Fanatic',
          tagline: 'I don\'t have habits, I have algorithms.',
          is_live: false,
        })

      expect(itemData.attributes)
        .to.have.property('team')
        .to.contain({
          id: 27,
          name: 'The Coalition',
          slug: 'the-coalition',
          email: 'team@the-coalition.org',
          member_count: 5,
        })
    })

    it('should delete the original relation data, if not explicitly included', function () {
      const keepAsRelations = ['softwareTags', 'profile']
      const loadDirect = {
        associations: ['techConceptTags', 'codingLanguageTags', 'softwareTags', 'user', 'profile', 'team'],
        colMappings: {
          techConceptTags: 'key', // toMany relation, single col
          codingLanguageTags: ['label', 'key'], // toMany relation, multiple explicit cols
          softwareTags: '*', // toMany relation, wildcard (all) cols
          user: 'username', // toOne relation, single col
          profile: ['title', 'tagline', 'is_live'], // toOne relation, multiple explicit cols
          team: '*', // toOne relation, wildcard (all) cols
        },
      }

      BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, keepAsRelations)

      // Hoisted attributes...
      expect(itemData.attributes).to.have.property('tech_concept_tags')
      expect(itemData.attributes).to.have.property('coding_language_tags')
      expect(itemData.attributes).to.have.property('software_tags')
      expect(itemData.attributes).to.have.property('user')
      expect(itemData.attributes).to.have.property('profile')
      expect(itemData.attributes).to.have.property('team')

      // Bookshelf relation data...
      expect(itemData.relations).to.have.keys(keepAsRelations)
    })
  }) // END - loadRelationsToItemBase
})
