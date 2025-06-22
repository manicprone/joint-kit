import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { omit } from 'lodash/fp'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'
import { specFixtures, inputFixtures } from './01_crud.fixtures'

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

  // ---------------------------------------------------------------------------
  // createItem
  // ---------------------------------------------------------------------------
  describe('createItem', async () => {
    beforeEach(() => resetDB())

    it('should create a new resource item when the spec is satisfied', async () => {
      const specUser = specFixtures.user
      const specProfile = specFixtures.blogProfile

      const inputUser = { fields: { username: 'Blasta!' } }
      const createUser = await blogApp.createItem(specUser, inputUser)
      expect(createUser.attributes).toMatchSnapshot(objectWithTimestamps)

      const inputProfile = { fields: { user_id: 1, title: 'Days of Bore' } }
      const createProfile = await blogApp.createItem(specProfile, inputProfile)
      expect(createProfile.attributes).toMatchSnapshot(objectWithTimestamps)
    })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, async () => {
      const specNoDefaultValue = specFixtures.projectProfile
      const specWithDefaultValue = specFixtures.projectProfileDefaultAlias('alias-is-locked')

      const input = { fields: { name: 'Project for Test', alias: 'user-updated-alias' } }

      // If no "defaultValue" is provided, the field value does not get set...
      const noDefaultValue = await projectApp.createItem(specNoDefaultValue, input)
      expect(noDefaultValue.attributes).toMatchSnapshot(objectWithTimestamps)

      const withDefaultValue = await projectApp.createItem(specWithDefaultValue, input)
      expect(withDefaultValue.attributes).toMatchSnapshot(objectWithTimestamps)
    })

    it('should return in JSON API shape when payload format is set to "json-api"', async () => {
      const specProject = specFixtures.projectProject
      const inputProject = { fields: { name: 'The Storytold' } }

      const payloads = await Promise.all([
        projectAppJsonApi.createItem(specProject, inputProject),
        projectApp.createItem(specProject, inputProject, 'json-api')
      ])

      // Due to a bug with property matchers in array the snapshot tested must be done in a loop
      // https://github.com/jestjs/jest/issues/9079
      payloads.forEach((payload) => {
        expect(payload).toHaveProperty('data.type', specProject.modelName)
        expect(payload.data.attributes).toMatchSnapshot(objectWithTimestamps)
      })

      expect.assertions(4)
    })
  }) // END - createItem

  // ---------------------------------------------------------------------------
  // upsertItem
  // ---------------------------------------------------------------------------
  describe('upsertItem', () => {
    beforeEach(() => resetDB())

    it('should return an error (400) when the input does not provide a "lookup field"', async () => {
      const spec = specFixtures.appMgmt.appSettingsAppIdNotRequired
      const input = { fields: { data: {} } }

      await expect(appMgmt.upsertItem(spec, input))
        .rejects
        .toMatchInlineSnapshot(`
         {
           "message": "A "lookup field" was either not defined or not provided.",
           "name": "JointStatusError",
           "status": 400,
         }
       `)
    })

    it('should perform a create action when the resource does not exist', async () => {
      const spec = specFixtures.appMgmt.appSettings
      const input = inputFixtures.appMgmt.exact('app-12345')

      const data = await appMgmt.upsertItem(spec, input)
      expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
       {
         "app_id": "app-12345",
         "created_at": Any<Date>,
         "data": "{"a":true,"b":false,"c":"string-value"}",
         "id": 1,
         "key": null,
         "updated_at": Any<Date>,
       }
     `)

      const dataJSON = JSON.parse(data.attributes.data)
      expect(dataJSON).toMatchInlineSnapshot(`
       {
         "a": true,
         "b": false,
         "c": "string-value",
       }
     `)
    })

    // TODO - Not sure if we need this test ??? Need to understand what is being tested.

    // it(
    //  `should throw an error if "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" other ` +
    //  `than "${ACTION.INPUT_FIELD_MATCHING_STRATEGY_EXACT}" is used to ` +
    //  'create a new resource',
    //  async () => {
    //    const spec = specFixtures.appMgmt.appSettingsOperatorContains
    //    const input = {
    //      fields: { 'app_id.contains': '999', data: { a: true, b: false, c: 'string-value' } }
    //    }

    //    await expect(appMgmt.upsertItem(spec, input)).rejects.toMatchInlineSnapshot(`
    //      {
    //        "message": "Unable to create a new resource using a lookup operator other than "exact".",
    //        "name": "JointStatusError",
    //        "status": 400,
    //      }
    //    `)
    //  }
    // )

    it('should perform an update action when the resource already exists', async () => {
      const spec = specFixtures.appMgmt.appSettings
      const input = inputFixtures.appMgmt.exact('app-12345', { a: true, b: false, c: 'updated-string-value' })

      const data = await appMgmt.upsertItem(spec, input)
      expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "app_id": "app-12345",
          "created_at": Any<Date>,
          "data": "{"a":true,"b":false,"c":"updated-string-value"}",
          "id": 1,
          "key": null,
          "updated_at": Any<Date>,
        }
      `)

      const dataJSON = JSON.parse(data.attributes.data)
      expect(dataJSON).toMatchInlineSnapshot(`
        {
          "a": true,
          "b": false,
          "c": "updated-string-value",
        }
      `)
    })

    //  TODO - Re-create with the new syntax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option and update the first resource matching the input`, async () => {
    //   const spec = specFixtures.appMgmt.appSettingsOperatorContains
    //   const createInput = inputFixtures.appMgmt.exact('app-12345')
    //   const input = inputFixtures.appMgmt.contains('app-12345', { a: true, b: false, c: 'updated-string-value' })

    //   await appMgmt.createItem(specFixtures.appMgmt.appSettings, createInput)
    //   const data = await appMgmt.upsertItem(spec, input)
    //   expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
    //     {
    //       "app_id": "app-12345",
    //       "created_at": Any<Date>,
    //       "data": "{"a":true,"b":false,"c":"updated-string-value"}",
    //       "id": 1,
    //       "key": null,
    //       "updated_at": Any<Date>,
    //     }
    //   `)

    //   const dataJSON = JSON.parse(data.attributes.data)
    //   expect(dataJSON).toMatchInlineSnapshot(`
    //     {
    //       "a": true,
    //       "b": false,
    //       "c": "updated-string-value",
    //     }
    //   `)
    // })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, async () => {
      const defaultAlias = 'alias-is-locked'
      const alias = 'user-updated-alias'

      const specNoDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true }
        ]
      }
      const inputNoDefaultValue = {
        fields: { name: 'Project 1', alias }
      }

      const specWithDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: defaultAlias },
          { name: 'image_url', type: 'String' }
        ]
      }
      const inputWithDefaultValue = {
        fields: { name: 'Project 2', alias }
      }
      const updateWithDefaultValue = {
        fields: { name: 'Project 2', alias, image_url: '/img' }
      }

      // If no "defaultValue" is provided, the field value does not get set...
      const noDefaultValue = await projectApp.upsertItem(specNoDefaultValue, inputNoDefaultValue)
      expect(noDefaultValue.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "alias": null,
          "brief_description": null,
          "created_at": Any<Date>,
          "created_by": null,
          "finished_at": null,
          "full_description": null,
          "id": 1,
          "image_url": null,
          "is_internal": 0,
          "location": null,
          "name": "Project 1",
          "started_at": null,
          "status_code": null,
          "updated_at": Any<Date>,
        }
      `)

      // On Create...
      const withDefaultValue = await projectApp.upsertItem(specWithDefaultValue, inputWithDefaultValue)
      expect(withDefaultValue.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "alias": "alias-is-locked",
          "brief_description": null,
          "created_at": Any<Date>,
          "created_by": null,
          "finished_at": null,
          "full_description": null,
          "id": 2,
          "image_url": null,
          "is_internal": 0,
          "location": null,
          "name": "Project 2",
          "started_at": null,
          "status_code": null,
          "updated_at": Any<Date>,
        }
      `)

      // On Update...
      const updated = await projectApp.upsertItem(specWithDefaultValue, updateWithDefaultValue)
      expect(updated.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "alias": "alias-is-locked",
          "brief_description": null,
          "created_at": Any<Date>,
          "created_by": null,
          "finished_at": null,
          "full_description": null,
          "id": 2,
          "image_url": "/img",
          "is_internal": 0,
          "location": null,
          "name": "Project 2",
          "started_at": null,
          "status_code": null,
          "updated_at": Any<Date>,
        }
      `)
    })

    // it('should return in JSON API shape when payload format is set to "json-api"', async () => {
    //   const spec = specFixtures.appMgmt.appSettings
    //   const input = inputFixtures.appMgmt.exact('app-12345', { a: true, b: false, c: 'another-string-value' })

    //   const payloads = await Promise.all([
    //     appMgmtJsonApi.upsertItem(spec, input),
    //     appMgmt.upsertItem(spec, input, 'json-api')
    //   ])

    //   // Due to a bug with property matchers in array the snapshot tested must be done in a loop
    //   // https://github.com/jestjs/jest/issues/9079
    //   payloads.forEach((payload) => {
    //     expect(payload).toHaveProperty('data.type', spec.modelName)
    //     expect(payload.data.attributes).toMatchSnapshot(objectWithTimestamps)
    //   })

    //   expect.assertions(4)
    // })
  }) // END - upsertItem

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

  // ---------------------------------------------------------------------------
  // getItem
  // ---------------------------------------------------------------------------
  describe('getItem', () => {
    beforeEach(() => resetDB(['users', 'roles', 'profiles', 'app-content']))

    it('should return the row according to the provided spec and input', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'external_id', type: 'String', requiredOr: true },
          { name: 'username', type: 'String' },
          { name: 'email', type: 'String' }
        ]
      }
      const inputUser = {
        fields: {
          external_id: '301'
        }
      }

      const getUser = await blogApp.getItem(specUser, inputUser)
      expect(getUser)
        .to.have.property('attributes')
        .that.contains({
          id: 1,
          external_id: inputUser.fields.external_id
        })
    })

    // TODO - Re-create with the new syntax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option with "${ACTION.INPUT_FIELD_MATCHING_STRATEGY_CONTAINS}" and return the first row matching the input`, async () => {
    //   const specUser = {
    //     modelName: 'User',
    //     fields: [
    //       { name: 'id', type: 'Number', requiredOr: true },
    //       {
    //         name: 'username',
    //         type: 'String',
    //         requiredOr: true,
    //         operators: ['contains']
    //       }
    //     ]
    //   }

    //   await blogApp.getItem(specUser, { fields: { id: 1 } }).then((model) => {
    //     expect(model).to.have.nested.property('attributes.id', 1)
    //   })

    //   await blogApp
    //     .getItem(specUser, { fields: { 'username.contains': 'ed' } })
    //     .then((model) => {
    //       expect(model)
    //         .to.have.nested.property('attributes.username')
    //         .that.contains('ed')
    //     })
    // })

    // TODO - Re-create with the new syntax !!!

    // it(`should support the "${ACTION.SPEC_FIELDS_OPT_OPERATORS}" option with "${ACTION.INPUT_FIELD_MATCHING_STRATEGY_NOT_IN}" and return the first row matching the input`, async () => {
    //   const specUser = {
    //     modelName: 'User',
    //     fields: [
    //       { name: 'id', type: 'Number', requiredOr: true },
    //       {
    //         name: 'username',
    //         type: 'String',
    //         requiredOr: true,
    //         operators: ['not_in']
    //       }
    //     ]
    //   }

    //   await blogApp.getItem(specUser, { fields: { id: 1 } }).then((model) => {
    //     expect(model).to.have.nested.property('attributes.id', 1)
    //   })

    //   await blogApp
    //     .getItem(specUser, { fields: { 'username.not_in': ['super-admin', 'admin'] } })
    //     .then((model) => {
    //       expect(model)
    //         .to.have.nested.property('attributes.username')
    //         .that.does.not.contain('admin')
    //     })
    // })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const appID = 'app-001'
      const key = 'v2.0'

      const specNoDefaultValue = {
        modelName: 'AppContent',
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'key', type: 'String', locked: true }
        ]
      }
      const specWithDefaultValue = {
        modelName: 'AppContent',
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'key', type: 'String', locked: true, defaultValue: 'v1.0' }
        ]
      }

      const input = {
        fields: { app_id: appID, key }
      }

      // If no "defaultValue" is provided, the field will not be included in the request...
      const noDefaultValue = appMgmt.getItem(specNoDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            app_id: appID,
            key: 'default' // But, bookshelf returns the first created from the matches !!!
          })
        })

      const withDefaultValue = appMgmt.getItem(specWithDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            app_id: appID,
            key: 'v1.0'
          })
        })

      return Promise.all([noDefaultValue, withDefaultValue])
    })

    it(`should support an "${ACTION.SPEC_AUTH_OWNER_CREDS}" authorization from a field on the retrieved item data`, async () => {
      const userContext = {
        is_logged_in: true,
        user_id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: ['moderator', 'admin'],
        profile_ids: [1, 2, 3]
      }
      const authContext = blogApp.prepareAuthContext(userContext)

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ],
        auth: {
          rules: { owner: 'me' },
          ownerCreds: ['user_id']
        }
      }
      const input = {
        fields: { id: 1 },
        authContext
      }

      const data = await blogApp.getItem(spec, input)
      expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
       {
         "avatar_url": null,
         "created_at": Any<Date>,
         "description": null,
         "id": 1,
         "is_default": 1,
         "is_live": 1,
         "slug": "functional-fanatic",
         "tagline": "I don't have habits, I have algorithms.",
         "title": "Functional Fanatic",
         "updated_at": Any<Date>,
         "user_id": 4,
       }
     `)
    })

    it('should only return the field data that is permitted by the spec', () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'avatar_url', 'description', 'is_default', 'is_live', 'created_at', 'updated_at']

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true }
        ]
      }

      const specColsEmptyArray = Object.assign({}, specBase)
      specColsEmptyArray.fieldsToReturn = []

      const specColsSpecified = Object.assign({}, specBase)
      specColsSpecified.fieldsToReturn = ['id', 'title', 'tagline']

      const input = {
        fields: {
          id: 1
        }
      }

      const getAllColsFromBase = blogApp.getItem(specBase, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols)
        })

      const getAllColsFromEmptyArray = blogApp.getItem(specColsEmptyArray, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols)
        })

      const getSpecifiedCols = blogApp.getItem(specColsSpecified, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsSpecified.fieldsToReturn)
        })

      return Promise.all([getAllColsFromBase, getAllColsFromEmptyArray, getSpecifiedCols])
    })

    it(`should support the "input.${ACTION.INPUT_FIELD_SET}" syntax, permitting various sets of returned field data`, () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'avatar_url', 'description', 'is_default', 'is_live', 'created_at', 'updated_at']

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true }
        ]
      }

      const specColsWithDefault = Object.assign({}, specBase)
      specColsWithDefault.fieldsToReturn = {
        default: ['id', 'user_id', 'title', 'slug', 'tagline', 'description'],
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline']
      }

      const specColsWithoutDefault = Object.assign({}, specBase)
      specColsWithoutDefault.fieldsToReturn = {
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline']
      }

      const inputWithUndefinedSet = {
        fields: { id: 1 },
        fieldSet: 'unknown'
      }
      const inputWithDefaultSet = {
        fields: { id: 1 },
        fieldSet: 'default'
      }
      const inputWithListSet = {
        fields: { id: 1 },
        fieldSet: 'list'
      }

      const getAllColsWithBase = blogApp.getItem(specBase, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols)
        })

      const getDefaultSetImplicitly = blogApp.getItem(specColsWithDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default)
        })

      const getAllColsWithUnknownSetAndNoDefault = blogApp.getItem(specColsWithoutDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols)
        })

      const getDefaultSetExplicitly = blogApp.getItem(specColsWithDefault, inputWithDefaultSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default)
        })

      const getListSet = blogApp.getItem(specColsWithDefault, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.list)
        })

      return Promise.all([
        getAllColsWithBase,
        getDefaultSetImplicitly,
        getAllColsWithUnknownSetAndNoDefault,
        getDefaultSetExplicitly,
        getListSet
      ])
    })

    it(`should return association data when the "input.${ACTION.INPUT_ASSOCIATIONS}" property is used`, () => {
      const associationNameInfo = 'info'
      const associationNameProfiles = 'profiles'
      const associationNameRoles = 'roles'

      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const inputWithOneToOneAssoc = {
        fields: { id: 4 },
        associations: [associationNameInfo] // One-to-One
      }
      const inputWithOneToManyAssoc = {
        fields: { id: 4 },
        associations: [associationNameProfiles] // One-to-Many
      }
      const inputWithManyToManyAssoc = {
        fields: { id: 4 },
        associations: [associationNameRoles] // Many-to-Many
      }
      const inputWithoutAssoc = {
        fields: { id: 1 }
      }

      const withOneToOneAssoc = blogApp.getItem(spec, inputWithOneToOneAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameInfo)
        })

      const withOneToManyAssoc = blogApp.getItem(spec, inputWithOneToManyAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameProfiles)

          expect(data.relations[associationNameProfiles]).to.have.length(3)
        })

      const withManyToManyAssoc = blogApp.getItem(spec, inputWithManyToManyAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameRoles)

          expect(data.relations[associationNameRoles]).to.have.length(4)
        })

      const withoutAssoc = blogApp.getItem(spec, inputWithoutAssoc)
        .then((data) => {
          expect(data.relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([withOneToOneAssoc, withOneToManyAssoc, withManyToManyAssoc, withoutAssoc])
    })

    it('should return association data with toMany using primary key', async () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const inputWithOneToOneAssoc = {
        fields: { id: 8 },
        associations: ['children']
      }

      const jerry = await blogApp.getItem(spec, inputWithOneToOneAssoc)

      expect(jerry)
        .to.have.property('relations')
        .that.has.property('children')
        .that.has.lengthOf(2)

      expect(jerry.relations.children.models[0].attributes.display_name).to.equal('Morty')
      expect(jerry.relations.children.models[1].attributes.display_name).to.equal('Summer')
    })

    it('should return association data with toMany using non-primary key', async () => {
      const spec = {
        modelName: 'UserInfo',
        fields: [
          { name: 'user_id', type: 'string', required: true }
        ]
      }
      const inputWithOneToOneAssoc = {
        fields: { user_id: 6 },
        associations: ['children']
      }

      const jerryUserInfo = await blogApp.getItem(spec, inputWithOneToOneAssoc)

      expect(jerryUserInfo)
        .to.have.property('relations')
        .that.has.property('children')
        .that.has.lengthOf(1)

      expect(jerryUserInfo.relations.children.models[0].attributes.display_name).to.equal('Beth')
    })

    it(`should support the "spec.${ACTION.SPEC_FORCE_ASSOCIATIONS}" option`, () => {
      const associationNameInfo = 'info'
      const associationNameRoles = 'roles'
      const associationNameProfiles = 'profiles'

      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ],
        forceAssociations: [associationNameInfo, associationNameProfiles]
      }
      const inputNoAssoc = {
        fields: { id: 4 }
      }
      const inputWithAssoc = {
        fields: { id: 4 },
        associations: [associationNameProfiles, associationNameRoles]
      }

      const withoutInputAssoc = blogApp.getItem(spec, inputNoAssoc)
        .then((data) => {
          expect(data.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles
          ])
        })

      const withInputAssoc = blogApp.getItem(spec, inputWithAssoc)
        .then((data) => {
          expect(data.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles,
            associationNameRoles
          ])
        })

      return Promise.all([withoutInputAssoc, withInputAssoc])
    })

    it(`should load association data directly to the base attributes when the "input.${ACTION.INPUT_LOAD_DIRECT}" property is used`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const input = {
        fields: { id: 4 },
        loadDirect: ['info:*', 'roles:{name,display_name}', 'profiles:slug']
      }

      const withLoadDirect = blogApp.getItem(spec, input)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness'
            })
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at'])

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' }
            ])

          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized'])

          expect(data.relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([withLoadDirect])
    })

    it(`should support the "spec.${ACTION.SPEC_FORCE_LOAD_DIRECT}" option, granting precendence over the input`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ],
        forceLoadDirect: ['info:*', 'roles:{name,display_name}']
      }
      const inputNoLoadDirect = {
        fields: { id: 4 }
      }
      const inputWithLoadDirect = {
        fields: { id: 4 },
        loadDirect: ['info:user_id', 'profiles:slug']
      }

      const noInputLoadDirect = blogApp.getItem(spec, inputNoLoadDirect)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness'
            })
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at'])

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' }
            ])

          expect(data.relations).toMatchInlineSnapshot('{}')
        })

      const withInputLoadDirect = blogApp.getItem(spec, inputWithLoadDirect)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness'
            })
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at'])

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' }
            ])

          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized'])

          expect(data.relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([noInputLoadDirect, withInputLoadDirect])
    })

    it(`should support the combined usage of "input.${ACTION.INPUT_ASSOCIATIONS}" and "input.${ACTION.INPUT_LOAD_DIRECT}" properties`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const input = {
        fields: { id: 4 },
        associations: ['roles', 'profiles'],
        loadDirect: ['profiles:slug', 'info:professional_title']
      }

      const withBoth = blogApp.getItem(spec, input)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized'])

          expect(data.attributes)
            .to.contain({ info: 'EdgeCaser' })

          expect(data.relations).to.have.keys(['roles', 'profiles'])
          expect(data.relations).to.not.have.keys(['info'])
        })

      return Promise.all([withBoth])
    })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'User'
      const itemID = 6

      const specUser = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true }
        ]
      }
      const inputUser = {
        fields: { id: itemID },
        associations: ['profiles'],
        loadDirect: ['roles:name']
      }

      const globalLevel = blogAppJsonApi.getItem(specUser, inputUser)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: itemID
            })

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
          expect(payload.data.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger'])

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys('profiles')

          // Included...
          expect(payload).to.have.property('included')
          expect(payload.included[0]).to.contain({ type: 'Profile' })
        })

      const methodLevel = blogApp.getItem(specUser, inputUser, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: itemID
            })

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
          expect(payload.data.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger'])

          // Relationships...
          expect(payload.data).to.have.property('relationships')
          expect(payload.data.relationships).to.have.keys('profiles')

          // Included...
          expect(payload).to.have.property('included')
          expect(payload.included[0]).to.contain({ type: 'Profile' })
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - getItem

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
