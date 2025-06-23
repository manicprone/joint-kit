import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'

let projectApp = null
let projectAppJsonApi = null
let blogApp = null
let blogAppJsonApi = null

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

    // --------
    // Blog App
    // --------
    blogApp = new Joint({
      service: bookshelf,
      settings: {
        auth: {
          debugBuild: false,
          debugCheck: false
        }
      }
    })
    blogApp.generate({ modelConfig: blogAppModels, log: false })

    blogAppJsonApi = new Joint({ service: bookshelf, output: 'json-api' })
    blogAppJsonApi.generate({ modelConfig: blogAppModels, log: false })
  })

  beforeEach(async () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterAll(() => { vi.useRealTimers() })

  // ---------------------------------------------------------------------------
  // standard error scenarios
  // ---------------------------------------------------------------------------
  describe('standard error scenarios (createItem, upsertItem, updateItem, getItem, getItems, deleteItem)', () => {
    beforeEach(() => resetDB(['users', 'profiles', 'projects']))

    describe.each([
      'createItem',
      'upsertItem',
      'updateItem',
      'getItem',
      'deleteItem'
    ])('%s()', (fn) => {
      it('should return an error (400) when the specified model does not exist', async () => {
        const spec = {
          modelName: 'Alien',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true }
          ]
        }
        const input = {
          fields: {
            id: 1
          }
        }

        // createItem
        await expect(projectApp[fn](spec, input))
          .rejects
          .toThrowErrorMatchingSnapshot('"[JointStatusError (400): The model "Alien" is not recognized.]"')
      })

      it('should return an error (400) when a required field is not provided', async () => {
        const spec01 = {
          modelName: 'User',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'external_id', type: 'String', requiredOr: true }
          ]
        }
        const input01 = {
          fields: {
            identifier: 1
          }
        }

        const spec02 = {
          modelName: 'User',
          fields: [
            { name: 'external_id', type: 'String', required: true },
            { name: 'display_name', type: 'String', requiredOr: false },
            { name: 'email', type: 'String', required: false },
            { name: 'avatar_url', type: 'String', defaultValue: '//extradimensional.org/avatars/human/random' },
            { name: 'is_intelligent', type: 'Boolean', defaultValue: false }
          ]
        }
        const input02 = {
          fields: {
            display_name: 'Jimbo',
            email: 'jimbo@mail.com'
          }
        }

        await expect(projectApp[fn](spec01, input01))
          .rejects
          .toThrowErrorMatchingSnapshot()

        await expect(projectApp[fn](spec02, input02))
          .rejects
          .toThrowErrorMatchingSnapshot()
      })

      it('should return an error (403) when the authorization spec is not satisfied', async () => {
        const spec = {
          modelName: 'Profile',
          fields: [
            { name: 'user_id', type: 'Number' }
          ],
          auth: {
            rules: { owner: 'me' },
            ownerCreds: ['id => profile_ids', 'user_id']
          }
        }
        const input = {
          fields: {
            title: 'How to Blow Up Every Morning'
          },
          authContext: {}
        }

        await expect(blogApp.createItem(spec, input))
          .rejects
          .toThrowErrorMatchingSnapshot()
      })
    })
  }) // END - standard error scenarios

  describe('semantic error reporting', async () => {
    it.each([
      [
        'missing one "required" field',
        { status_code: 0, this_thing: 'reality' },
        'Missing required field: "user_id"'
      ],
      [
        'missing two "required" fields',
        { this_thing: 'reality', that_thing: 'fiction' },
        'Missing required fields: all of => ("user_id", "status_code")'
      ],
      [
        'missing any "requiredOr" fields',
        { user_id: 333, status_code: 0 },
        'Missing required fields: at least one of => ("this_thing", "that_thing")'
      ],
      [
        'missing one "required" field and any "requiredOr" fields',
        { status_code: 0 },
        'Missing required fields: "user_id" AND at least one of => ("this_thing", "that_thing")'
      ],
      [
        'missing two "required" fields and any "requiredOr" fields',
        {},
        'Missing required fields: all of => ("user_id", "status_code") AND at least one of => ("this_thing", "that_thing")'
      ]
    ])('scenario %s', async (_, input, expected) => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'user_id', type: 'Number', required: true },
          { name: 'status_code', type: 'Number', required: true },
          { name: 'this_thing', type: 'String', requiredOr: true },
          { name: 'that_thing', type: 'String', requiredOr: true }
        ]
      }

      const promise = projectApp.createItem(spec, { fields: { ...input } })
      await expect(promise).rejects.toThrow()

      try { await promise } catch (error) {
        expect(error.message).toBe(expected)
      }

      expect.assertions(2)
    })
  })
})
