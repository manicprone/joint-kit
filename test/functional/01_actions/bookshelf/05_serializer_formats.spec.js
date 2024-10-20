import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
// import { omit } from 'lodash/fp'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'

let projectApp = null
let projectAppJsonApi = null
let projectAppFlat = null

// -----------------------------------------------------------------------------
// SERIALIZER FORMATS [bookshelf]
// -----------------------------------------------------------------------------
describe('SERIALIZER FORMATS [bookshelf]', () => {
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

    projectAppFlat = new Joint({ service: bookshelf, output: 'flat' })
    projectAppFlat.generate({ modelConfig: projectAppModels, log: false })
  })

  beforeEach(async () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    await resetDB(['users', 'roles', 'profiles', 'projects'])
  })

  afterAll(() => { vi.useRealTimers() })

  describe('payload format: "json-api"', () => {
    it('should return an item in JSON API shape (no associations)', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String', required: true }
        ]
      }
      const inputUser = {
        fields: {
          username: 'ricksanchez'
        }
      }

      const payload = await projectAppJsonApi.getItem(specUser, inputUser)

      // Should contain only "data"
      expect(payload).toHaveProperty('data')
      expect(payload).not.toHaveProperty('included')

      // Top level "data" keys
      const dataTopLevelKeys = ['attributes', 'id', 'type']
      expect(Object.keys(payload.data).sort()).toEqual(dataTopLevelKeys)

      // Full "data" response
      expect(payload).toMatchInlineSnapshot({
        data: {
          attributes: {
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
            last_login_at: expect.any(String)
          }
        }
      }, `
        {
          "data": {
            "attributes": {
              "avatar_url": null,
              "created_at": Any<ClockDate>,
              "display_name": "Rick",
              "email": "rick.sanchez@dimensionC-132.verse",
              "external_id": "306",
              "father_user_id": null,
              "first_name": null,
              "last_login_at": Any<String>,
              "last_name": null,
              "preferred_locale": null,
              "updated_at": Any<ClockDate>,
              "username": "ricksanchez",
            },
            "id": 6,
            "type": "User",
          },
        }
      `)
    })

    it('should return an item in JSON API shape with included associations', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String', required: true }
        ]
      }
      const inputUser = {
        fields: {
          username: 'segmented'
        },
        associations: ['info', 'profiles']
      }

      const payload = await projectAppJsonApi.getItem(specUser, inputUser)

      // Should contain "data" and "included"
      expect(payload).toHaveProperty('data')
      expect(payload).toHaveProperty('included')

      // Top level "data" keys
      const dataTopLevelKeys = ['attributes', 'id', 'relationships', 'type']
      expect(Object.keys(payload.data).sort()).toEqual(dataTopLevelKeys)

      // Main resource attributes (as "data.attributes")
      expect(payload.data.attributes).toMatchInlineSnapshot({
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login_at: expect.any(String)
      }, `
        {
          "avatar_url": null,
          "created_at": Any<ClockDate>,
          "display_name": "Segmented",
          "email": "segmented@demo.com",
          "external_id": "305",
          "father_user_id": null,
          "first_name": null,
          "last_login_at": Any<String>,
          "last_name": null,
          "preferred_locale": "en-US",
          "updated_at": Any<ClockDate>,
          "username": "segmented",
        }
      `)

      // Association mappings (as "data.relationships")
      expect(payload.data.relationships).toMatchInlineSnapshot(`
        {
          "info": {
            "data": {
              "id": 2,
              "type": "UserInfo",
            },
          },
          "profiles": {
            "data": [
              {
                "id": 4,
                "type": "Profile",
              },
              {
                "id": 5,
                "type": "Profile",
              },
            ],
          },
        }
      `)

      // Association data (as "included")
      expect(payload.included).toHaveLength(3)

      // Included "info" association (toOne)
      expect(payload.included[0]).toMatchInlineSnapshot({
        attributes: {
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      }, `
        {
          "attributes": {
            "created_at": Any<ClockDate>,
            "description": null,
            "professional_title": "Divergent Thinker",
            "tagline": "History favors the impetus of the author",
            "updated_at": Any<ClockDate>,
            "user_id": 5,
          },
          "id": 2,
          "type": "UserInfo",
        }
      `)

      // First included "profile" association (toMany)
      expect(payload.included[1]).toMatchInlineSnapshot({
        attributes: {
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      }, `
        {
          "attributes": {
            "avatar_url": null,
            "created_at": Any<ClockDate>,
            "description": null,
            "is_default": 0,
            "is_live": 1,
            "slug": null,
            "tagline": "Is someone talking?",
            "title": "Blipped Out",
            "updated_at": Any<ClockDate>,
            "user_id": 5,
          },
          "id": 4,
          "type": "Profile",
        }
      `)

      // Second included "profile" association (toMany)
      expect(payload.included[2]).toMatchInlineSnapshot({
        attributes: {
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      }, `
        {
          "attributes": {
            "avatar_url": null,
            "created_at": Any<ClockDate>,
            "description": null,
            "is_default": 1,
            "is_live": 1,
            "slug": "the-bearable-lightness-of-disconnection",
            "tagline": "A fluffy life in the clouds.",
            "title": "The Bearable Lightness of Disconnection",
            "updated_at": Any<ClockDate>,
            "user_id": 5,
          },
          "id": 5,
          "type": "Profile",
        }
      `)
    })

    it('should return a collection in JSON API shape (no associations)', async () => {
      const specUser = {
        modelName: 'User',
        defaultOrderBy: 'username'
      }
      const inputUser = {}

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // Top level keys: "data" and "meta"
      const topLevelKeys = ['data', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data item array
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(11)

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 11
        }
      )
    })

    it('should return a collection in JSON API shape with included associations', async () => {
      const specUser = {
        modelName: 'User',
        defaultOrderBy: 'username'
      }
      const inputUser = {
        associations: ['info']
      }

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // console.log('[DEVING] payload =>', payload)

      // Top level keys: "data" and "meta"
      const topLevelKeys = ['data', 'included', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data items
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(11)

      // Included associations
      expect(payload.included).to.be.an('array')
      // expect(payload.included).toHaveLength(5) // TODO - This is returning 6, with a null UserInfo entry ???

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 11
        }
      )
    })
  })

  describe('payload format: "flat"', () => {
    it('should return an item in flattened shape (no associations)', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String', required: true }
        ]
      }
      const inputUser = {
        fields: {
          username: 'ricksanchez'
        }
      }

      const payload = await projectAppFlat.getItem(specUser, inputUser)

      // Full "data" response
      expect(payload).toMatchInlineSnapshot({
        data: {
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          last_login_at: expect.any(String)
        }
      }, `
        {
          "data": {
            "avatar_url": null,
            "created_at": Any<ClockDate>,
            "display_name": "Rick",
            "email": "rick.sanchez@dimensionC-132.verse",
            "external_id": "306",
            "father_user_id": null,
            "first_name": null,
            "id": 6,
            "last_login_at": Any<String>,
            "last_name": null,
            "preferred_locale": null,
            "type": "User",
            "updated_at": Any<ClockDate>,
            "username": "ricksanchez",
          },
        }
      `)
    })

    it('should return an item in flattened shape with included associations', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String', required: true }
        ]
      }
      const inputUser = {
        fields: {
          username: 'segmented'
        },
        associations: ['info', 'profiles']
      }

      const payload = await projectAppFlat.getItem(specUser, inputUser)

      // Full "data" response
      expect(payload).toMatchInlineSnapshot({
        data: {
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          last_login_at: expect.any(String),
          info: {
            created_at: expect.any(Date),
            updated_at: expect.any(Date)
          },
          profiles: [
            {
              created_at: expect.any(Date),
              updated_at: expect.any(Date)
            },
            {
              created_at: expect.any(Date),
              updated_at: expect.any(Date)
            }
          ]
        }
      }, `
        {
          "data": {
            "avatar_url": null,
            "created_at": Any<ClockDate>,
            "display_name": "Segmented",
            "email": "segmented@demo.com",
            "external_id": "305",
            "father_user_id": null,
            "first_name": null,
            "id": 5,
            "info": {
              "created_at": Any<ClockDate>,
              "description": null,
              "id": 2,
              "professional_title": "Divergent Thinker",
              "tagline": "History favors the impetus of the author",
              "type": "UserInfo",
              "updated_at": Any<ClockDate>,
              "user_id": 5,
            },
            "last_login_at": Any<String>,
            "last_name": null,
            "preferred_locale": "en-US",
            "profiles": [
              {
                "avatar_url": null,
                "created_at": Any<ClockDate>,
                "description": null,
                "id": 4,
                "is_default": 0,
                "is_live": 1,
                "slug": null,
                "tagline": "Is someone talking?",
                "title": "Blipped Out",
                "type": "Profile",
                "updated_at": Any<ClockDate>,
                "user_id": 5,
              },
              {
                "avatar_url": null,
                "created_at": Any<ClockDate>,
                "description": null,
                "id": 5,
                "is_default": 1,
                "is_live": 1,
                "slug": "the-bearable-lightness-of-disconnection",
                "tagline": "A fluffy life in the clouds.",
                "title": "The Bearable Lightness of Disconnection",
                "type": "Profile",
                "updated_at": Any<ClockDate>,
                "user_id": 5,
              },
            ],
            "type": "User",
            "updated_at": Any<ClockDate>,
            "username": "segmented",
          },
        }
      `)
    })
  })
})
