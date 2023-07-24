import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import appMgmtMethods from '../../../scenarios/app-mgmt/method-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import projectAppMethods from '../../../scenarios/project-app/method-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import blogAppMethods from '../../../scenarios/blog-app/method-config'

const chai = require('chai')
const expect = require('chai').expect
const chaiAsPromised = require('chai-as-promised')
const bookshelf = require('../../../db/bookshelf/service')
const { resetDB } = require('../../../db/bookshelf/db-utils')

chai.use(chaiAsPromised)

let appMgmt = null
let projectApp = null
let blogApp = null

describe('CUSTOM METHOD SIMULATION [bookshelf]', () => {
  before(() => {
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
    before(() => resetDB())

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
            data: appContent,
          },
        }

        const inputNoData = {
          fields: {
            app_id: appID,
          },
        }

        // No required lookup fields
        await expect(appMgmt.method.AppContent.saveContent(inputNoAppID))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required field: "app_id"',
          })

        // No required data fields
        await expect(appMgmt.method.AppContent.saveContent(inputNoData))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required field: "data"',
          })
      })

      it('should save a new package of data for a matching pair of provided fields', async () => {
        const appID = 'trendy-boutique'
        const key = 'winter-promo'
        const appContent = {
          trending: {
            men: 'pleather-jackets',
            women: 'faux-cotton-socks',
            kids: 'serial-killer-pillows',
          },
          discountBreakpoints: ['20%', '30%', '50%'],
        }

        const input = {
          fields: {
            app_id: appID,
            key,
            data: appContent,
          },
        }

        const created = await appMgmt.method.AppContent.saveContent(input)

        expect(created.attributes.id).to.equal(1)
        expect(created.attributes.app_id).to.equal(appID)
        expect(created.attributes.key).to.equal(key)

        const contentJSON = JSON.parse(created.attributes.data)
        expect(contentJSON.trending.men).to.equal('pleather-jackets')
        expect(contentJSON.trending.women).to.equal('faux-cotton-socks')
        expect(contentJSON.discountBreakpoints).to.be.an('array').that.has.length(3)
      })

      it(`should save a new package of data with a provided lookup field and leveraging the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" of another lookup field to satisfy the lookup requirement`, async () => {
        const appID = 'trendy-boutique'
        const appContent = {
          trending: {
            men: 'hats',
            women: 'belts',
            kids: 'mobile-phone-accessories',
          },
          newBrands: ['twisted-kids', 'forlorn', 'girl-in-the-rain'],
        }

        const input = {
          fields: {
            app_id: appID,
            data: appContent,
          },
        }

        const created = await appMgmt.method.AppContent.saveContent(input)

        expect(created.attributes.id).to.equal(1)
        expect(created.attributes.app_id).to.equal(appID)
        expect(created.attributes.key).to.equal('default')

        const contentJSON = JSON.parse(created.attributes.data)
        expect(contentJSON.trending.men).to.equal('hats')
        expect(contentJSON.trending.women).to.equal('belts')
        expect(contentJSON.newBrands).to.be.an('array').that.has.length(3)
      })

      it('should update an existing package of data according to the spec defintion', () => {
        const appID = 'trendy-boutique'
        const key = 'winter-promo'

        const contentWinterPromo = {
          trending: {
            men: 'mascara',
            women: 'faux-cotton-socks',
          },
          discountBreakpoints: ['10%', '20%', '30%', '35%', '40%'],
        }
        const contentDefault = {
          trending: {
            men: 'ascots',
            kids: 'fidget spinners with sharp blades',
          },
          newBrands: ['the-darkest-path', 'total-vanity'],
        }

        const inputWithKey = {
          fields: {
            app_id: appID,
            key,
            data: contentWinterPromo,
          },
        }
        const inputNoKey = {
          fields: {
            app_id: appID,
            data: contentDefault,
          },
        }

        const withKey = appMgmt.method.AppContent.saveContent(inputWithKey)
          .then((data) => {
            expect(data.attributes.id).to.equal(1)
            expect(data.attributes.app_id).to.equal(appID)
            expect(data.attributes.key).to.equal(key)

            const contentJSON = JSON.parse(data.attributes.data)
            expect(contentJSON.trending.men).to.equal('mascara')
            expect(contentJSON.trending.women).to.equal('faux-cotton-socks')
            expect(contentJSON.discountBreakpoints).to.be.an('array').that.has.length(5)
          })

        const defaultKey = appMgmt.method.AppContent.saveContent(inputNoKey)
          .then((data) => {
            expect(data.attributes.id).to.equal(2)
            expect(data.attributes.app_id).to.equal(appID)
            expect(data.attributes.key).to.equal('default')

            const contentJSON = JSON.parse(data.attributes.data)
            expect(contentJSON.trending.men).to.equal('ascots')
            expect(contentJSON.trending.kids).to.equal('fidget spinners with sharp blades')
            expect(contentJSON.newBrands).to.be.an('array').that.has.length(2)
          })

        return Promise.all([withKey, defaultKey])
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
      before(() => resetDB(['app-content']))

      it('should return an error (400) when required lookup fields are not provided', async () => {
        const input = {
          fields: {
            ignored_field: 'give-me-everything',
          },
        }

        // No required lookup fields
        await expect(appMgmt.method.AppContent.getContent(input))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required field: "app_id"',
          })
      })

      it('should retrieve the requested package of data for a matching pair of provided fields', () => {
        const appID = 'app-001'
        const key = 'v1.0'

        const input = {
          fields: {
            app_id: appID,
            key,
          },
        }

        return appMgmt.method.AppContent.getContent(input)
          .then((data) => {
            expect(data.attributes.app_id).to.equal(appID)
            expect(data.attributes.key).to.equal(key)

            const contentJSON = JSON.parse(data.attributes.data)
            expect(contentJSON.items_per_page).to.equal(25)
            expect(contentJSON.is_activated).to.equal(true)
            expect(contentJSON.modules).to.be.an('array').that.has.length(6)
          })
      })

      it(`should retrieve the default package of data for a provided lookup field, using the defined "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" to satisfy the lookup`, () => {
        const appID = 'app-001'

        const input = {
          fields: {
            app_id: appID,
          },
        }

        return appMgmt.method.AppContent.getContent(input)
          .then((data) => {
            expect(data.attributes.app_id).to.equal(appID)
            expect(data.attributes.key).to.equal('default')

            const contentJSON = JSON.parse(data.attributes.data)
            expect(contentJSON.items_per_page).to.equal(50)
            expect(contentJSON.is_activated).to.equal(false)
            expect(contentJSON.modules).to.be.an('array').that.has.length(3)
          })
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
      before(() => resetDB())

      it('should return an error (400) when the required field is not provided', async () => {
        const email = 'mastablasta@mail.com'
        const displayName = 'Blasta!'

        const input = {
          fields: {
            email,
            display_name: displayName,
          },
        }

        // Missing required field
        await expect(blogApp.method.User.createUser(input))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required field: "username"',
          })
      })

      it('should create a user when the required field is provided', () => {
        const username = 'mastablasta'

        const input = {
          fields: {
            username,
          },
        }

        return blogApp.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
              })
          })
      })

      it('should support all accepted fields in the spec', () => {
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
            avatar_url: avatarURL,
          },
        }

        return blogApp.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
                external_id: externalID,
                email,
                display_name: displayName,
                first_name: firstName,
                last_name: lastName,
                preferred_locale: preferredLocale,
                avatar_url: avatarURL,
              })
          })
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
      before(() => resetDB(['users']))

      it('should return an error (400) when the required field is not provided', async () => {
        const displayName = 'Updated Name'

        const input = {
          fields: {
            identifier: 4,
            display_name: displayName,
          },
        }

        // Missing required field
        await expect(blogApp.method.User.updateUser(input))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required field: "id"',
          })
      })

      it('should return an error (404) when the requested user does not exist', async () => {
        const userID = 999
        const displayName = 'Updated Name'

        const input = {
          fields: {
            id: userID,
            display_name: displayName,
          },
        }

        // Resource does not exist
        await expect(blogApp.method.User.updateUser(input))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 404,
            message: 'The requested "User" was not found.',
          })
      })

      it('should update an existing user for a single field', () => {
        const userID = 4
        const displayName = 'Updated Name'

        const input = {
          fields: {
            id: userID,
            display_name: displayName,
          },
        }

        return blogApp.method.User.updateUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username: 'the_manic_edge',
                external_id: '304',
                email: 'the-manic-edge@demo.com',
                display_name: displayName,
              })
          })
      })

      it('should support all accepted fields in the spec', () => {
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
            avatar_url: avatarURL,
          },
        }

        return blogApp.method.User.updateUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: '304',
                email,
                display_name: displayName,
                first_name: firstName,
                last_name: lastName,
                preferred_locale: preferredLocale,
                avatar_url: avatarURL,
              })
          })
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
      before(() => resetDB(['users']))

      it('should return an error (400) when none of the requiredOr fields are provided', async () => {
        const input = {
          fields: {
            identifier: 4,
          },
        }

        // Missing all requiredOr fields
        await expect(blogApp.method.User.getUser(input))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 400,
            message: 'Missing required fields: at least one of => ("id", "username", "external_id")',
          })
      })

      it('should return an error (404) when the requested user does not exist', async () => {
        const userID = 999
        const username = 'not-segmented'
        const externalID = '999305'

        const inputWithID = {
          fields: {
            id: userID,
          },
        }

        const inputWithUsername = {
          fields: {
            username,
          },
        }

        const inputWithExternalID = {
          fields: {
            external_id: externalID,
          },
        }

        // Using id
        await expect(blogApp.method.User.getUser(inputWithID))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 404,
            message: 'The requested "User" was not found.',
          })

        // Using username
        await expect(blogApp.method.User.getUser(inputWithUsername))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 404,
            message: 'The requested "User" was not found.',
          })

        // Using external_id
        await expect(blogApp.method.User.getUser(inputWithExternalID))
          .to.eventually.be.rejected
          .and.to.contain({
            name: 'JointStatusError',
            status: 404,
            message: 'The requested "User" was not found.',
          })
      })

      it(`should return only the fields specified by the "${ACTION.SPEC_FIELDS_TO_RETURN}" option`, () => {
        const userID = 5
        const username = 'segmented'
        const externalID = '305'
        const displayName = 'Segmented'

        const inputWithID = {
          fields: {
            id: userID,
          },
        }

        const inputWithUsername = {
          fields: {
            username,
          },
        }

        const inputWithExternalID = {
          fields: {
            external_id: externalID,
          },
        }

        const viaID = blogApp.method.User.getUser(inputWithID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              })

            expect(data.attributes).to.have.property('avatar_url')
            expect(data.attributes).to.not.have.property('email')
            expect(data.attributes).to.not.have.property('external_id')
          })

        const viaUsername = blogApp.method.User.getUser(inputWithUsername)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              })

            expect(data.attributes).to.have.property('avatar_url')
            expect(data.attributes).to.not.have.property('email')
            expect(data.attributes).to.not.have.property('external_id')
          })

        const viaExternalID = blogApp.method.User.getUser(inputWithExternalID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              })

            expect(data.attributes).to.have.property('avatar_url')
            expect(data.attributes).to.not.have.property('email')
            expect(data.attributes).to.not.have.property('external_id')
          })

        return Promise.all([
          viaID,
          viaUsername,
          viaExternalID,
        ])
      })
    }) // END - User.getUser

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
      before(() => resetDB(['users']))

      it('should return all users in the order defined by the spec, when no fields are provided', async () => {
        const data = await blogApp.method.User.getUsers({ fieldSet: 'withCreatedAt' })

        data.models.forEach((model, index) => {
          // matches `fieldsToReturn.withCreatedAt`
          expect(model).to.have.nested.property('attributes.id')
          expect(model).to.have.nested.property('attributes.username')
          expect(model).to.have.nested.property('attributes.created_at')

          // fields not in `fieldsToReturn`
          expect(model).to.not.have.nested.property('attributes.display_name')
          expect(model).to.not.have.nested.property('attributes.avatar_url')

          // test created_at is in desecending order
          if (index > 0) {
            const previousModel = data.models[index - 1]
            expect(model.attributes.created_at).to.be.below(previousModel.attributes.created_at)
          }
        })

        expect(data).to.have.lengthOf(10)
      })

      it('should return the filtered set of users when an accepted field is provided', async () => {
        const data = await blogApp.method.User.getUsers({
          fields: {
            preferred_locale: 'en-US',
          },
          fieldSet: 'withPreferredLocale',
        })

        data.models.forEach((model) => {
         // matches `fieldsToReturn.withPreferredLocale`
         expect(model).to.have.nested.property('attributes.id')
         expect(model).to.have.nested.property('attributes.username')
         expect(model).to.have.nested.property('attributes.preferred_locale', 'en-US')

         // fields not in `fieldsToReturn`
         expect(model).to.not.have.nested.property('attributes.display_name')
         expect(model).to.not.have.nested.property('attributes.avatar_url')
         expect(model).to.not.have.nested.property('attributes.created_at')
        })

        expect(data).to.have.lengthOf(8)
      })

      it('should return the filtered set of users when a ".contains" string query is provided', async () => {
      const data = await blogApp.method.User.getUsers({ fields: { 'username.contains': 'ed' } })

      data.models.forEach((model) => {
       expect(model).to.have.nested.property('attributes.username').that.have.string('ed')
      })

      expect(data).to.have.lengthOf(2)
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
      before(() => resetDB(['users']))

    }) // END - User.deleteUser

  }) // END - User

  // ---------------------------------------------------------------------------
  // Resource: Project (project-app)
  // ---------------------------------------------------------------------------
  describe('Project', () => {
    before(() => resetDB())

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
