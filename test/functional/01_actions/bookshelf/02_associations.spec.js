import { beforeAll, describe, expect, it, test } from 'vitest'
import { sortBy } from 'lodash/fp'
import { filterNotNull, objectWithTimestamps } from '../../../utils'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { specFixtures, inputFixtures } from './02_associations.fixtures'

let projectApp = null
let projectAppJsonApi = null

// -----------------------------------------------------------------------------
// BOOKSHELF ACTIONS (associations)
// -----------------------------------------------------------------------------
describe('ASSOCIATION ACTIONS [bookshelf]', () => {
  beforeAll(() => {
    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf })
    projectApp.generate({ modelConfig: projectAppModels, log: false })

    projectAppJsonApi = new Joint({ service: bookshelf, output: 'json-api' })
    projectAppJsonApi.generate({ modelConfig: projectAppModels, log: false })
  })

  // ---------------------------------------------------------------------------
  // standard error scenarios
  // ---------------------------------------------------------------------------
  describe('standard error scenarios (addAssociatedItems, hasAssociatedItem, getAllAssociatedItems, removeAssociatedItems, removeAllAssociatedItems)', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    describe.each([
      'addAssociatedItems',
      'hasAssociatedItem',
      'getAllAssociatedItems',
      'removeAssociatedItems',
      'removeAllAssociatedItems',
    ])('%s()', (associationFn) => {
      const isAllFn = associationFn.includes('All')

      test.each([
        ['missing main', '"spec.main"', specFixtures.noMain],
        ['missing association', '"spec.association", "spec.association.name"', specFixtures.noAsso],
        ['missing association.name', '"spec.association.name"', specFixtures.noAssoName],
      ])('when the spec is %s it throws an error (400) that lists %s', async (_, props, theSpec) => {
        try {
          await projectApp[associationFn](theSpec, inputFixtures.normal)
        } catch (error) {
          expect(error.message).toBe(`The association action is invalid due to missing properties: ${props}`)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(400)
        }

        expect.assertions(3)
      })

      test.each(
        filterNotNull([
          ['missing main', '"input.main"', inputFixtures.noMain],
          // the All methods allows missing input.association
          !isAllFn ? ['missing association', '"input.association"', inputFixtures.noAsso] : null,
        ]),
      )('when the input is %s it throws an error (400) that lists %s', async (_, props, theInput) => {
        try {
          await projectApp[associationFn](specFixtures.normal, theInput)
        } catch (error) {
          expect(error.message).toBe(`The association action is invalid due to missing properties: ${props}`)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(400)
        }

        expect.assertions(3)
      })

      test.each(
        filterNotNull([
          ['main modelName does not exist', 'The model "AlienProject" is not recognized.', specFixtures.mainModelNotExist],
          // the All methods doesn't care about association names
          !isAllFn
            ? ['association name does not exist', 'The association "alienTags" does not exist for the resource.', specFixtures.assoNameNotExist]
            : null,
        ]),
      )("when the spec's %s it throws an error (400)", async (_, errMsg, theSpec) => {
        try {
          await projectApp[associationFn](theSpec, inputFixtures.normal)
        } catch (error) {
          expect(error.message).toBe(errMsg)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(400)
        }

        expect.assertions(3)
      })

      test.each(
        filterNotNull([
          ['main resource does not exist', 'The requested "Project" was not found.', inputFixtures.mainNotExist],
          // the All methods doesn't care about association names
          !isAllFn && associationFn !== 'hasAssociatedItem'
            ? ['association resource does not exist', 'No instances of "CodingLanguageTag" exist for the requested resource.', inputFixtures.assoNotExist]
            : null,
          associationFn === 'hasAssociatedItem'
            ? ['association resource does not exist', 'The requested "CodingLanguageTag" was not found.', inputFixtures.assoNotExist]
            : null,
        ]),
      )("when the input's %s it throws an error (404)", async (_, errMsg, theInput) => {
        try {
          await projectApp[associationFn](specFixtures.normal, theInput)
        } catch (error) {
          expect(error.message).toBe(errMsg)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(404)
        }

        expect.assertions(3)
      })

      test.each(
        filterNotNull([
          ['main missing requiredOr fields', 'Missing required fields: at least one of => ("id", "alias")', inputFixtures.mainBad],
          !isAllFn
            ? ['assoc missing requiredOr fields', 'Missing required fields: at least one of => ("id", "key")', inputFixtures.assoBad]
            : null,
        ]),
      )("when the input's %s it throws an error (400)", async (_, errMsg, theInput) => {
        try {
          await projectApp[associationFn](specFixtures.normal, theInput)
        } catch (error) {
          expect(error.message).toBe(errMsg)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(400)
        }

        expect.assertions(3)
      })

      it('should return an error (403) when the authorization spec is not satisfied', async () => {
        try {
          await projectApp[associationFn](specFixtures.authMe, inputFixtures.normal)
        } catch (error) {
          expect(error.message).toBe('You are not authorized to perform this action.')
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(403)
        }

        expect.assertions(3)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // addAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('addAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should associate a resource when the spec is satisfied', async () => {
      const spec = specFixtures.normal
      const associationName = spec.association.name

      // Project: mega-seed-mini-sythesizer
      // coding_language_tags: 1 (java), 2 (jsp), 3 (javascript)
      const input = {
        main: { fields: { id: 1 } },
        association: {
          fields: {
            id: 10, // html
          },
        },
      }

      // Validate expected initial state
      const data = await projectApp.getAllAssociatedItems(
        specFixtures.normal,
        { main: { fields: { id: 1 } } },
      )

      expect(data.relatedData).toMatchSnapshot({ parentAttributes: objectWithTimestamps })

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      expect(data.models).toHaveLength(3)
      data.models.forEach((model) => {
        expect(model.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      // Associate single item
      const addSingleAssoc = await projectApp.addAssociatedItems(spec, input)
      expect(addSingleAssoc.attributes).toMatchSnapshot(objectWithTimestamps)

      // associations are ordered by created_at (when they were attached)
      const tags = addSingleAssoc.relations[associationName]
      expect(tags.models).toHaveLength(4)
      tags.models.forEach((model) => {
        expect(model.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(11)
    })


    it('should accept multiple ids', async () => {
      const spec = specFixtures.normal
      const associationName = spec.association.name

      // Project: doppelganger-finder
      // coding_language_tags: 6 (python)
      const input = {
        main: { fields: { id: 3 } },
        association: {
          fields: {
            id: [1, 2, 9, 10], // java, jsp, xslt, html
          },
        },
      }

      // ----------------------------
      // Project: doppelganger-finder
      // ----------------------------

      // Validate expected initial state
      const data = await projectApp.getAllAssociatedItems(
        specFixtures.normal,
        { main: { fields: { id: 3 } } },
      )

      expect(data.relatedData).toMatchSnapshot({ parentAttributes: objectWithTimestamps })

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      expect(data.models).toHaveLength(1)
      data.models.forEach((model) => {
        expect(model.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      // Associate multiple item
      const addMultipleAssoc = await projectApp.addAssociatedItems(spec, input)
      expect(addMultipleAssoc.attributes).toMatchSnapshot(objectWithTimestamps)

      // associations are ordered by created_at (when they were attached)
      const tags = addMultipleAssoc.relations[associationName]
      expect(tags.models).toHaveLength(5)
      sortBy('id')(tags.models).forEach((model) => {
        expect(model.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(10)
    })

    // TODO: Need to re-implement this support for Bookshelf !!!
    it.skip('should ensure a duplicate association is not created, if the association already exists', async () => {
      const mainID = 4
      const associationName = 'coding_language_tags'

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: associationName,
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 3, // javascript
          },
        },
      }

      // const specForGet = {
      //   modelName: 'Project',
      //   fields: [
      //     { name: 'id', type: 'Number', required: true },
      //   ],
      // }
      // const inputForGet = {
      //   fields: { id: mainID },
      //   associations: [associationName],
      // }
      // const obtained = await projectApp.getItem(specForGet, inputForGet)
      // // console.log('[TEST] obtained =>', obtained)
      // const assocs = obtained.relations[associationName]
      // console.log('[TEST] assocs =>', assocs.models)

      const added = await projectApp.addAssociatedItems(spec, input)
      // console.log('[TEST] added =>', added)
      expect(added.attributes).toHaveProperty('id', mainID)

      const associatedTags = added.relations[associationName]
      // console.log('[TEST] associatedTags =>', associatedTags.models)
      expect(associatedTags.models).toHaveLength(2)
      expect(associatedTags.models[0].attributes.key).toBe('javascript')
      expect(associatedTags.models[1].attributes.key).toBe('coffee-script')
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = specFixtures.normal
      const mainID = 4

      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 7, // ruby
          },
        },
      }

      const payloads = await Promise.all([
        projectAppJsonApi.addAssociatedItems(spec, input),
        projectAppJsonApi.addAssociatedItems(spec, input, 'json-api'),
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload.data).toMatchSnapshot({ attributes: objectWithTimestamps })
        expect(payload.included).toHaveLength(3)
        payload.included.forEach((included) => {
          expect(included).toMatchSnapshot({ attributes: objectWithTimestamps })
        })
      })

      expect.assertions(10)
    })
  }) // END - addAssociatedItems

  // ---------------------------------------------------------------------------
  // hasAssociatedItem
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('hasAssociatedItem', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should return an error (404) when the requested association does not exist', async () => {
      const input = {
        main: { fields: { id: 3 } },
        association: {
          fields: {
            id: 9, // xslt
          },
        },
      }

      await expect(projectApp.hasAssociatedItem(specFixtures.normal, input))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "CodingLanguageTag" does exist for the requested resource.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)
    })

    it('should return the associated resource, when the association exists', async () => {
      const input = {
        main: { fields: { id: 2 } },
        association: {
          fields: {
            id: 1, // java
          },
        },
      }

      const data = await projectApp.hasAssociatedItem(specFixtures.normal, input)
      expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "created_at": Any<Date>,
          "created_by": null,
          "id": 1,
          "key": "java",
          "label": "Java",
          "updated_at": Any<Date>,
        }
      `)
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = specFixtures.normal
      const input = {
        main: { fields: { id: 2 } },
        association: {
          fields: {
            id: 1, // java
          },
        },
      }

      const payloads = await Promise.all([
        projectAppJsonApi.hasAssociatedItem(spec, input),
        projectApp.hasAssociatedItem(spec, input, 'json-api'),
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload.data).toMatchSnapshot({ attributes: objectWithTimestamps })
      })

      expect.assertions(2)
    })
  }) // END - hasAssociatedItem

  // ---------------------------------------------------------------------------
  // Testing: getAllAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('getAllAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should return all instances of the associated resource, when the association exists', async () => {
      const spec = specFixtures.assoNameOnly
      const input = inputFixtures.noAsso

      const data = await projectApp.getAllAssociatedItems(spec, input)
      expect(data.relatedData).toMatchSnapshot({ parentAttributes: objectWithTimestamps })

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      data.models.forEach((model) => {
        expect(model.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(4)
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = specFixtures.assoNameOnly
      const input = inputFixtures.noAsso

      const payloads = await Promise.all([
        projectAppJsonApi.getAllAssociatedItems(spec, input),
        projectApp.getAllAssociatedItems(spec, input, 'json-api'),
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload.data).toHaveLength(3)
        payload.data.forEach((item) => {
          expect(item).toMatchSnapshot({ attributes: objectWithTimestamps })
        })
      })

      expect.assertions(8)
    })
  }) // END - getAllAssociatedItems

  // ---------------------------------------------------------------------------
  // Testing: removeAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should remove the association from the main resource, and return the affected main resource', async () => {
      const spec = specFixtures.normal
      const associationName = spec.association.name
      const input = inputFixtures.normal

      const data = await projectApp.removeAssociatedItems(spec, input)
      expect(data.attributes).toMatchSnapshot(objectWithTimestamps)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      expect(data).toHaveProperty(['relations', associationName])
      data.relations[associationName].forEach((item) => {
        expect(item.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(4)
    })

    it('should accept multiple keys', async () => {
      const spec = specFixtures.normal
      const associationName = spec.association.name
      const input = {
        main: { fields: { id: 2 } },
        association: {
          fields: {
            key: ['java', 'jsp', 'xslt'], // 1, 2, 9
          },
        },
      }

      const data = await projectApp.removeAssociatedItems(spec, input)
      expect(data.attributes).toMatchSnapshot(objectWithTimestamps)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      expect(data).toHaveProperty(['relations', associationName])
      data.relations[associationName].forEach((item) => {
        expect(item.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(3)
    })

    it('should succeed and return the unaffected main resource, if the association did not exist', async () => {
      const spec = specFixtures.normal
      const input = {
        main: { fields: { id: 4 } },
        association: { fields: { id: 1 } }, // java
      }
      const associationName = spec.association.name

      const data = await projectApp.removeAssociatedItems(spec, input)

      expect(data.attributes).toMatchSnapshot(objectWithTimestamps)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      data.relations[associationName].models.forEach((item) => {
        expect(item.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(3)
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = specFixtures.normal
      const input = {
        main: { fields: { id: 1 } },
        association: { fields: { id: 1 } }, // java
      }

      const payloads = await Promise.all([
        projectAppJsonApi.removeAssociatedItems(spec, input),
        projectApp.removeAssociatedItems(spec, input, 'json-api'),
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload).toHaveProperty('data.id', input.main.fields.id)
        expect(payload).toHaveProperty('data.type', spec.main.modelName)
        expect(payload.data.relationships).toMatchSnapshot()

        expect(payload.included).toHaveLength(2)
        payload.included.forEach((included) => {
          expect(included.attributes).toMatchSnapshot(objectWithTimestamps)
        })
      })

      expect.assertions(12)
    })
  }) // END - removeAssociatedItems

  // ---------------------------------------------------------------------------
  // Testing: removeAllAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAllAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should remove the associations from the main resource, and return the affected main resource', async () => {
      const spec = specFixtures.normal
      const input = { main: { fields: { id: 2 } } }
      const associationName = spec.association.name

      const data = await projectApp.removeAllAssociatedItems(spec, input)

      expect(data.attributes).toMatchSnapshot(objectWithTimestamps)

      const associatedTags = data.relations[associationName]
      expect(associatedTags.models).toMatchInlineSnapshot('[]')
    })

    it('should succeed and return the unaffected main resource, if the associations did not exist', async () => {
      const spec = specFixtures.normal
      const input = { main: { fields: { id: 5 } } } // no tags
      const associationName = spec.association.name

      const data = await projectApp.removeAllAssociatedItems(spec, input)
      expect(data.attributes).toMatchSnapshot(objectWithTimestamps)

      const associatedTags = data.relations[associationName]
      expect(associatedTags.models).toMatchInlineSnapshot('[]')
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = specFixtures.normal
      const input = { main: { fields: { id: 4 } } }

      const payloads = await Promise.all([
        projectAppJsonApi.removeAllAssociatedItems(spec, input),
        projectApp.removeAllAssociatedItems(spec, input, 'json-api'),
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload).toHaveProperty('data.id', input.main.fields.id)
        expect(payload).toHaveProperty('data.type', spec.main.modelName)
        expect(payload.data.relationships).toMatchSnapshot()
        expect(payload).not.toHaveProperty('included')
      })

      expect.assertions(8)
    })
  }) // END - removeAllAssociatedItems
})
