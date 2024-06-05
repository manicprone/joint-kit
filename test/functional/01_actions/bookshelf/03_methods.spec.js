import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import appMgmtMethods from '../../../scenarios/app-mgmt/method-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import projectAppMethods from '../../../scenarios/project-app/method-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import blogAppMethods from '../../../scenarios/blog-app/method-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { mapAttrs, objectWithTimestamps } from '../../../utils'

let appMgmt = null
let projectApp = null
let blogApp = null

describe('CUSTOM METHOD SIMULATION [bookshelf]', () => {
  beforeAll(() => {
    // --------
    // App Mgmt
    // --------
    appMgmt = new Joint({ service: bookshelf })
    appMgmt.generate({ modelConfig: appMgmtModels, methodConfig: appMgmtMethods, log: false })

    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf })
    projectApp.generate({ modelConfig: projectAppModels, methodConfig: projectAppMethods, log: false })

    // --------
    // Blog App
    // --------
    blogApp = new Joint({ service: bookshelf })
    blogApp.generate({ modelConfig: blogAppModels, methodConfig: blogAppMethods, log: false })
  })

  // ---------------------------------------------------------------------------
  // Resource: AppContent (app-mgmt)
  // ---------------------------------------------------------------------------
  describe('AppContent', () => {
    beforeAll(() => resetDB())

    // -------------------------------------------------------------------------
    // Method: saveContent
    // Action: upsertItem
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'app_id', type: 'String', required: true, lookup: true },
    //     { name: 'data', type: 'JSON', required: true },
    //     { name: 'key', type: 'String', defaultValue: 'default', lookup: true },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('AppContent.saveContent (testing upsertItem)', () => {
      beforeEach(() => resetDB())

      it('should return an error (400) when the required fields are not provided', async () => {
        const appID = 'failed-app'
        const appContent = { appContent: { a: true, b: 'testMe', c: { deep: 1000 } } }

        const inputNoAppID = {
          fields: {
            data: appContent
          }
        }

        const inputNoData = {
          fields: {
            app_id: appID
          }
        }

        // No required lookup fields
        await expect(appMgmt.method.AppContent.saveContent(inputNoAppID))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required field: "app_id"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)

        // No required data fields
        await expect(appMgmt.method.AppContent.saveContent(inputNoData))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required field: "data"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })

      it('should save a new package of data for a matching pair of provided fields', async () => {
        const appID = 'trendy-boutique'
        const key = 'winter-promo'
        const appContent = {
          trending: {
            men: 'pleather-jackets',
            women: 'faux-cotton-socks',
            kids: 'serial-killer-pillows'
          },
          discountBreakpoints: ['20%', '30%', '50%']
        }

        const input = {
          fields: {
            app_id: appID,
            key,
            data: appContent
          }
        }

        const created = await appMgmt.method.AppContent.saveContent(input)

        expect(created.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "app_id": "trendy-boutique",
            "created_at": Any<Date>,
            "data": "{"trending":{"men":"pleather-jackets","women":"faux-cotton-socks","kids":"serial-killer-pillows"},"discountBreakpoints":["20%","30%","50%"]}",
            "id": 1,
            "key": "winter-promo",
            "updated_at": Any<Date>,
          }
        `)

        expect(JSON.parse(created.attributes.data)).toMatchInlineSnapshot(`
          {
            "discountBreakpoints": [
              "20%",
              "30%",
              "50%",
            ],
            "trending": {
              "kids": "serial-killer-pillows",
              "men": "pleather-jackets",
              "women": "faux-cotton-socks",
            },
          }
        `)
      })

      it(`should save a new package of data with a provided lookup field and leveraging the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" of another lookup field to satisfy the lookup requirement`, async () => {
        const appID = 'trendy-boutique'
        const appContent = {
          trending: {
            men: 'hats',
            women: 'belts',
            kids: 'mobile-phone-accessories'
          },
          newBrands: ['twisted-kids', 'forlorn', 'girl-in-the-rain']
        }

        const input = {
          fields: {
            app_id: appID,
            data: appContent
          }
        }

        const created = await appMgmt.method.AppContent.saveContent(input)

        expect(created.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "app_id": "trendy-boutique",
            "created_at": Any<Date>,
            "data": "{"trending":{"men":"hats","women":"belts","kids":"mobile-phone-accessories"},"newBrands":["twisted-kids","forlorn","girl-in-the-rain"]}",
            "id": 1,
            "key": "default",
            "updated_at": Any<Date>,
          }
        `)

        expect(JSON.parse(created.attributes.data)).toMatchInlineSnapshot(`
          {
            "newBrands": [
              "twisted-kids",
              "forlorn",
              "girl-in-the-rain",
            ],
            "trending": {
              "kids": "mobile-phone-accessories",
              "men": "hats",
              "women": "belts",
            },
          }
        `)
      })

      it('should update an existing package of data according to the spec defintion', async () => {
        const appID = 'trendy-boutique'
        const key = 'winter-promo'

        const contentWinterPromo = {
          trending: {
            men: 'mascara',
            women: 'faux-cotton-socks'
          },
          discountBreakpoints: ['10%', '20%', '30%', '35%', '40%']
        }
        const contentDefault = {
          trending: {
            men: 'ascots',
            kids: 'fidget spinners with sharp blades'
          },
          newBrands: ['the-darkest-path', 'total-vanity']
        }

        const inputWithKey = {
          fields: {
            app_id: appID,
            key,
            data: contentWinterPromo
          }
        }
        const inputNoKey = {
          fields: {
            app_id: appID,
            data: contentDefault
          }
        }

        const payloads = await Promise.all([
          appMgmt.method.AppContent.saveContent(inputWithKey),
          appMgmt.method.AppContent.saveContent(inputNoKey)
        ])

        // Due to a bug with property matchers in array the snapshot tested must be done in a loop
        // https://github.com/jestjs/jest/issues/9079
        payloads.forEach((data) => {
          expect(data.attributes).toMatchSnapshot(objectWithTimestamps)
          expect(JSON.parse(data.attributes.data)).toMatchSnapshot()
        })

        expect.assertions(4)
      })
    }) // END - AppContent.saveContent

    // -------------------------------------------------------------------------
    // Method: getContent
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'app_id', type: 'String', required: true },
    //     { name: 'key', type: 'String', defaultValue: 'default' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('AppContent.getContent', () => {
      beforeAll(() => resetDB(['app-content']))

      it('should return an error (400) when required lookup fields are not provided', async () => {
        const input = {
          fields: {
            ignored_field: 'give-me-everything'
          }
        }

        // No required lookup fields
        await expect(appMgmt.method.AppContent.getContent(input))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required field: "app_id"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })

      it('should retrieve the requested package of data for a matching pair of provided fields', async () => {
        const appID = 'app-001'
        const key = 'v1.0'

        const input = {
          fields: {
            app_id: appID,
            key
          }
        }

        const data = await appMgmt.method.AppContent.getContent(input)
        expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "app_id": "app-001",
            "created_at": Any<Date>,
            "data": "{ "items_per_page": 25, "is_activated": true, "modules": ["a", "b", "c", "x", "y", "z"] }",
            "id": 2,
            "key": "v1.0",
            "updated_at": Any<Date>,
          }
        `)

        expect(JSON.parse(data.attributes.data)).toMatchInlineSnapshot(`
          {
            "is_activated": true,
            "items_per_page": 25,
            "modules": [
              "a",
              "b",
              "c",
              "x",
              "y",
              "z",
            ],
          }
        `)
      })

      it(`should retrieve the default package of data for a provided lookup field, using the defined "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" to satisfy the lookup`, async () => {
        const appID = 'app-001'

        const input = {
          fields: {
            app_id: appID
          }
        }

        const data = await appMgmt.method.AppContent.getContent(input)
        expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "app_id": "app-001",
            "created_at": Any<Date>,
            "data": "{ "items_per_page": 50, "is_activated": false, "modules": ["a", "b", "c"] }",
            "id": 1,
            "key": "default",
            "updated_at": Any<Date>,
          }
        `)

        expect(JSON.parse(data.attributes.data)).toMatchInlineSnapshot(`
          {
            "is_activated": false,
            "items_per_page": 50,
            "modules": [
              "a",
              "b",
              "c",
            ],
          }
        `)
      })
    }) // END - AppContent.getContent
  }) // END - AppContent

  // ---------------------------------------------------------------------------
  // Resource: User (blog-app)
  // ---------------------------------------------------------------------------
  describe('User', () => {
    // -------------------------------------------------------------------------
    // Method: createUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'username', type: 'String', required: true },
    //     { name: 'external_id', type: 'String' },
    //     { name: 'email', type: 'String' },
    //     { name: 'display_name', type: 'String' },
    //     { name: 'first_name', type: 'String' },
    //     { name: 'last_name', type: 'String' },
    //     { name: 'preferred_locale', type: 'String' },
    //     { name: 'avatar_url', type: 'String' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('User.createUser', () => {
      beforeAll(() => resetDB())

      it('should return an error (400) when the required field is not provided', async () => {
        const email = 'mastablasta@mail.com'
        const displayName = 'Blasta!'

        const input = {
          fields: {
            email,
            display_name: displayName
          }
        }

        // Missing required field
        await expect(blogApp.method.User.createUser(input))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required field: "username"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })

      it('should create a user when the required field is provided', async () => {
        const username = 'mastablasta'

        const input = {
          fields: {
            username
          }
        }

        const data = await blogApp.method.User.createUser(input)
        expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "avatar_url": null,
            "created_at": Any<Date>,
            "display_name": null,
            "email": null,
            "external_id": null,
            "father_user_id": null,
            "first_name": null,
            "id": 1,
            "last_login_at": null,
            "last_name": null,
            "preferred_locale": null,
            "updated_at": Any<Date>,
            "username": "mastablasta",
          }
        `)
      })

      it('should support all accepted fields in the spec', async () => {
        const username = 'the_edge_case'
        const externalID = '333.011'
        const email = 'the_edge_case@mail.com'
        const displayName = 'The Edge Case'
        const firstName = 'Edge'
        const lastName = 'Case'
        const preferredLocale = 'zh-CN'
        const avatarURL = '//edgy.org/profile/333.011/avatar.png'

        const input = {
          fields: {
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
            preferred_locale: preferredLocale,
            avatar_url: avatarURL
          }
        }

        const data = await blogApp.method.User.createUser(input)
        expect(data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
          {
            "avatar_url": "//edgy.org/profile/333.011/avatar.png",
            "created_at": Any<Date>,
            "display_name": "The Edge Case",
            "email": "the_edge_case@mail.com",
            "external_id": "333.011",
            "father_user_id": null,
            "first_name": "Edge",
            "id": 2,
            "last_login_at": null,
            "last_name": "Case",
            "preferred_locale": "zh-CN",
            "updated_at": Any<Date>,
            "username": "the_edge_case",
          }
        `)
      })
    }) // END - User.createUser

    // -------------------------------------------------------------------------
    // Method: updateUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', required: true, lookup: true },
    //     { name: 'username', type: 'String' },
    //     { name: 'email', type: 'String' },
    //     { name: 'display_name', type: 'String' },
    //     { name: 'first_name', type: 'String' },
    //     { name: 'last_name', type: 'String' },
    //     { name: 'preferred_locale', type: 'String' },
    //     { name: 'avatar_url', type: 'String' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('User.updateUser', () => {
      beforeAll(() => resetDB(['users']))

      it('should return an error (400) when the required field is not provided', async () => {
        const displayName = 'Updated Name'

        const input = {
          fields: {
            identifier: 4,
            display_name: displayName
          }
        }

        // Missing required field
        await expect(blogApp.method.User.updateUser(input))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required field: "id"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })

      it('should return an error (404) when the requested user does not exist', async () => {
        const userID = 999
        const displayName = 'Updated Name'

        const input = {
          fields: {
            id: userID,
            display_name: displayName
          }
        }

        // Resource does not exist
        await expect(blogApp.method.User.updateUser(input))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "The requested "User" was not found.",
              "name": "JointStatusError",
              "status": 404,
            }
          `)
      })

      it('should update an existing user for a single field', async () => {
        const userID = 4
        const displayName = 'Updated Name'

        const input = {
          fields: {
            id: userID,
            display_name: displayName
          }
        }

        const data = await blogApp.method.User.updateUser(input)
        expect(data.attributes).toMatchInlineSnapshot({
          ...objectWithTimestamps,
          // TODO: confirm if this is an expected behaviour to not return Date type.
          //       If this is going to be changed, must check for existing usages for compatibility.
          last_login_at: expect.any(String)
        }, `
          {
            "avatar_url": null,
            "created_at": Any<Date>,
            "display_name": "Updated Name",
            "email": "the-manic-edge@demo.com",
            "external_id": "304",
            "father_user_id": null,
            "first_name": null,
            "id": 4,
            "last_login_at": Any<String>,
            "last_name": null,
            "preferred_locale": "en-US",
            "updated_at": Any<Date>,
            "username": "the_manic_edge",
          }
        `)
      })

      it('should support all accepted fields in the spec', async () => {
        const userID = 4
        const username = 'updated_username'
        const externalID = 'I will not be updated'
        const email = 'updated_email'
        const displayName = 'Updated Display Name'
        const firstName = 'The New First'
        const lastName = 'The New Last'
        const preferredLocale = 'zh-CN'
        const avatarURL = 'https://updated_avatar.jpg'

        const input = {
          fields: {
            id: userID,
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
            preferred_locale: preferredLocale,
            avatar_url: avatarURL
          }
        }

        const data = await blogApp.method.User.updateUser(input)
        expect(data.attributes).toMatchInlineSnapshot({
          ...objectWithTimestamps,
          // TODO: confirm if this is an expected behaviour to not return Date type.
          //       If this is going to be changed, must check for existing usages for compatibility.
          last_login_at: expect.any(String)
        }, `
          {
            "avatar_url": "https://updated_avatar.jpg",
            "created_at": Any<Date>,
            "display_name": "Updated Display Name",
            "email": "updated_email",
            "external_id": "304",
            "father_user_id": null,
            "first_name": "The New First",
            "id": 4,
            "last_login_at": Any<String>,
            "last_name": "The New Last",
            "preferred_locale": "zh-CN",
            "updated_at": Any<Date>,
            "username": "updated_username",
          }
        `)
      })
    }) // END - User.updateUser

    // -------------------------------------------------------------------------
    // Method: getUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', requiredOr: true },
    //     { name: 'username', type: 'String', requiredOr: true },
    //     { name: 'external_id', type: 'String', requiredOr: true },
    //   ],
    //   fieldsToReturn: ['id', 'username', 'display_name', 'avatar_url'],
    // },
    // -------------------------------------------------------------------------
    describe('User.getUser', () => {
      beforeAll(() => resetDB(['users']))

      it('should return an error (400) when none of the requiredOr fields are provided', async () => {
        const input = {
          fields: {
            identifier: 4
          }
        }

        // Missing all requiredOr fields
        await expect(blogApp.method.User.getUser(input))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "Missing required fields: at least one of => ("id", "username", "external_id")",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })

      it('should return an error (404) when the requested user does not exist', async () => {
        const userID = 999
        const username = 'not-segmented'
        const externalID = '999305'

        const inputWithID = {
          fields: {
            id: userID
          }
        }

        const inputWithUsername = {
          fields: {
            username
          }
        }

        const inputWithExternalID = {
          fields: {
            external_id: externalID
          }
        }

        // Using id
        await expect(blogApp.method.User.getUser(inputWithID))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "The requested "User" was not found.",
              "name": "JointStatusError",
              "status": 404,
            }
          `)

        // Using username
        await expect(blogApp.method.User.getUser(inputWithUsername))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "The requested "User" was not found.",
              "name": "JointStatusError",
              "status": 404,
            }
          `)

        // Using external_id
        await expect(blogApp.method.User.getUser(inputWithExternalID))
          .rejects
          .toMatchInlineSnapshot(`
            {
              "message": "The requested "User" was not found.",
              "name": "JointStatusError",
              "status": 404,
            }
          `)
      })

      it(`should return only the fields specified by the "${ACTION.SPEC_FIELDS_TO_RETURN}" option`, async () => {
        const userID = 5
        const username = 'segmented'
        const externalID = '305'

        const inputWithID = {
          fields: {
            id: userID
          }
        }

        const inputWithUsername = {
          fields: {
            username
          }
        }

        const inputWithExternalID = {
          fields: {
            external_id: externalID
          }
        }

        const payloads = await Promise.all([
          blogApp.method.User.getUser(inputWithID),
          blogApp.method.User.getUser(inputWithUsername),
          blogApp.method.User.getUser(inputWithExternalID)
        ])

        // Due to a bug with property matchers in array the snapshot tested must be done in a loop
        // https://github.com/jestjs/jest/issues/9079
        payloads.forEach((data) => {
          expect(data.attributes).toMatchInlineSnapshot(`
            {
              "avatar_url": null,
              "display_name": "Segmented",
              "id": 5,
              "username": "segmented",
            }
          `)
        })

        expect.assertions(3)
      })//
    }) /// / END - User.getUser

    // -------------------------------------------------------------------------
    // Method: getUsers
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'preferred_locale', type: 'String' },
    //   ],
    //   fieldsToReturn: {
    //     default: ['id', 'username', 'display_name', 'avatar_url'],
    //     withCreatedAt: ['id', 'username', 'created_at'],
    //     withPreferredLocale: ['id', 'username', 'preferred_locale'],
    //   },
    //   defaultOrderBy: '-created_at,username',
    // },
    // -------------------------------------------------------------------------
    describe('User.getUsers', () => {
      beforeAll(() => resetDB(['users']))

      it('should return all users in the order defined by the spec, when no fields are provided', async () => {
        const data = await blogApp.method.User.getUsers({ fieldSet: 'withCreatedAt' })

        expect(data).toHaveLength(11)
        data.models.forEach((model, index) => {
          expect(model.attributes).toMatchSnapshot({ created_at: expect.any(Date) })

          // test created_at is in desecending order
          if (index > 0) {
            const previousModel = data.models[index - 1]
            expect(model.attributes.created_at.getTime())
              .toBeLessThan(previousModel.attributes.created_at.getTime())
          }
        })

        expect.assertions(22)
      })

      it('should return the filtered set of users when an accepted field is provided', async () => {
        const data = await blogApp.method.User.getUsers({
          fields: {
            preferred_locale: 'en-US'
          },
          fieldSet: 'withPreferredLocale'
        })

        expect(data).toHaveLength(8)
        data.models.forEach((model) => {
          expect(model.attributes).toMatchSnapshot()
        })

        expect.assertions(9)
      })

      it('should return the filtered set of users when a ".contains" string query is provided', async () => {
        const data = await blogApp.method.User.getUsers({ fields: { 'username.contains': 'ed' } })

        expect(mapAttrs(data.models)).toMatchInlineSnapshot(`
          [
            {
              "avatar_url": null,
              "display_name": "Segmented",
              "id": 5,
              "username": "segmented",
            },
            {
              "avatar_url": null,
              "display_name": "The Manic Edge",
              "id": 4,
              "username": "the_manic_edge",
            },
          ]
        `)
      })
    }) // END - User.getUsers

    // -------------------------------------------------------------------------
    // Method: deleteUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', requiredOr: true },
    //     { name: 'username', type: 'String', requiredOr: true },
    //     { name: 'external_id', type: 'String', requiredOr: true },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe.skip('User.deleteUser', () => {
      beforeAll(() => resetDB(['users']))
    }) // END - User.deleteUser
  }) // END - User

  // ---------------------------------------------------------------------------
  // Resource: Project (project-app)
  // ---------------------------------------------------------------------------
  describe('Project', () => {
    beforeAll(() => resetDB())

    // -------------------------------------------------------------------------
    // Method: createProject
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'name', type: 'String', required: true },
    //     { name: 'alias', type: 'String' },
    //     { name: 'image_url', type: 'String' },
    //     { name: 'location', type: 'String' },
    //     { name: 'brief_description', type: 'String' },
    //     { name: 'full_description', type: 'String' },
    //     { name: 'is_internal', type: 'Boolean', defaultValue: false },
    //     { name: 'status_code', type: 'Number' },
    //     { name: 'started_at', type: 'String' },
    //     { name: 'finished_at', type: 'String' },
    //     { name: 'created_by', type: 'Number' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe.skip('Project.createProject', () => {
    }) // END - Project.createProject
  }) // END - Project
})
