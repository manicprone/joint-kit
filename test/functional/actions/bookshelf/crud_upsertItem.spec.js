import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'
import { specFixtures, inputFixtures } from './crud.fixtures'

let appMgmt = null
let appMgmtJsonApi = null
let projectApp = null
let projectAppJsonApi = null

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
  })

  beforeEach(async () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterAll(() => { vi.useRealTimers() })

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
})
