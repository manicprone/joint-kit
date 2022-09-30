import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import projectAppMethods from '../../../scenarios/project-app/method-config'

const chai = require('chai')
const expect = require('chai').expect
const chaiAsPromised = require('chai-as-promised')
const bookshelf = require('../../../db/bookshelf/service')
const { resetDB, closeDB } = require('../../../db/bookshelf/db-utils')

chai.use(chaiAsPromised)

let projectApp = null

// ---------------------------------
// BOOKSHELF ACTIONS (transactional)
// ---------------------------------
describe('TRANSACTIONAL ACTIONS [bookshelf]', () => {
  before(() => {
    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf })
    projectApp.generate({ modelConfig: projectAppModels, methodConfig: projectAppMethods, log: false })
  })

  after(() => {
    closeDB() // close DB connection
  })

  describe('programmatic usage', () => {
    beforeEach(() => resetDB(['profiles', 'projects', 'tags']))

    it('should rollback all changes, if a transaction does not complete', async () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      // Ensure project is associated to 4 tags...
      const projectWithRefs = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID } })
      expect(projectWithRefs.data.attributes.coding_language_tags).to.have.length(4)

      // Perform a transaction that will fail...
      projectApp.transaction(async (trx) => {
        try {
          // Detach 3 of 4 tags (explicitly)...
          const detachThree = {
            main: {
              fields: { id: projectID },
            },
            association: {
              fields: { key: ['java', 'xslt', 'jsp'] },
            },
            trx,
          }
          const projectOneTag = await projectApp.method.Project.detachCodingLanguageTags(detachThree)

          // Ensure project is now associated to only 1 tag...
          expect(projectOneTag.data.relationships.coding_language_tags.data).to.have.length(1)

          // Provide an invalid value, to force an error during tag detach...
          const detachInvalid = {
            main: {
              fields: { id: projectID },
            },
            association: {
              fields: { key: ['i-am-invalid'] },
            },
            trx,
          }
          await projectApp.method.Project.detachCodingLanguageTags(detachInvalid)

        } catch (error) {
          throw error
        }
      }) // end-transaction
      .catch((error) => {
        // console.log('[DEVING] verifying error =>', error)
        expect(error.name).to.equal('JointStatusError')
        expect(error.status).to.equal(404)
      })

      // Ensure changes were rolled-back (project still has the original 4 tags)...
      const getAllTags = { main: { fields: { id: projectID } } }
      const projectTags = await projectApp.method.Project.getAllCodingLanguageTags(getAllTags)
      expect(projectTags.data).to.have.length(4)
    })

    it('should persist all changes, when the transaction completes', async () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      // Ensure project is associated to 4 tags...
      const projectWithRefs = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID } })
      expect(projectWithRefs.data.attributes.coding_language_tags).to.have.length(4)

      // Perform a transaction that will succeed...
      projectApp.transaction(async (trx) => {
        // Detach all tag associations...
        const input = {
          main: {
            fields: { id: projectID },
          },
          trx,
        }
        const projectNoTags = await projectApp.method.Project.detachAllCodingLanguageTags(input)

        // Ensure project is now associated to 0 tags...
        expect(projectNoTags.data.relationships.coding_language_tags.data).to.have.length(0)

        // Now, delete the project...
        await projectApp.method.Project.deleteProject({ fields: { id: projectID }, trx })
      }) // end-transaction

      // Ensure project is gone...
      try {
        await projectApp.method.Project.getProject({ fields: { id: projectID } })
      } catch (error) {
        expect(error.name).to.equal('JointStatusError')
        expect(error.status).to.equal(404)
      }
    })
  }) // END - programmatic usage

})
