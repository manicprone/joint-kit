import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Joint from '../../../../src'
import projectAppModels from '../../../scenarios/project-app/model-config'
import projectAppMethods from '../../../scenarios/project-app/method-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'
import { objectWithTimestamps } from '../../../utils'

let projectApp = null

// ---------------------------------
// BOOKSHELF ACTIONS (transactional)
// ---------------------------------
describe('TRANSACTIONAL ACTIONS [bookshelf]', () => {
  beforeAll(() => {
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
      expect(projectWithRefs.data.attributes).toMatchInlineSnapshot(objectWithTimestamps, `
        {
          "alias": "turn-myself-into-a-pickle",
          "brief_description": "Turn myself into a pickle.",
          "coding_language_tags": [
            {
              "id": 1,
              "key": "java",
            },
            {
              "id": 2,
              "key": "jsp",
            },
            {
              "id": 9,
              "key": "xslt",
            },
            {
              "id": 10,
              "key": "html",
            },
          ],
          "created_at": Any<Date>,
          "created_by": null,
          "finished_at": null,
          "full_description": null,
          "image_url": "https://everydayaboverubies.files.wordpress.com/2011/11/jar_of_pickles_cb101311.jpg",
          "is_internal": 1,
          "location": null,
          "name": "Turn Myself into a Pickle",
          "started_at": null,
          "status_code": 5,
          "updated_at": Any<Date>,
        }
      `)

      // Perform a transaction that will fail...
      await expect(
        projectApp.transaction(async (trx) => {
          // Detach 3 of 4 tags (explicitly)...
          const detachThree = {
            main: {
              fields: { id: projectID }
            },
            association: {
              fields: { key: ['java', 'xslt', 'jsp'] }
            },
            trx
          }
          const projectOneTag = await projectApp.method.Project.detachCodingLanguageTags(detachThree)

          // Ensure project is now associated to only 1 tag...
          expect(projectOneTag.data.relationships).toMatchInlineSnapshot(`
          {
            "coding_language_tags": {
              "data": [
                {
                  "id": 10,
                  "type": "CodingLanguageTag",
                },
              ],
            },
          }
        `)

          // Provide an invalid value, to force an error during tag detach...
          const detachInvalid = {
            main: {
              fields: { id: projectID }
            },
            association: {
              fields: { key: ['i-am-invalid'] }
            },
            trx
          }

          await projectApp.method.Project.detachCodingLanguageTags(detachInvalid)
        }) // end-transaction
      ).rejects.toMatchInlineSnapshot(`
        {
          "message": "No instances of "CodingLanguageTag" exist for the requested resource.",
          "name": "JointStatusError",
          "status": 404,
        }
      `)

      // Ensure changes were rolled-back (project still has the original 4 tags)...
      const getAllTags = { main: { fields: { id: projectID } } }
      const projectTags = await projectApp.method.Project.getAllCodingLanguageTags(getAllTags)
      expect(projectTags.data).toHaveLength(4)
    })

    it('should persist all changes, when the transaction completes', async () => {
      const projectID = 2 // Turn Myself into a Pickle
      projectApp.setOutput('json-api')

      // Ensure project is associated to 4 tags...
      const projectWithRefs = await projectApp.method.Project.getProjectWithAllRefs({ fields: { id: projectID } })
      expect(projectWithRefs.data.attributes.coding_language_tags).toHaveLength(4)

      // Perform a transaction that will succeed...
      await projectApp.transaction(async (trx) => {
        // Detach all tag associations...
        const input = {
          main: {
            fields: { id: projectID }
          },
          trx
        }
        const projectNoTags = await projectApp.method.Project.detachAllCodingLanguageTags(input)

        // Ensure project is now associated to 0 tags...
        expect(projectNoTags.data.relationships).toMatchInlineSnapshot(`
          {
            "coding_language_tags": {
              "data": [],
            },
          }
        `)

        // Now, delete the project...
        await projectApp.method.Project.deleteProject({ fields: { id: projectID }, trx })
      }) // end-transaction

      // Ensure project is gone...
      await expect(projectApp.method.Project.getProject({ fields: { id: projectID } }))
        .rejects
        .toMatchInlineSnapshot(`
        {
          "message": "The requested "Project" was not found.",
          "name": "JointStatusError",
          "status": 404,
        }
      `)
    })
  }) // END - programmatic usage
})
