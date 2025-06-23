import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ACTION from '../../../../src/core/constants/action-constants'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'

let projectApp = null
let blogApp = null
let blogAppJsonApi = null

// Values for expectation
const allColsUser = [
  'id',
  'external_id',
  'email',
  'username',
  'display_name',
  'first_name',
  'last_name',
  'preferred_locale',
  'avatar_url',
  'last_login_at',
  'created_at',
  'updated_at',
  'father_user_id'
]

// -----------------------------------------------------------------------------
// BOOKSHELF ACTION: getItems
// -----------------------------------------------------------------------------
describe('ACTION: getItems [bookshelf]', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

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
  // getItems
  // ---------------------------------------------------------------------------
  describe('getItems', () => {
    beforeEach(() => resetDB(['users', 'roles', 'profiles', 'projects']))

    it('should return all rows according to the provided spec and input', async () => {
      // ----
      // User
      // ----
      const specUser = {
        modelName: 'User',
        defaultOrderBy: '-created_at'
      }
      const inputUsers = {}

      // -------
      // Profile
      // -------
      const specProfile = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean' }
        ],
        defaultOrderBy: '-created_at'
      }
      const inputAllProfiles = {}
      const inputLiveProfiles = {
        fields: {
          is_live: true
        }
      }
      const inputNotLiveProfiles = {
        fields: {
          is_live: false
        }
      }
      const inputExplicitSetOfProfiles = {
        fields: {
          id: [1, 2, 4, 5, 6]
        }
      }

      await blogApp.getItems(specUser, inputUsers)
        .then((data) => {
          expect(data.models).to.have.length(11)
        })

      await blogApp.getItems(specProfile, inputAllProfiles)
        .then((data) => {
          expect(data.models).to.have.length(11)
        })

      await blogApp.getItems(specProfile, inputLiveProfiles)
        .then((data) => {
          expect(data.models).to.have.length(7)
        })

      await blogApp.getItems(specProfile, inputNotLiveProfiles)
        .then((data) => {
          expect(data.models).to.have.length(4)
        })

      await blogApp.getItems(specProfile, inputExplicitSetOfProfiles)
        .then((data) => {
          expect(data.models).to.have.length(5)
        })
    })

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, async () => {
      const onlyLiveProfiles = true

      const specNoDefaultValue = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean', locked: true }
        ],
        defaultOrderBy: '-created_at'
      }
      const specWithDefaultValue = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean', locked: true, defaultValue: onlyLiveProfiles }
        ],
        defaultOrderBy: '-created_at'
      }
      const specWithExplicitIDs = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', locked: true, defaultValue: [1, 2, 4] }
        ],
        defaultOrderBy: '-created_at'
      }

      const input = {
        fields: { is_live: false }
      }

      // If no "defaultValue" is provided, the field will not be included in the request...
      await blogApp.getItems(specNoDefaultValue, input)
        .then((data) => {
          expect(data.models).to.have.length(11)
        })

      await blogApp.getItems(specWithDefaultValue, input)
        .then((data) => {
          expect(data.models).to.have.length(7)
        })

      await blogApp.getItems(specWithExplicitIDs, input)
        .then((data) => {
          expect(data.models).to.have.length(3)
        })
    })

    it('should only return the field data that is permitted by the spec', async () => {
      const specBase = {
        modelName: 'User',
        defaultOrderBy: '-created_at'
      }

      const specColsSpecified = Object.assign({}, specBase)
      specColsSpecified.fieldsToReturn = ['id', 'username', 'display_name']

      const input = {}

      const getAllColsFromBase = await blogApp.getItems(specBase, input)
      expect(getAllColsFromBase.models[0].attributes).toMatchInlineSnapshot({
        ...objectWithTimestamps,
        // TODO: confirm if this is an expected behaviour to not return Date type.
        //       If this is going to be changed, must check for existing usages for compatibility.
        last_login_at: expect.any(String)
      },
        `
          {
            "avatar_url": null,
            "created_at": Any<Date>,
            "display_name": "Z'araq",
            "email": "zarap@trendymail.org",
            "external_id": "987",
            "father_user_id": null,
            "first_name": "Z'araq",
            "id": 11,
            "last_login_at": Any<String>,
            "last_name": null,
            "preferred_locale": "zaralianen-EXT",
            "updated_at": Any<Date>,
            "username": "zaraq",
          }
        `
      )

      const getSpecifiedCols = await blogApp.getItems(specColsSpecified, input)
      expect(getSpecifiedCols.models[0].attributes).toMatchInlineSnapshot(`
        {
          "display_name": "Z'araq",
          "id": 11,
          "username": "zaraq",
        }
      `)
    })

    it(`should support the "input.${ACTION.INPUT_FIELD_SET}" syntax, permitting various sets of returned field data`, () => {
      const specBase = {
        modelName: 'User',
        defaultOrderBy: '-created_at'
      }

      const specColsWithDefault = Object.assign({}, specBase)
      specColsWithDefault.fieldsToReturn = {
        default: ['id', 'email', 'username', 'display_name', 'external_id'],
        list: ['id', 'username', 'display_name'],
        avatar: ['display_name', 'avatar_url']
      }

      const specColsWithoutDefault = Object.assign({}, specBase)
      specColsWithoutDefault.fieldsToReturn = {
        list: ['id', 'username', 'display_name'],
        avatar: ['display_name', 'avatar_url']
      }

      const inputWithUndefinedSet = { fieldSet: 'unknown' }
      const inputWithDefaultSet = { fieldSet: 'default' }
      const inputWithListSet = { fieldSet: 'list' }

      const getAllColsWithBase = blogApp.getItems(specBase, inputWithListSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(allColsUser)
        })

      const getDefaultSetImplicitly = blogApp.getItems(specColsWithDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default)
        })

      const getAllColsWithUnknownSetAndNoDefault = blogApp.getItems(specColsWithoutDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(allColsUser)
        })

      const getDefaultSetExplicitly = blogApp.getItems(specColsWithDefault, inputWithDefaultSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default)
        })

      const getListSet = blogApp.getItems(specColsWithDefault, inputWithListSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.list)
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
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at'
      }
      const inputWithAssoc = {
        associations: ['info']
      }
      const inputWithoutAssoc = {}

      const withAssoc = blogApp.getItems(spec, inputWithAssoc)
        .then((data) => {
          const fourthUser = data.models[3]

          expect(fourthUser)
            .to.have.property('relations')
            .that.has.property('info')

          const infoData = fourthUser.relations.info
          expect(infoData)
            .to.have.property('attributes')
            .that.contains({
              user_id: 4,
              professional_title: 'EdgeCaser'
            })
        })

      const withoutAssoc = blogApp.getItems(spec, inputWithoutAssoc)
        .then((data) => {
          expect(data.models[3].relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([withAssoc, withoutAssoc])
    })

    it(`should support the "spec.${ACTION.SPEC_FORCE_ASSOCIATIONS}" option`, () => {
      const associationNameInfo = 'info'
      const associationNameRoles = 'roles'
      const associationNameProfiles = 'profiles'

      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
        forceAssociations: [associationNameInfo, associationNameProfiles]
      }

      const inputWithoutAssoc = {}
      const inputWithAssoc = {
        associations: [associationNameProfiles, associationNameRoles]
      }

      const withoutInputAssoc = blogApp.getItems(spec, inputWithoutAssoc)
        .then((data) => {
          const fourthUser = data.models[3]

          expect(fourthUser.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles
          ])
        })

      const withInputAssoc = blogApp.getItems(spec, inputWithAssoc)
        .then((data) => {
          const fourthUser = data.models[3]

          expect(fourthUser.relations).to.have.keys([
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
        defaultOrderBy: 'updated_at'
      }

      const input = {
        loadDirect: ['info:professional_title', 'roles:name']
      }

      const withLoadDirect = blogApp.getItems(spec, input)
        .then((data) => {
          const sixthUser = data.models[5]

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' })

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger'])

          expect(sixthUser.relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([withLoadDirect])
    })

    it(`should support the "spec.${ACTION.SPEC_FORCE_LOAD_DIRECT}" option, granting precendence over the input`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
        forceLoadDirect: ['info:professional_title']
      }

      const inputNoLoadDirect = {}
      const inputWithLoadDirect = {
        loadDirect: ['info:*', 'roles:name']
      }

      const noInputLoadDirect = blogApp.getItems(spec, inputNoLoadDirect)
        .then((data) => {
          const sixthUser = data.models[5]

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' })

          expect(sixthUser.relations).toMatchInlineSnapshot('{}')
        })

      const withInputLoadDirect = blogApp.getItems(spec, inputWithLoadDirect)
        .then((data) => {
          const sixthUser = data.models[5]

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' })

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger'])

          expect(sixthUser.relations).toMatchInlineSnapshot('{}')
        })

      return Promise.all([withInputLoadDirect, noInputLoadDirect])
    })

    it(`should support the combined usage of "input.${ACTION.INPUT_ASSOCIATIONS}" and "input.${ACTION.INPUT_LOAD_DIRECT}" properties`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at'
      }

      const input = {
        associations: ['profiles'],
        loadDirect: ['info:professional_title', 'roles:name']
      }

      const withBoth = blogApp.getItems(spec, input)
        .then((data) => {
          const sixthUser = data.models[5]

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' })

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger'])

          expect(sixthUser.relations).to.have.keys('profiles')
        })

      return Promise.all([withBoth])
    })

    it(`should return paginated results when the "input.${ACTION.INPUT_PAGINATE}" option is used`, async () => {
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' }
        ],
        defaultOrderBy: 'created_at'
      }
      const inputFirstThree = {
        fields: { is_internal: false },
        paginate: { skip: 0, limit: 3 }
      }
      const inputSecondThree = {
        fields: { is_internal: false },
        paginate: { skip: 3, limit: 3 }
      }
      const inputThirdAndFourth = {
        fields: { is_internal: false },
        paginate: { skip: 2, limit: 2 }
      }
      const inputTheRest = {
        fields: { is_internal: false },
        paginate: { skip: 6, limit: 99 }
      }

      const firstThree = projectApp.getItems(specProject, inputFirstThree)
        .then((data) => {
          expect(data.models).to.have.length(3)
          expect(data.models[0]).to.contain({ id: 5 })
          expect(data.models[1]).to.contain({ id: 6 })
          expect(data.models[2]).to.contain({ id: 7 })
        })

      const secondThree = projectApp.getItems(specProject, inputSecondThree)
        .then((data) => {
          expect(data.models).to.have.length(3)
          expect(data.models[0]).to.contain({ id: 8 })
          expect(data.models[1]).to.contain({ id: 9 })
          expect(data.models[2]).to.contain({ id: 10 })
        })

      const theThirdAndFourth = projectApp.getItems(specProject, inputThirdAndFourth)
        .then((data) => {
          expect(data.models).to.have.length(2)
          expect(data.models[0]).to.contain({ id: 7 })
          expect(data.models[1]).to.contain({ id: 8 })
        })

      const theRest = projectApp.getItems(specProject, inputTheRest)
        .then((data) => {
          expect(data.models).to.have.length(4)
          expect(data.models[0]).to.contain({ id: 11 })
          expect(data.models[1]).to.contain({ id: 12 })
          expect(data.models[2]).to.contain({ id: 13 })
          expect(data.models[3]).to.contain({ id: 14 })
        })

      return Promise.all([firstThree, secondThree, theThirdAndFourth, theRest])
    })

    it('should return an empty array when requesting a pagination offset that does not exist', () => {
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' }
        ],
        defaultOrderBy: 'created_at'
      }
      const inputProjects = {
        fields: { is_internal: false },
        paginate: { skip: 9999, limit: 10 }
      }

      return projectApp.getItems(specProject, inputProjects)
        .then((data) => {
          expect(data.models).to.have.length(0)
        })
    })

    it(`should order the results according to the "spec.${ACTION.SPEC_DEFAULT_ORDER_BY}" and "input.${ACTION.INPUT_ORDER_BY}" options`, () => {
      // -------
      // Profile
      // -------
      const specProfile = {
        modelName: 'Profile',
        defaultOrderBy: 'created_at'
      }
      const profilesDefaultOrder = {}

      // -------
      // Project
      // -------
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' }
        ],
        defaultOrderBy: 'created_at'
      }
      const projectsDefaultOrder = {
        fields: { is_internal: false }
      }
      const projectsNameASC = {
        fields: { is_internal: false },
        orderBy: 'name'
      }

      const getProfilesInDefaultOrder = blogApp.getItems(specProfile, profilesDefaultOrder)
        .then((data) => {
          expect(data.models).to.have.length(11)
          expect(data.models[0]).to.contain({ id: 1 })
          expect(data.models[1]).to.contain({ id: 2 })
          expect(data.models[2]).to.contain({ id: 3 })
          expect(data.models[3]).to.contain({ id: 4 })
          expect(data.models[4]).to.contain({ id: 5 })
          expect(data.models[5]).to.contain({ id: 6 })
          expect(data.models[6]).to.contain({ id: 7 })
          expect(data.models[7]).to.contain({ id: 8 })
          expect(data.models[8]).to.contain({ id: 9 })
          expect(data.models[9]).to.contain({ id: 10 })
          expect(data.models[10]).to.contain({ id: 11 })
        })

      const getProjectsInDefaultOrder = projectApp.getItems(specProject, projectsDefaultOrder)
        .then((data) => {
          expect(data.models).to.have.length(10)
          expect(data.models[0]).to.contain({ id: 5 })
          expect(data.models[1]).to.contain({ id: 6 })
          expect(data.models[2]).to.contain({ id: 7 })
          expect(data.models[3]).to.contain({ id: 8 })
          expect(data.models[4]).to.contain({ id: 9 })
          expect(data.models[5]).to.contain({ id: 10 })
          expect(data.models[6]).to.contain({ id: 11 })
          expect(data.models[7]).to.contain({ id: 12 })
          expect(data.models[8]).to.contain({ id: 13 })
          expect(data.models[9]).to.contain({ id: 14 })
        })

      const getProjectsInNameASC = projectApp.getItems(specProject, projectsNameASC)
        .then((data) => {
          expect(data.models).to.have.length(10)
          expect(data.models[0]).to.contain({ id: 12 }) // A
          expect(data.models[1]).to.contain({ id: 5 }) // E
          expect(data.models[2]).to.contain({ id: 11 }) // H
          expect(data.models[3]).to.contain({ id: 6 }) // J
          expect(data.models[4]).to.contain({ id: 14 }) // K
          expect(data.models[5]).to.contain({ id: 9 }) // L
          expect(data.models[6]).to.contain({ id: 13 }) // N
          expect(data.models[7]).to.contain({ id: 7 }) // P
          expect(data.models[8]).to.contain({ id: 10 }) // T
          expect(data.models[9]).to.contain({ id: 8 }) // W
        })

      return Promise.all([
        getProfilesInDefaultOrder,
        getProjectsInDefaultOrder,
        getProjectsInNameASC
      ])
    })

    describe('ordering the results by association fields:', async () => {
      it('should support both "toOne" and "toMany" types alongside main resource fields', async () => {
        // ----
        // User
        // ----
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'preferred_locale', type: 'String' }
          ],
          defaultOrderBy: 'created_at'
        }
        const usersInfoProTitleASC = {
          fields: {},
          orderBy: 'info.professional_title',
          associations: ['info']
        }
        const usersInfoWithoutAssocProTitleAndUsernameASC = {
          fields: {},
          orderBy: 'info.professional_title,username'
        }
        const usersInfoWithoutAssocProTitleASC = {
          fields: {},
          orderBy: 'info.professional_title'
        }
        const usersInfoProTitleDSC = {
          fields: {},
          orderBy: '-info.professional_title',
          associations: ['info']
        }

        // Ordered by association field ASC (nulls always at the end)
        const getUsersAsInfoProTitleASC = await projectApp.getItems(specUser, usersInfoProTitleASC)
        expect(getUsersAsInfoProTitleASC.models).to.have.length(11)
        const userInfoResults = getUsersAsInfoProTitleASC.models.map(it => it.relations.info)
        expect(userInfoResults[0].attributes).to.contain({ professional_title: 'Afterthought' }) // mortysmith
        expect(userInfoResults[1].attributes).to.contain({ professional_title: 'Divergent Thinker' }) // segmented
        expect(userInfoResults[2].attributes).to.contain({ professional_title: 'EdgeCaser' }) // the_manic_edge
        expect(userInfoResults[3].attributes).to.contain({ professional_title: 'Rickforcer' }) // ricksanchez
        expect(userInfoResults[4].attributes).to.contain({ professional_title: 'Space Beth' }) // bethsmith
        expect(userInfoResults[5].attributes).toEqual({})
        expect(userInfoResults[6].attributes).toEqual({})
        expect(userInfoResults[7].attributes).toEqual({})
        expect(userInfoResults[8].attributes).toEqual({})
        expect(userInfoResults[9].attributes).toEqual({})
        expect(userInfoResults[10].attributes).toEqual({})

        // Ordered by association field first, then main resource field
        const getUsersWithoutAssocAsInfoProTitleAndUsernameASC = await projectApp.getItems(specUser, usersInfoWithoutAssocProTitleAndUsernameASC)
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models).to.have.length(11)
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[0].attributes).to.contain({ username: 'mortysmith' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[1].attributes).to.contain({ username: 'segmented' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[2].attributes).to.contain({ username: 'the_manic_edge' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[3].attributes).to.contain({ username: 'ricksanchez' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[4].attributes).to.contain({ username: 'bethsmith' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[5].attributes).to.contain({ username: 'admin' }) // ---- The rest are default sorted by their "username" ASC
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[6].attributes).to.contain({ username: 'hotmod' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[7].attributes).to.contain({ username: 'jerrysmith' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[8].attributes).to.contain({ username: 'summersmith' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[9].attributes).to.contain({ username: 'super-admin' })
        expect(getUsersWithoutAssocAsInfoProTitleAndUsernameASC.models[10].attributes).to.contain({ username: 'zaraq' })

        // Ordered by association field, without including the association (per the request)
        const getUsersWithoutAssocAsInfoProTitleASC = await projectApp.getItems(specUser, usersInfoWithoutAssocProTitleASC)
        expect(getUsersWithoutAssocAsInfoProTitleASC.models).to.have.length(11)
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[0].attributes).to.contain({ username: 'mortysmith' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[1].attributes).to.contain({ username: 'segmented' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[2].attributes).to.contain({ username: 'the_manic_edge' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[3].attributes).to.contain({ username: 'ricksanchez' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[4].attributes).to.contain({ username: 'bethsmith' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[5].attributes).to.contain({ username: 'super-admin' }) // ---- The rest are default sorted by their "id"
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[6].attributes).to.contain({ username: 'admin' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[7].attributes).to.contain({ username: 'hotmod' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[8].attributes).to.contain({ username: 'jerrysmith' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[9].attributes).to.contain({ username: 'summersmith' })
        expect(getUsersWithoutAssocAsInfoProTitleASC.models[10].attributes).to.contain({ username: 'zaraq' })

        // Ordered by associated field DESC (nulls always at the end)
        const getUsersAsInfoProTitleDSC = await projectApp.getItems(specUser, usersInfoProTitleDSC)
        expect(getUsersAsInfoProTitleDSC.models).to.have.length(11)
        const userInfoResults2 = getUsersAsInfoProTitleDSC.models.map(it => it.relations.info)
        expect(userInfoResults2[0].attributes).to.contain({ professional_title: 'Space Beth' })
        expect(userInfoResults2[1].attributes).to.contain({ professional_title: 'Rickforcer' })
        expect(userInfoResults2[2].attributes).to.contain({ professional_title: 'EdgeCaser' })
        expect(userInfoResults2[3].attributes).to.contain({ professional_title: 'Divergent Thinker' })
        expect(userInfoResults2[4].attributes).to.contain({ professional_title: 'Afterthought' })
        expect(userInfoResults2[5].attributes).toEqual({})
        expect(userInfoResults2[6].attributes).toEqual({})
        expect(userInfoResults2[7].attributes).toEqual({})
        expect(userInfoResults2[8].attributes).toEqual({})
        expect(userInfoResults2[9].attributes).toEqual({})
        expect(userInfoResults2[10].attributes).toEqual({})
      })

      it(`should return an error (400) if the "${ACTION.INPUT_ORDER_BY}" arguments are invalid`, async () => {
        // ----
        // User
        // ----
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'preferred_locale', type: 'String' }
          ],
          defaultOrderBy: 'created_at'
        }
        const usersInvalidAssoc = {
          fields: {},
          orderBy: '-fake.professional_title'
        }
        const usersWithToManyAssoc = {
          fields: {},
          orderBy: 'profiles.title,-username'
        }

        // An invalid association name
        await expect(projectApp.getItems(specUser, usersInvalidAssoc))
          .rejects
          .toThrowErrorMatchingInlineSnapshot(`
            {
              "message": "Failed to build orderBy clause due to issues:\n\tThe orderBy argument "fake.professional_title" is invalid as the association "fake" does not exist for model "User"",
              "name": "JointStatusError",
              "status": 400,
            }
          `)

        // A "toMany" association type
        await expect(projectApp.getItems(specUser, usersWithToManyAssoc))
          .rejects
          .toThrowErrorMatchingInlineSnapshot(`
            {
              "message": "Failed to build orderBy clause due to issues:\n\tThe orderBy argument "profiles.title" is invalid because the association "profiles" is not of type "toOne".",
              "name": "JointStatusError",
              "status": 400,
            }
          `)
      })
    })

    // TODO - Test multiple operators on a single query !!!

    describe('using advanced queries with object notation on the input value:', async () => {
      it(`should support the ${ACTION.INPUT_FIELD_QUERY_CONTAINS} operator (for case sensitive)`, async () => {
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'username', type: 'String' },
            { name: 'display_name', type: 'String' }
          ],
          defaultOrderBy: 'username'
        }

        const usersDirectMatch = {
          fields: {
            username: 'admin'
          }
        }
        const usersFilteredByContains = {
          fields: {
            username: {
              contains: 'admin'
            }
          },
          orderBy: '-username'
        }
        const usersFilteredWithCaseSensitivity = {
          fields: {
            display_name: {
              contains: 'Ed'
            }
          },
          orderBy: '-username'
        }

        const getUsersDirectMatch = await projectApp.getItems(specUser, usersDirectMatch, 'flat')
        expect(getUsersDirectMatch.data).to.have.length(1)
        expect(getUsersDirectMatch.data[0].username).toEqual('admin')

        const getUsersFilteredByContains = await projectApp.getItems(specUser, usersFilteredByContains, 'flat')
        expect(getUsersFilteredByContains.data).to.have.length(2)
        expect(getUsersFilteredByContains.data[0].username).toEqual('super-admin')
        expect(getUsersFilteredByContains.data[1].username).toEqual('admin')

        const getUsersFilteredByCS = await projectApp.getItems(specUser, usersFilteredWithCaseSensitivity, 'flat')
        expect(getUsersFilteredByCS.data).to.have.length(1)
        expect(getUsersFilteredByCS.data[0].display_name).toEqual('The Manic Edge')
      })

      it(`should support the ${ACTION.INPUT_FIELD_QUERY_CONTAINS} operator with an association field`, async () => {
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'username', type: 'String' },
            { name: 'display_name', type: 'String' },
            { name: 'info.tagline', type: 'String' }
          ],
          defaultOrderBy: 'username'
        }

        const usersByProfileTagline = {
          fields: {
            'info.tagline': {
              contains: 'History'
            }
          }
        }

        const getUsersByProfileTagline = await projectApp.getItems(specUser, usersByProfileTagline, 'flat')
        expect(getUsersByProfileTagline.data).to.have.length(1)
        expect(getUsersByProfileTagline.data[0].username).toEqual('segmented')
        expect(getUsersByProfileTagline.data[0].tagline).toEqual('History favors the impetus of the author')
      })

      // TODO - Need to figure this one out !!!
      it.skip(`should support filtering special characters with the ${ACTION.INPUT_FIELD_QUERY_CONTAINS} operator`, async () => {
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'username', type: 'String' },
            { name: 'display_name', type: 'String' }
          ],
          defaultOrderBy: 'username'
        }

        const usersFilteredByContains = {
          fields: {
            username: {
              contains: '\''
            }
          }
        }

        const getUsersFilteredByContains = await projectApp.getItems(specUser, usersFilteredByContains, 'flat')
        // console.log('[DEVING] !!!!! getUsersFilteredByContains:', getUsersFilteredByContains)

        expect(getUsersFilteredByContains.data).to.have.length(2)
        expect(getUsersFilteredByContains.data[0].username).toEqual('super-admin')
        expect(getUsersFilteredByContains.data[1].username).toEqual('admin')
      })

      it(`should support the ${ACTION.INPUT_FIELD_QUERY_CONTAINS_INSENSITIVE} property (for case insensitive)`, async () => {
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'username', type: 'String' },
            { name: 'display_name', type: 'String' }
          ],
          defaultOrderBy: 'username'
        }

        const usersFilteredWithCI = {
          fields: {
            display_name: {
              containsI: 'Ed'
            }
          },
          orderBy: '-username'
        }

        const getUsersFilteredByCI = await projectApp.getItems(specUser, usersFilteredWithCI, 'flat')
        expect(getUsersFilteredByCI.data).to.have.length(2)
        expect(getUsersFilteredByCI.data[0].display_name).toEqual('The Manic Edge')
        expect(getUsersFilteredByCI.data[1].display_name).toEqual('Segmented')
      })

      it(`should support the ${ACTION.INPUT_FIELD_QUERY_EXCLUDES} property`, async () => {
        // User
        const specUser = {
          modelName: 'User',
          fields: [
            { name: 'username', type: 'String' }
          ],
          defaultOrderBy: 'username'
        }

        // Project
        const specProject = {
          modelName: 'Project',
          defaultOrderBy: '-created_at',
          fields: [
            { name: 'status_code', type: 'Number' }
          ]
        }

        // Test with string values
        const usersFilteredByExcludes = {
          fields: {
            username: {
              excludes: ['admin', 'super-admin', 'segmented']
            }
          },
          orderBy: '-username'
        }

        // Test with number values
        const projectsFilteredByExcludes = {
          fields: {
            status_code: {
              excludes: [3, 5]
            }
          },
          orderBy: 'alias'
        }

        const getUsersFiltered = await projectApp.getItems(specUser, usersFilteredByExcludes, 'flat')
        expect(getUsersFiltered.data).to.have.length(8)

        const getProjectsFiltered = await projectApp.getItems(specProject, projectsFilteredByExcludes, 'flat')
        expect(getProjectsFiltered.data).to.have.length(4)
        expect(getProjectsFiltered.data[0].alias).toEqual('mega-seed-mini-sythesizer')
        expect(getProjectsFiltered.data[1].alias).toEqual('project-001')
        expect(getProjectsFiltered.data[2].alias).toEqual('project-006')
        expect(getProjectsFiltered.data[3].alias).toEqual('project-010')
      })
    })

    // TODO - Re-create these tests with the new syntax !!!

    //   it(`operator "${ACTION.INPUT_FIELD_MATCHING_STRATEGY_NOT_IN}" should NOT filter in a case-insensitive manner`, async () => {
    //     const specUser = {
    //       modelName: 'User',
    //       fields: [
    //         { name: 'display_name', type: 'String', operators: ['not_in'] }
    //       ]
    //     }

    //     const correctCaseResult = await blogApp.getItems(specUser, { fields: { 'display_name.not_in': ['Admin', 'Supa Admin'] } })
    //     const lowerCaseResult = await blogApp.getItems(specUser, { fields: { 'display_name.not_in': ['admin', 'supa admin'] } })
    //     const getAttrs = result => result.models.map(model => model.attributes)

    //     correctCaseResult.models.forEach((model) => {
    //       expect(model).to.have.nested.property('attributes.display_name')
    //         .that.does.not.match(/admin/i)
    //     })
    //     expect(correctCaseResult.models).to.have.length(9)

    //     expect(getAttrs(lowerCaseResult)).to.have.length(11)
    //   })
    // })

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'User'

      const spec = {
        modelName,
        defaultOrderBy: 'created_at'
      }

      const input = {
        loadDirect: ['roles:name'],
        associations: ['profiles'],
        paginate: { skip: 3, limit: 3 }
      }

      const globalLevel = blogAppJsonApi.getItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3)

          // Included...
          expect(payload).to.have.property('included')
          expect(payload.included[0]).to.contain({ type: 'Profile' })

          // Meta....
          expect(payload).to.have.property('meta')
          expect(payload.meta)
            .to.contain({
              total_items: 11,
              skip: 3,
              limit: 3
            })

          // First Item....
          const firstItem = payload.data[0]
          expect(firstItem)
            .to.contain({
              type: modelName,
              id: 4
            })

          expect(firstItem).to.have.property('attributes')
          expect(firstItem.attributes)
            .to.have.property('roles')
            .that.has.members(['admin', 'moderator', 'developer', 'blogger'])

          expect(firstItem).to.have.property('relationships')
          expect(firstItem.relationships).to.have.keys('profiles')
        })

      const methodLevel = blogApp.getItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3)

          // Included...
          expect(payload).to.have.property('included')
          expect(payload.included[0]).to.contain({ type: 'Profile' })

          // Meta....
          expect(payload).to.have.property('meta')
          expect(payload.meta)
            .to.contain({
              total_items: 11,
              skip: 3,
              limit: 3
            })

          // First Item....
          const firstItem = payload.data[0]
          expect(firstItem)
            .to.contain({
              type: modelName,
              id: 4
            })

          expect(firstItem).to.have.property('attributes')
          expect(firstItem.attributes)
            .to.have.property('roles')
            .that.has.members(['admin', 'moderator', 'developer', 'blogger'])

          expect(firstItem).to.have.property('relationships')
          expect(firstItem.relationships).to.have.keys('profiles')
        })

      return Promise.all([globalLevel, methodLevel])
    })
  }) // END - getItems
})
