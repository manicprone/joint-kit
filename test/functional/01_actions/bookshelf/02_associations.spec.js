import { beforeAll, beforeEach, describe, expect, it, test } from 'vitest'
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
        [
          ['missing main', '"input.main"', inputFixtures.noMain],
          // the All methods allows missing input.association
          !associationFn.includes('All')
            ? ['missing association', '"input.association"', inputFixtures.noAsso]
            : null,
        ].filter(i => !!i),
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

      // FIXME: seems to have issue with transaction
      test.skip.each([
        ['main modelName does not exist', 'The model "AlienProject" is not recognized.', specFixtures.mainModelNotExist],
        // the All methods doesn't care about association names
        !associationFn.includes('All')
          ? ['association name does not exist', 'The association "alienTags" does not exist for the resource.', specFixtures.assoNameNotExist]
          : null,
      ])("when the spec's %s it throws an error (400)", async (_, errMsg, theSpec) => {
        try {
          await projectApp[associationFn](theSpec, inputFixtures.normal)
        } catch (error) {
          expect(error.message).toBe(errMsg)
          expect(error.name).toBe('JointStatusError')
          expect(error.status).toBe(400)
        }

        expect.assertions(3)
      })
    })

    it('should return an error (404) when the requested main or association resources are not found', async () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: 'coding_language_tags',
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const getInputNoMain = () => ({
        main: {
          fields: {
            id: 999,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      })

      const getInputNoAssoc = () => ({
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 999,
          },
        },
      })

      // ------------------
      // addAssociatedItems
      // ------------------

      // main resource does not exist
      await expect(projectApp.addAssociatedItems(spec, getInputNoMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "Project" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // association resource does not exist
      await expect(projectApp.addAssociatedItems(spec, getInputNoAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "No instances of "CodingLanguageTag" exist for the requested resource.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // -----------------
      // hasAssociatedItem
      // -----------------

      // main resource does not exist
      await expect(projectApp.hasAssociatedItem(spec, getInputNoMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "Project" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // association resource does not exist
      await expect(projectApp.hasAssociatedItem(spec, getInputNoAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "CodingLanguageTag" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // ---------------------
      // getAllAssociatedItems
      // ---------------------

      // main resource does not exist
      await expect(projectApp.getAllAssociatedItems(spec, getInputNoMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "Project" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // ---------------------
      // removeAssociatedItems
      // ---------------------

      // main resource does not exist
      await expect(projectApp.removeAssociatedItems(spec, getInputNoMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "Project" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // association resource does not exist
      await expect(projectApp.removeAssociatedItems(spec, getInputNoAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "No instances of "CodingLanguageTag" exist for the requested resource.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)

      // ------------------------
      // removeAllAssociatedItems
      // ------------------------

      // main resource does not exist
      await expect(projectApp.removeAllAssociatedItems(spec, getInputNoMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "Project" was not found.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)
    })

    it('should return an error (400) when a required field is not provided', async () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: 'coding_language_tags',
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const getInputBadMain = () => ({
        main: {
          fields: {
            identifier: 1,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      })

      const getInputBadAssoc = () => ({
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            identifier: 1,
          },
        },
      })

      // ------------------
      // addAssociatedItems
      // ------------------

      // main missing requiredOr fields
      await expect(projectApp.addAssociatedItems(spec, getInputBadMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "alias")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // assoc missing requiredOr fields
      await expect(projectApp.addAssociatedItems(spec, getInputBadAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "key")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // -----------------
      // hasAssociatedItem
      // -----------------

      // main missing requiredOr fields
      await expect(projectApp.hasAssociatedItem(spec, getInputBadMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "alias")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // assoc missing requiredOr fields
      await expect(projectApp.hasAssociatedItem(spec, getInputBadAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "key")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // ---------------------
      // getAllAssociatedItems
      // ---------------------

      // main missing requiredOr fields
      await expect(projectApp.getAllAssociatedItems(spec, getInputBadMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "alias")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // ---------------------
      // removeAssociatedItems
      // ---------------------

      // main missing requiredOr fields
      await expect(projectApp.removeAssociatedItems(spec, getInputBadMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "alias")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // assoc missing requiredOr fields
      await expect(projectApp.removeAssociatedItems(spec, getInputBadAssoc()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "key")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)

      // ------------------------
      // removeAllAssociatedItems
      // ------------------------

      // main missing requiredOr fields
      await expect(projectApp.removeAllAssociatedItems(spec, getInputBadMain()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "Missing required fields: at least one of => ("id", "alias")",
            "name": "JointStatusError",
            "status": 400,
          }
        `)
    })

    it('should return an error (403) when the authorization spec is not satisfied', async () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
          auth: {
            rules: { owner: 'me' },
            ownerCreds: ['created_by'],
          },
        },
        association: {
          name: 'coding_language_tags',
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const getInput = () => ({
        main: {
          fields: {
            id: 1,
          },
          authContext: {},
        },
        association: {
          fields: {
            id: 1,
          },
        },
      })

      // addAssociatedItems
      await expect(projectApp.addAssociatedItems(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "You are not authorized to perform this action.",
            "name": "JointStatusError",
            "status": 403,
          }
        `)

      // hasAssociatedItem
      await expect(projectApp.hasAssociatedItem(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "You are not authorized to perform this action.",
            "name": "JointStatusError",
            "status": 403,
          }
        `)

      // getAllAssociatedItems
      await expect(projectApp.getAllAssociatedItems(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "You are not authorized to perform this action.",
            "name": "JointStatusError",
            "status": 403,
          }
        `)

      // removeAssociatedItems
      await expect(projectApp.removeAssociatedItems(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "You are not authorized to perform this action.",
            "name": "JointStatusError",
            "status": 403,
          }
        `)

      // removeAllAssociatedItems
      await expect(projectApp.removeAllAssociatedItems(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "You are not authorized to perform this action.",
            "name": "JointStatusError",
            "status": 403,
          }
        `)
    })
  })

  // ---------------------------------------------------------------------------
  // addAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('addAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should associate a resource when the spec is satisfied', async () => {
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

      // Project: mega-seed-mini-sythesizer
      // coding_language_tags: 1 (java), 2 (jsp), 3 (javascript)
      const inputSingle = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 10, // html
          },
        },
      }

      // Project: doppelganger-finder
      // coding_language_tags: 6 (python)
      const inputMultiple = {
        main: {
          fields: {
            id: 3,
          },
        },
        association: {
          fields: {
            id: [1, 2, 9, 10], // java, jsp, xslt, html
          },
        },
      }

      // ----------------------------------
      // Project: mega-seed-mini-sythesizer
      // ----------------------------------

      // Validate expected initial state
      const project01 = await projectApp.getAllAssociatedItems(spec, {
        main: {
          fields: { id: 1 },
        },
      })
      expect(project01.relatedData.parentId).to.equal(1)
      expect(project01.models).to.have.length(3)
      expect(project01.models[0].attributes.key).to.equal('java')
      expect(project01.models[1].attributes.key).to.equal('jsp')
      expect(project01.models[2].attributes.key).to.equal('javascript')

      // Associate single item
      const addSingleAssoc = await projectApp.addAssociatedItems(spec, inputSingle)
      expect(addSingleAssoc.attributes).to.contain({ id: 1 }) // ensure correct main

      // associations are ordered by created_at (when they were attached)
      const project01Tags = addSingleAssoc.relations[associationName]
      expect(project01Tags.models).to.have.length(4)
      expect(project01Tags.models.map(model => model.attributes.key))
        .to.include.members(['java', 'jsp', 'javascript', 'html'])

      // ----------------------------
      // Project: doppelganger-finder
      // ----------------------------

      // Validate expected initial state
      const project03 = await projectApp.getAllAssociatedItems(spec, {
        main: {
          fields: { id: 3 },
        },
      })
      expect(project03.relatedData.parentId).to.equal(3)
      expect(project03.models).to.have.length(1)
      expect(project03.models[0].attributes.key).to.equal('python')

      // Associate multiple items
      const addMultipleAssoc = await projectApp.addAssociatedItems(spec, inputMultiple)
      expect(addMultipleAssoc.attributes).to.contain({ id: 3 }) // ensure correct main

      // associations are ordered by created_at (when they were attached)
      const project03Tags = addMultipleAssoc.relations[associationName]
      expect(project03Tags.models).to.have.length(5)
      expect(project03Tags.models.map(model => model.attributes.key))
        .to.include.members(['python', 'java', 'jsp', 'xslt', 'html'])
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
      expect(added.attributes).to.contain({
        id: mainID,
      })

      const associatedTags = added.relations[associationName]
      // console.log('[TEST] associatedTags =>', associatedTags.models)
      expect(associatedTags.models).to.have.length(2)
      expect(associatedTags.models[0].attributes.key).to.equal('javascript')
      expect(associatedTags.models[1].attributes.key).to.equal('coffee-script')
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project'
      const mainID = 4
      const assocModelName = 'CodingLanguageTag'
      const associationName = 'coding_language_tags'

      const spec = {
        main: {
          modelName: mainModelName,
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
            id: 7, // ruby
          },
        },
      }

      const globalLevel = projectAppJsonApi.addAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Included...
          expect(payload).to.have.property('included').that.has.length(3)
          const thirdItem = payload.included[2]
          expect(thirdItem)
            .to.contain({
              id: 7,
              type: assocModelName,
            })
          expect(thirdItem).to.have.property('attributes')
          expect(thirdItem.attributes)
            .to.contain({
              key: 'ruby',
            })
        })

      const methodLevel = projectApp.addAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Included...
          expect(payload).to.have.property('included').that.has.length(3)
          const thirdItem = payload.included[2]
          expect(thirdItem)
            .to.contain({
              id: 7,
              type: assocModelName,
            })
          expect(thirdItem).to.have.property('attributes')
          expect(thirdItem.attributes)
            .to.contain({
              key: 'ruby',
            })
        })

      return Promise.all([
        globalLevel,
        methodLevel,
      ])
    })
  }) // END - addAssociatedItems

  // ---------------------------------------------------------------------------
  // hasAssociatedItem
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('hasAssociatedItem', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should return an error (404) when the requested association does not exist', async () => {
      const mainID = 3
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
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const getInput = () => ({
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 9, // xslt
          },
        },
      })

      await expect(projectApp.hasAssociatedItem(spec, getInput()))
        .rejects
        .toMatchInlineSnapshot(`
          {
            "message": "The requested "CodingLanguageTag" does exist for the requested resource.",
            "name": "JointStatusError",
            "status": 404,
          }
        `)
    })

    it('should return the associated resource, when the association exists', () => {
      const mainID = 2
      const assocID = 1 // java
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
          modelName: 'CodingLanguageTag',
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
            id: assocID,
          },
        },
      }

      return projectApp.hasAssociatedItem(spec, input)
        .then((data) => {
          expect(data.attributes.id).to.equal(assocID)
          expect(data.attributes.key).to.equal('java')
        })
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project'
      const mainID = 2
      const assocModelName = 'CodingLanguageTag'
      const assocID = 1 // java
      const associationName = 'coding_language_tags'

      const spec = {
        main: {
          modelName: mainModelName,
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: associationName,
          modelName: 'CodingLanguageTag',
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
            id: assocID,
          },
        },
      }

      const globalLevel = projectAppJsonApi.hasAssociatedItem(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: assocID,
              type: assocModelName,
            })

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
          expect(payload.data.attributes)
            .to.contain({
              key: 'java',
            })
        })

      const methodLevel = projectApp.hasAssociatedItem(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: assocID,
              type: assocModelName,
            })

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
          expect(payload.data.attributes)
            .to.contain({
              key: 'java',
            })
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - hasAssociatedItem

  // ---------------------------------------------------------------------------
  // Testing: getAllAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('getAllAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should return all instances of the associated resource, when the association exists', () => {
      const mainID = 1
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
        },
      }
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      }

      return projectApp.getAllAssociatedItems(spec, input)
        .then((data) => {
          expect(data.relatedData.parentId).to.equal(mainID)
          expect(data.models).to.have.length(3)
          expect(data.models[0].attributes.key).to.equal('java')
          expect(data.models[1].attributes.key).to.equal('jsp')
          expect(data.models[2].attributes.key).to.equal('javascript')
        })
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project'
      const mainID = 1
      const assocModelName = 'CodingLanguageTag'
      const associationName = 'coding_language_tags'

      const spec = {
        main: {
          modelName: mainModelName,
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: associationName,
        },
      }
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      }

      const globalLevel = projectAppJsonApi.getAllAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3)

          // First Item....
          const firstItem = payload.data[0]
          expect(firstItem)
            .to.contain({
              type: assocModelName,
              id: 1,
            })
          expect(firstItem).to.have.property('attributes')
          expect(firstItem.attributes)
            .to.contain({
              key: 'java',
            })
        })

      const methodLevel = projectApp.getAllAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3)

          // First Item....
          const firstItem = payload.data[0]
          expect(firstItem)
            .to.contain({
              type: assocModelName,
              id: 1,
            })
          expect(firstItem).to.have.property('attributes')
          expect(firstItem.attributes)
            .to.contain({
              key: 'java',
            })
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - getAllAssociatedItems

  // ---------------------------------------------------------------------------
  // Testing: removeAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should remove the association from the main resource, and return the affected main resource', () => {
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
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
      }

      const inputSingle = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 1, // java
          },
        },
      }

      const inputMultiple = {
        main: {
          fields: {
            id: 2,
          },
        },
        association: {
          fields: {
            key: ['java', 'jsp', 'xslt'], // 1, 2, 9
          },
        },
      }

      const removeSingleAssoc = projectApp.removeAssociatedItems(spec, inputSingle)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: 1,
          })

          const associatedTags = data.relations[associationName]
          expect(associatedTags.models).to.have.length(2)
          expect(associatedTags.models[0].attributes.key).to.equal('jsp')
          expect(associatedTags.models[1].attributes.key).to.equal('javascript')
        })

      const removeMultipleAssoc = projectApp.removeAssociatedItems(spec, inputMultiple)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: 2,
          })

          const associatedTags = data.relations[associationName]
          expect(associatedTags.models).to.have.length(1)
          expect(associatedTags.models[0].attributes.key).to.equal('html')
        })

      return Promise.all([removeSingleAssoc, removeMultipleAssoc])
    })

    it('should succeed and return the unaffected main resource, if the association did not exist', () => {
      const mainID = 4
      const assocID = 1 // java
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
          modelName: 'CodingLanguageTag',
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
            id: assocID,
          },
        },
      }

      return projectApp.removeAssociatedItems(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          })

          const associatedTags = data.relations[associationName]
          expect(associatedTags.models).to.have.length(2)
          expect(associatedTags.models[0].attributes.key).to.equal('javascript')
          expect(associatedTags.models[1].attributes.key).to.equal('coffee-script')
        })
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project'
      const mainID = 1
      const assocModelName = 'CodingLanguageTag'
      const assocID = 1 // java
      const associationName = 'coding_language_tags'

      const spec = {
        main: {
          modelName: mainModelName,
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'alias', type: 'String', requiredOr: true },
          ],
        },
        association: {
          name: associationName,
          modelName: 'CodingLanguageTag',
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
            id: assocID,
          },
        },
      }

      const globalLevel = projectAppJsonApi.removeAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys(associationName)

          // Included...
          expect(payload).to.have.property('included').that.has.length(2)
          expect(payload.included[0]).to.contain({ type: assocModelName })
        })

      const methodLevel = projectApp.removeAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys(associationName)

          // Included...
          expect(payload).to.have.property('included').that.has.length(2)
          expect(payload.included[0]).to.contain({ type: assocModelName })
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - removeAssociatedItems

  // ---------------------------------------------------------------------------
  // Testing: removeAllAssociatedItems
  // ---------------------------------------------------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAllAssociatedItems', () => {
    beforeAll(() => resetDB(['tags', 'projects']))

    it('should remove the associations from the main resource, and return the affected main resource', () => {
      const mainID = 2
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
        },
      }
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      }

      return projectApp.removeAllAssociatedItems(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          })

          const associatedTags = data.relations[associationName]
          expect(associatedTags.models).to.have.length(0)
        })
    })

    it('should succeed and return the unaffected main resource, if the associations did not exist', () => {
      const mainID = 5 // no tags
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
        },
      }
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      }

      return projectApp.removeAllAssociatedItems(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          })

          const associatedTags = data.relations[associationName]
          expect(associatedTags.models).to.have.length(0)
        })
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project'
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
        },
      }
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      }

      const globalLevel = projectAppJsonApi.removeAllAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys(associationName)
          expect(payload.data.relationships[associationName])
            .to.have.property('data').that.has.length(0)

          // Included...
          expect(payload).to.not.have.property('included')
        })

      const methodLevel = projectApp.removeAllAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            })

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys(associationName)
          expect(payload.data.relationships[associationName])
            .to.have.property('data').that.has.length(0)

          // Included...
          expect(payload).to.not.have.property('included')
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - removeAllAssociatedItems
})
