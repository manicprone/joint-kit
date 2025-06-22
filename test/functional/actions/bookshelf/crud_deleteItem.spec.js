import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'

let projectApp = null
let projectAppJsonApi = null

// -----------------------------------------------------------------------------
// BOOKSHELF ACTIONS (CRUD)
// -----------------------------------------------------------------------------
describe('CRUD ACTIONS [bookshelf]', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf })
    projectApp.generate({ modelConfig: projectAppModels, log: false })

    projectAppJsonApi = new Joint({ service: bookshelf, output: 'json-api' })
    projectAppJsonApi.generate({ modelConfig: projectAppModels, log: false })
  })

  beforeEach(async () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterAll(() => { vi.useRealTimers() })

  // ---------------------------------------------------------------------------
  // deleteItem
  // ---------------------------------------------------------------------------
  describe('deleteItem', () => {
    beforeEach(() => resetDB(['profiles', 'projects']))

    it('should return an error (404) when the requested resource is not found', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const input = {
        fields: {
          id: 999
        }
      }

      await expect(projectApp.deleteItem(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "The requested "Project" was not found.",
           "name": "JointStatusError",
           "status": 404,
         }
       `)
    })

    it('should delete the resource when the spec is satisfied', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }

      const input = {
        fields: {
          id: 1
        }
      }

      // Delete item
      const deleted = await projectApp.deleteItem(spec, input)
      expect(deleted.attributes).toMatchInlineSnapshot('{}')

      // Ensure item has been deleted
      await expect(projectApp.getItem(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "The requested "Project" was not found.",
           "name": "JointStatusError",
           "status": 404,
         }
       `)
    })

    // TODO - Re-create with the new syntax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option with "${ACTION.SPEC_FIELDS_OPT_OPERATORS_CONTAINS}" and delete all matches`, async () => {
    //   const spec = {
    //     modelName: 'Project',
    //     fields: [
    //       { name: 'name', type: 'String', required: true, operators: ['contains'] }
    //     ]
    //   }

    //   const getItems = () => projectApp.getItems(spec, { fields: { 'name.contains': 'er' } })

    //   // Check that items exist prior to deletion
    //   await getItems().then((data) => {
    //     expect(data).to.have.property('models').that.have.lengthOf(2)
    //   })

    //   // Delete items
    //   await projectApp.deleteItem(spec, { fields: { 'name.contains': 'er' } })

    //   // Ensure item has been deleted
    //   await getItems().then((data) => {
    //     expect(data).to.have.property('models').that.have.lengthOf(0)
    //   })
    // })

    // TODO - Re-create with the new syntax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option with "${ACTION.SPEC_FIELDS_OPT_OPERATORS_NOT_IN}" and delete all matches`, async () => {
    //   const spec = {
    //     modelName: 'Project',
    //     fields: [
    //       { name: 'name', type: 'String', required: true, operators: ['not_in'] }
    //     ]
    //   }

    //   const getItems = () => projectApp.getItems(spec, { fields: { 'name.not_in': ['Mega-Seed Mini-Sythesizer', 'E - Project 001'] } })

    //   // Check that items exist prior to deletion
    //   await getItems().then((data) => {
    //     expect(data).to.have.property('models').that.have.lengthOf(12)
    //   })

    //   // Delete items
    //   await projectApp.deleteItem(spec, { fields: { 'name.not_in': ['Mega-Seed Mini-Sythesizer', 'E - Project 001'] } })

    //   // Ensure item has been deleted
    //   await getItems().then((data) => {
    //     expect(data).to.have.property('models').that.have.lengthOf(0)
    //   })
    // })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOOKUP}" option, to handle authorization from the retrieved item`, async () => {
      const userContext = {
        is_logged_in: true,
        id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: [],
        profile_ids: [1, 2, 3]
      }
      const authContext = projectApp.prepareAuthContext(userContext)

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true }
        ],
        auth: {
          rules: { owner: 'me' },
          ownerCreds: ['user_id => id']
        }
      }

      const input = {
        fields: { id: 3 },
        authContext
      }

      await expect(projectApp.deleteItem(spec, input))
        .resolves.toMatchInlineSnapshot('{}')
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'Project'

      const spec = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }

      const globalLevel = projectAppJsonApi.deleteItem(spec, { fields: { id: 2 } })
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: null
            })

          // Base Attributes...
          expect(payload.data.attributes).toMatchInlineSnapshot('{}')
        })

      const methodLevel = projectApp.deleteItem(spec, { fields: { id: 3 } }, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: null
            })

          // Base Attributes...
          expect(payload.data.attributes).toMatchInlineSnapshot('{}')
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - deleteItem
})
