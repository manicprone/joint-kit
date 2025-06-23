import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'
import { specFixtures } from './crud.fixtures'

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
})
