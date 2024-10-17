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
    await resetDB(['profiles', 'projects'])
  })

  afterAll(() => { vi.useRealTimers() })

  describe('updateMany', () => {
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

      await expect(projectApp.updateMany(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "Missing required field: "id"",
           "name": "JointStatusError",
           "status": 400,
         }
       `)
    })

    it('should return an empty collection when the requested resource does not exist', async () => {
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

      const updated = await projectApp.updateMany(spec, input)
      expect(updated.models).toHaveLength(0)
    })

    it('should update the resource when the spec is satisfied', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean', required: true, lookup: true },
          { name: 'status_code', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' }
        ]
      }

      // Perform update
      const updated = await projectApp.updateMany(spec, {
        fields: { status_code: 5, is_internal: true, name: 'Updated Name' }
      })

      expect(updated.models).toHaveLength(2)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      updated.models.forEach((item) => {
        expect(item).toHaveProperty('attributes.name', 'Updated Name')
        expect(omitInternalFields(item.attributes)).toMatchSnapshot()
      })
    })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option and update all resources matching the input`, async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true, operators: ['contains'] },
          { name: 'status_code', type: 'Number' }
        ]
      }

      const input = {
        fields: {
          'name.contains': 'er',
          status_code: 3
        }
      }

      // Perform update
      const updated = await projectApp.updateMany(spec, input)

      expect(updated.models).toHaveLength(2)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      updated.models.forEach((item) => {
        expect(item).toHaveProperty('attributes.status_code', 3)
        expect(omitInternalFields(item.attributes)).toMatchSnapshot()
      })
    })

    it(`should support dynamic values on the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" option (now, camelCase, kebabCase, snakeCase, pascalCase)`, async () => {
      vi.setSystemTime(new Date('2024-01-02T00:00:00.000Z'))
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: '% camelCase(full_description) %' },
          { name: 'location', type: 'String', defaultValue: '% kebabCase(full_description) %' },
          { name: 'name', type: 'String', defaultValue: '% snakeCase(full_description) %' },
          { name: 'brief_description', type: 'String', defaultValue: '% pascalCase(full_description) %' },
          { name: 'started_at', type: 'String', defaultValue: '% now %' },
          { name: 'full_description', type: 'String' }
        ]
      }

      const updated = await projectApp.updateMany(spec, {
        fields: { is_internal: true, full_description: 'test This guy' }
      })
      expect(updated.models).toHaveLength(4)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      updated.models.forEach((item) => {
        expect(omitInternalFields(item.attributes)).toMatchSnapshot()
      })
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

      const data = await blogApp.updateMany(spec, input)
      expect(data.models).toHaveLength(1)
      expect(omitInternalFields(data.models[0].attributes)).toMatchInlineSnapshot(`
        {
          "avatar_url": null,
          "cid": "c14",
          "created_at": 2024-01-01T00:05:00.000Z,
          "description": null,
          "id": 1,
          "is_default": 1,
          "is_live": 1,
          "relations": {},
          "slug": "functional-fanatic",
          "tagline": "I don't have habits, I have algorithms.",
          "title": "A New Title for a New Day",
          "updated_at": 2024-01-01T00:05:00.000Z,
          "user_id": 4,
        }
      `)
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true, operators: ['contains'] },
          { name: 'status_code', type: 'Number' }
        ]
      }

      const input = {
        fields: {
          'name.contains': 'er',
          status_code: 3
        }
      }

      // Globally set...
      const globalLevel = await projectAppJsonApi.updateMany(spec, input)
      expect(globalLevel).toHaveProperty('data')
      expect(globalLevel.data).toHaveLength(2)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      globalLevel.data.forEach((item) => {
        expect(omitInternalFields(item.attributes)).toMatchSnapshot()
      })

      // Locally set...
      const methodLevel = await projectApp.updateMany(spec, input, 'json-api')
      expect(methodLevel).toHaveProperty('data')
      expect(methodLevel.data).toHaveLength(2)

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      methodLevel.data.forEach((item) => {
        expect(omitInternalFields(item.attributes)).toMatchSnapshot()
      })
    })
  })
})
