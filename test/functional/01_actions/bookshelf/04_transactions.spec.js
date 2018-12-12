import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import projectAppMethods from '../../../scenarios/project-app/method-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import chaiHelpers from '../../chai-helpers'

chai.use(chaiAsPromised)
chai.use(chaiHelpers)
const expect = chai.expect

let projectApp = null

// ---------------------------------
// BOOKSHELF ACTIONS (transactional)
// ---------------------------------
describe.skip('TRANSACTIONAL ACTIONS [bookshelf]', () => {
  before(() => {
    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf })
    projectApp.generate({ modelConfig: projectAppModels, methodConfig: projectAppMethods, log: false })
  })

  describe('programmatic usage', () => {
    beforeEach(() => resetDB(['profiles', 'projects', 'tags']))

    it('should rollback all changes, if a transaction does not complete', async () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      // Ensure project is associated to 4 tags...
      const projectWithRefs = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID } })
      const tagKeys = projectWithRefs.data.attributes.coding_language_tags.map(tag => tag.key)
      console.log('[DEVING] projectWithRefs tags =>', tagKeys)
      expect(projectWithRefs.data.attributes.coding_language_tags).to.have.length(4)

      // Prepare a transaction that will fail...
      projectApp.service.transaction(async (trx) => {
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
          console.log('[DEVING] projectOneTag =>', projectOneTag.data.relationships.coding_language_tags.data)
          expect(projectOneTag.data.relationships.coding_language_tags.data).to.have.length(1)

          trx.commit()
          // Provide an invalid value, to force an error during tag detach...
          // const detachInvalid = {
          //   main: {
          //     fields: { id: projectID },
          //   },
          //   association: {
          //     fields: { key: ['i-am-invalid'] },
          //   },
          //   trx,
          // }
          /*
          return projectApp.method.Project.detachCodingLanguageTags(detachInvalid)
            .catch((error) => {
              // console.log('[DEVING] verifying error =>', error)
              // trx.rollback()
              expect(error.name).to.equal('JointStatusError')
              expect(error.status).to.equal(404)
            })
          */
          // await projectApp.method.Project.detachCodingLanguageTags(detachInvalid)
        } catch (error) {
          // console.log('[DEVING] verifying error =>', error)
          trx.rollback()
          expect(error.name).to.equal('JointStatusError')
          expect(error.status).to.equal(404)
        }
      }) // end-transaction

      // Ensure changes were rolled-back (project still has 4 tags)...
      const getAllTags = { main: { fields: { id: projectID } } }
      const projectTags = await projectApp.method.Project.getAllCodingLanguageTags(getAllTags)
      console.log('[DEVING] project tags =>', projectTags.data)
      expect(projectTags.data).to.have.length(4)
    })

    it.skip('should rollback all changes, if a transaction does not complete', async () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      // Prepare a transaction that will fail...
      const trxFailed = projectApp.service.transaction(async (trx) => {
        const payload = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID }, trx })

        // Ensure project is associated to 4 tags...
        const tagKeys = payload.data.attributes.coding_language_tags.map(tag => tag.key)
        console.log('[DEVING] payload tags =>', tagKeys)
        expect(payload.data.attributes.coding_language_tags).to.have.length(4)

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
        console.log('[DEVING] projectOneTag =>', projectOneTag.data.relationships.coding_language_tags.data)
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
        // return projectApp.method.Project.detachCodingLanguageTags(detachInvalid)
          // .catch((error) => {
          //   // console.log('[DEVING] verifying error =>', error)
          //   // trx.rollback()
          //   expect(error.name).to.equal('JointStatusError')
          //   expect(error.status).to.equal(404)
          // })

        try {
          await projectApp.method.Project.detachCodingLanguageTags(detachInvalid)
        } catch (error) {
          // console.log('[DEVING] verifying error =>', error)
          trx.rollback()
          expect(error.name).to.equal('JointStatusError')
          expect(error.status).to.equal(404)
        }
      }) // end-transaction

      // Execute failed transaction, then verify rollback...
      await trxFailed

      // Ensure changes were rolled-back (project still has 4 tags)...
      const getAllTags = { main: { fields: { id: projectID } } }
      const projectTags = await projectApp.method.Project.getAllCodingLanguageTags(getAllTags)
      console.log('[DEVING] project tags =>', projectTags.data)
      expect(projectTags.data).to.have.length(4)
    })

    it.skip('should persist all changes, when the transaction completes', () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      return projectApp.service.transaction(async (trx) => {
        const payload = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID }, trx })

        // Ensure project is associated to 4 tags...
        const tagKeys = payload.data.attributes.coding_language_tags.map(tag => tag.key)
        console.log('[DEVING] payload tags =>', tagKeys)
        expect(payload.data.attributes.coding_language_tags).to.have.length(4)

        // Detach all tag associations (explicitly)...
        const input = {
          main: {
            fields: { id: projectID },
          },
          association: {
            fields: { key: ['java', 'xslt', 'jsp', 'html'] },
          },
          trx,
        }
        const projectNoTags = await projectApp.method.Project.detachCodingLanguageTags(input)

        // Ensure project is associated to 0 tags...
        console.log('[DEVING] projectNoTags =>', projectNoTags.data.relationships.coding_language_tags.data)
        expect(projectNoTags.data.relationships.coding_language_tags.data).to.have.length(0)

        // Now, delete the project...
        await projectApp.method.Project.deleteProject({ fields: { id: projectID }, trx })

        // Ensure project is gone...
        try {
          await projectApp.method.Project.getProject({ fields: { id: projectID }, trx })
        } catch (error) {
          // console.log('[DEVING] verifying error =>', error)
          expect(error.name).to.equal('JointStatusError')
          expect(error.status).to.equal(404)
        }
      }) // end-transaction
    })

  }) // END - programmatic usage
})
