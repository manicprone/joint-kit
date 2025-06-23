import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { omit } from 'lodash/fp'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'

// remove bookshelf internal fields
const omitInternalFields = omit(['attributes', '_previousAttributes', 'changed'])

let appMgmt = null
let appMgmtJsonApi = null
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

    // --------
    // App Mgmt
    // --------
    appMgmt = new Joint({ service: bookshelf })
    appMgmt.generate({ modelConfig: appMgmtModels, log: false })

    appMgmtJsonApi = new Joint({ service: bookshelf, output: 'json-api' })
    appMgmtJsonApi.generate({ modelConfig: appMgmtModels, log: false })

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
  // updateItem
  // ---------------------------------------------------------------------------
  describe('updateItem', () => {
    beforeEach(() => resetDB(['profiles', 'projects']))

    it('should return an error (400) when the input does not provide a "lookup" field', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' }
        ]
      }
      const input = {
        fields: {
          name: 'Updated Name'
        }
      }

      await expect(projectApp.updateItem(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "Missing required field: "id"",
           "name": "JointStatusError",
           "status": 400,
         }
       `)
    })

    it('should return an error (404) when the requested resource is not found', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' }
        ]
      }
      const input = {
        fields: {
          id: 999,
          name: 'Updated Name'
        }
      }

      await expect(projectApp.updateItem(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "The requested "Project" was not found.",
           "name": "JointStatusError",
           "status": 404,
         }
       `)
    })

    it('should update the resource when the spec is satisfied', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' }
        ]
      }

      const id = 2
      const name = 'Updated Name'
      const input = {
        fields: { id, name }
      }

      // Perform update
      const updated = await projectApp.updateItem(spec, input)

      expect(updated.attributes).to.contain({
        id,
        name
      })
    })

    // TODO - Re-create with the new synax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option and update the first resource matching the input`, async () => {
    //   const spec = {
    //     modelName: 'Project',
    //     fields: [
    //       { name: 'name', type: 'String', required: true, lookup: true, operators: ['contains'] },
    //       { name: 'alias', type: 'String' }
    //     ]
    //   }

    //   const input = {
    //     fields: {
    //       'name.contains': 'er',
    //       alias: 'updated-alias'
    //     }
    //   }

    //   // Perform update
    //   const updated = await projectApp.updateItem(spec, input)

    //   expect(updated).has.nested.property('attributes.name').that.contains('er')
    //   expect(updated).has.nested.property('attributes.alias').that.equals('updated-alias')
    // })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}" pattern for system control of input`, async () => {
      const id = 1
      const name = 'An Updated Name'

      const specNoDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String', locked: true },
          { name: 'brief_description', type: 'String' }
        ]
      }

      const input = {
        fields: { id, name, brief_description: 'new desc' }
      }

      const updated = await projectApp.updateItem(specNoDefaultValue, input)

      expect(updated.attributes).to.contain({
        id,
        name: 'Mega-Seed Mini-Sythesizer',
        brief_description: 'new desc'
      })
    })

    it(`should support dynamic values on the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" option (now, camelCase, kebabCase, snakeCase, pascalCase)`, async () => {
      const id = 4
      const valueToTransform = 'test This guy'

      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: '% camelCase(full_description) %' },
          { name: 'location', type: 'String', defaultValue: '% kebabCase(full_description) %' },
          { name: 'name', type: 'String', defaultValue: '% snakeCase(full_description) %' },
          { name: 'brief_description', type: 'String', defaultValue: '% pascalCase(full_description) %' },
          { name: 'started_at', type: 'String', defaultValue: '% now %' },
          { name: 'full_description', type: 'String' }
        ]
      }

      const input = {
        fields: { id, full_description: valueToTransform }
      }

      const data = await projectApp.updateItem(spec, input)
      expect(omitInternalFields(data.attributes)).toMatchInlineSnapshot(`
        {
          "alias": "testThisGuy",
          "brief_description": "TestThisGuy",
          "created_at": 2024-01-01T00:20:00.000Z,
          "created_by": null,
          "finished_at": null,
          "full_description": "test This guy",
          "id": 4,
          "image_url": "https://i.pinimg.com/736x/53/2e/e1/532ee1735e657073f4063a2cbed4e7f1--jello-popsicles-aqua-blue.jpg",
          "is_internal": 1,
          "location": "test-this-guy",
          "name": "test_this_guy",
          "started_at": "2024-01-01T00:00:00Z",
          "status_code": 3,
          "updated_at": 2024-01-01T00:00:00.000Z,
        }
      `)
    })

    it(`should support an "${ACTION.SPEC_AUTH_OWNER_CREDS}" authorization from a field on the looked-up item data`, async () => {
      const userContext = {
        is_logged_in: true,
        id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: [],
        profile_ids: [1, 2, 3]
      }
      const authContext = blogApp.prepareAuthContext(userContext)

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'title', type: 'String' },
          { name: 'tagline', type: 'String' }
        ],
        auth: {
          rules: { owner: 'me' },
          ownerCreds: ['user_id => id']
        }
      }

      const input = {
        fields: {
          id: 1,
          title: 'A New Title for a New Day'
        },
        authContext
      }

      const data = await blogApp.updateItem(spec, input)
      expect(data.attributes).toMatchInlineSnapshot(`
        {
          "avatar_url": null,
          "created_at": 2024-01-01T00:05:00.000Z,
          "description": null,
          "id": 1,
          "is_default": 1,
          "is_live": 1,
          "slug": "functional-fanatic",
          "tagline": "I don't have habits, I have algorithms.",
          "title": "A New Title for a New Day",
          "updated_at": 2024-01-01T00:00:00.000Z,
          "user_id": 4,
        }
      `)
    })

    describe('using advanced queries with object notation on the input value:', async () => {
      it(`should support the ${ACTION.INPUT_FIELD_QUERY_CONTAINS} operator (for case sensitive)`, async () => {
        const specProject = {
          modelName: 'Project',
          fields: [
            { name: 'name', type: 'String', required: true, lookup: true },
            { name: 'alias', type: 'String' }
          ]
        }

        const updateProjectByName = {
          fields: {
            name: {
              contains: 'A'
            },
            alias: 'updated-alias'
          }
        }

        const updatedProjectByName = await projectApp.updateItem(specProject, updateProjectByName, 'flat')
        expect(updatedProjectByName.data.alias).toEqual('updated-alias')
        expect(updatedProjectByName.data.name).toEqual('A - Project 008')
      })

      it(`should support the ${ACTION.INPUT_FIELD_QUERY_CONTAINS_INSENSITIVE} property (for case insensitive)`, async () => {
        const specProject = {
          modelName: 'Project',
          fields: [
            { name: 'name', type: 'String', required: true, lookup: true },
            { name: 'alias', type: 'String' }
          ]
        }

        const updateProjectByName = {
          fields: {
            name: {
              containsI: 'pickle'
            },
            alias: 'updated-alias'
          }
        }

        const updatedProjectByName = await projectApp.updateItem(specProject, updateProjectByName, 'flat')
        expect(updatedProjectByName.data.alias).toEqual('updated-alias')
        expect(updatedProjectByName.data.name).toEqual('Turn Myself into a Pickle')
      })
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const modelName = 'Project'
      const id = 2
      const name = 'The Third Name'

      const spec = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' }
        ]
      }

      const input = {
        fields: { id, name }
      }

      // Globally set...
      const globalLevel = await projectAppJsonApi.updateItem(spec, input)
      // (Top Level)
      expect(globalLevel).to.have.property('data')
      expect(globalLevel.data)
        .to.contain({
          id,
          type: modelName
        })
      // (Base Attributes)
      expect(globalLevel.data).to.have.property('attributes')
      expect(globalLevel.data.attributes)
        .to.contain({
          name
        })

      // Locally set...
      const methodLevel = await projectApp.updateItem(spec, input, 'json-api')
      // (Top Level)
      expect(methodLevel).to.have.property('data')
      expect(methodLevel.data)
        .to.contain({
          id,
          type: modelName
        })
      // (Base Attributes)
      expect(methodLevel.data).to.have.property('attributes')
      expect(methodLevel.data.attributes)
        .to.contain({
          name
        })
    })
  }) // END - updateItem
})
