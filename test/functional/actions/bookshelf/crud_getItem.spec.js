import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import appMgmtModels from '../../../scenarios/app-mgmt/model-config'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'

let appMgmt = null
let appMgmtJsonApi = null
let blogApp = null
let projectApp = null
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

    it('should support querying by association fields', async () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'username', type: 'String', requiredOr: true },
          { name: 'info.professional_title', type: 'String', requiredOr: true }
        ],
        defaultOrderBy: 'username'
      }

      const userByProfessionalTitle = {
        fields: {
          'info.professional_title': 'Divergent Thinker'
        }
      }

      const getUserByProfessionalTitle = await projectApp.getItem(specUser, userByProfessionalTitle, 'flat')
      expect(getUserByProfessionalTitle.data.username).toEqual('segmented')
    })

    // describe('using advanced queries with object notation on the input value:', async () => {
    // })

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
})
