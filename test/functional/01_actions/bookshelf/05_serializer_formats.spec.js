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
        associations: ['info', 'profiles']
      }

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // Top level keys: "data", "included", and "meta"
      const topLevelKeys = ['data', 'included', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data items
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(11)

      // Data relationship references
      expect(payload.data[1].attributes.username).toEqual('bethsmith')
      expect(payload.data[1].relationships).toEqual(
        {
          info: {
            data: {
              type: 'UserInfo',
              id: 5
            }
          },
          profiles: {
            data: []
          }
        }
      )

      // Included associations (5 info records, 11 profile records)
      expect(payload.included).to.be.an('array')
      expect(payload.included).toHaveLength(16)

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 11
        }
      )
    })

    it('should return an empty "toOne" assocation when a record does not exist', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String' }
        ],
        defaultOrderBy: 'username'
      }
      const inputUser = {
        fields: {
          username: 'admin' // does not have an "info" record
        },
        associations: ['info']
      }

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // Top level keys: "data" and "meta"
      const topLevelKeys = ['data', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data items
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(1)

      // Empty relationship reference
      expect(payload.data[0].relationships).toEqual(
        { info: {} }
      )

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 1
        }
      )
    })

    it('should return an empty "toMany" assocation when records do not exist', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String' }
        ],
        defaultOrderBy: 'username'
      }
      const inputUser = {
        fields: {
          username: 'admin' // does not have any "profile" records
        },
        associations: ['profiles']
      }

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // Top level keys: "data" and "meta"
      const topLevelKeys = ['data', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data items
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(1)

      // Empty relationship reference
      expect(payload.data[0].relationships).toEqual(
        { profiles: { data: [] } }
      )

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 1
        }
      )
    })

    it('should return a paginated collection in JSON API shape with included associations', async () => {
      const specUser = {
        modelName: 'User',
        defaultOrderBy: 'username'
      }
      const inputUser = {
        paginate: { skip: 1, limit: 5 }, // only 3 "info" records exist
        associations: ['info']
      }

      const payload = await projectAppJsonApi.getItems(specUser, inputUser)

      // Top level keys: "data" and "meta"
      const topLevelKeys = ['data', 'included', 'meta']
      expect(Object.keys(payload).sort()).toEqual(topLevelKeys)

      // Data items
      expect(payload.data).to.be.an('array')
      expect(payload.data).toHaveLength(5)
      expect(payload.data[0].attributes.username).toEqual('bethsmith')
      expect(payload.data[1].attributes.username).toEqual('hotmod')
      expect(payload.data[2].attributes.username).toEqual('jerrysmith')
      expect(payload.data[3].attributes.username).toEqual('mortysmith')
      expect(payload.data[4].attributes.username).toEqual('ricksanchez')

      // Included associations
      expect(payload.included).to.be.an('array')
      expect(payload.included).toHaveLength(3)

      // Meta info
      expect(payload.meta).toEqual(
        {
          total_items: 11,
          limit: 5,
          skip: 1
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

    it('should return a collection in flattened shape (no associations)', async () => {
      const specUser = {
        modelName: 'User',
        defaultOrderBy: 'username'
      }
      const inputUser = {}

      const payload = await projectAppFlat.getItems(specUser, inputUser)

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

      // Sixth record (ricksanshez)
      expect(payload.data[5]).toMatchInlineSnapshot({
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login_at: expect.any(String)
      }, `
        {
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
        }
      `)
    })

    it('should return a collection in flattened shape with included associations', async () => {
      const specUser = {
        modelName: 'User',
        defaultOrderBy: 'username'
      }
      const inputUser = {
        associations: ['info', 'profiles']
      }

      const payload = await projectAppFlat.getItems(specUser, inputUser)

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

      // Seventh record with 1 info and 2 profiles (segmented)
      expect(payload.data[6]).toMatchInlineSnapshot({
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
      }, `
        {
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
        }
      `)
    })
  })
})
