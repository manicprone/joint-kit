import { describe, expect, it } from 'vitest'
import { keys } from 'lodash/fp'
import express from 'express'
import Joint from '../../src'
import JointDist from '../../dist/lib'
import appMgmtModels from '../scenarios/app-mgmt/model-config'
import projectAppModels from '../scenarios/project-app/model-config'
import projectAppMethods from '../scenarios/project-app/method-config'
import projectAppRoutes from '../scenarios/project-app/route-config'
import blogAppModels from '../scenarios/blog-app/model-config'
import bookshelf from '../db/bookshelf/service'

describe('JOINT', () => {
  // ------------------------------
  // Testing: general instantiation
  // ------------------------------
  describe('constructor (general)', () => {
    it('should throw an error when a service instance is not provided', () => {
      expect(() => new Joint())
        .toThrowErrorMatchingInlineSnapshot('[JointError: A service must be configured to use Joint.]')
    })

    it('should throw an error when an unrecognized or unsupported service is provided', () => {
      const fauxService = {
        version: '0.0.0',
        data: [],
        fauxLogic: () => {
          return null
        },
      }

      expect(() => new Joint({ service: fauxService }))
        .toThrowErrorMatchingInlineSnapshot('[JointError: The provided service is either not recognized or not supported by Joint.]')
    })

    it('should be bundled correctly for shared use', async () => {
      const joint = new JointDist({ service: bookshelf })

      expect(joint.getItems({ modelName: 'DurianCandy' }, {})).rejects
        .toThrowErrorMatchingInlineSnapshot('[JointStatusError: The model "DurianCandy" is not recognized.]')
    })
  }) // END - constructor

  // ---------------------------------------------------------------------------
  // TODO: joint.generate permutations to test !!!
  // ---------------------------------------------------------------------------
  // No params or empty object  => Will load natively defined models from
  //                               the service (on first invocation only).
  //
  // Combined model scenario    => Existing models on service and modelConfig
  //                               (on first invocation).
  //
  // Continuous invocations     => Will add only new model config defs.
  // ---------------------------------------------------------------------------

  // --------------------------------------------
  // Testing: service implementation => bookshelf
  // --------------------------------------------
  describe('service: bookshelf', () => {
    it('should load all implemented bookshelf actions', () => {
      const joint = new Joint({ service: bookshelf })

      expect(keys(joint)).toMatchInlineSnapshot(`
        [
          "service",
          "serviceKey",
          "server",
          "serverKey",
          "output",
          "settings",
          "hasGenerated",
          "prepareAuthContext",
          "transaction",
          "createItem",
          "upsertItem",
          "updateItem",
          "getItem",
          "getItems",
          "deleteItem",
          "addAssociatedItems",
          "hasAssociatedItem",
          "getAllAssociatedItems",
          "removeAssociatedItems",
          "removeAllAssociatedItems",
        ]
      `)

      expect(joint.serviceKey).toBe('bookshelf')
    })

    // TODO - Fix the error handling here !!! This is a common issue that needs to be clear to the developer !!!
    // it('should return an error (400) when the model config associations are invalid', () => {
    // })

    it('should successfully register bookshelf models via model config', () => {
      const appMgmt = new Joint({ service: bookshelf })
      appMgmt.generate({ modelConfig: appMgmtModels, log: false })
      appMgmt.generate({ modelConfig: appMgmtModels, log: false }) // Run again to test redundant attempts !!!

      const projectApp = new Joint({ service: bookshelf })
      projectApp.generate({ modelConfig: projectAppModels, log: false })

      const blogApp = new Joint({ service: bookshelf })
      blogApp.generate({ modelConfig: blogAppModels, log: false })

      expect(appMgmt.info().models).toHaveLength(3)
      expect(projectApp.info().models).toHaveLength(14)
      expect(blogApp.info().models).toHaveLength(6)
    })

    it('should successfully register custom methods via method config', () => {
      const projectApp = new Joint({ service: bookshelf })
      projectApp.generate({ methodConfig: projectAppMethods, log: false })

      expect(keys(projectApp.method)).toMatchInlineSnapshot(`
        [
          "User",
          "UserInfo",
          "Project",
          "ProjectContributor",
          "CodingLanguageTag",
          "SoftwareTag",
          "TechConceptTag",
        ]
      `)
      expect(keys(projectApp.method.User)).toMatchInlineSnapshot(`
        [
          "createUser",
          "updateUser",
          "markLogin",
          "getUser",
          "getUsers",
          "deleteUser",
        ]
      `)
    })
  }) // END - service:bookshelf

  // -----------------------------------------
  // Testing: server implementation => express
  // -----------------------------------------
  describe('server: express', () => {
    it('should recognize the express server instance', () => {
      const joint = new Joint({
        service: bookshelf,
        server: express,
      })

      expect(joint.serverKey).toBe('express')
    })

    it('should successfully build an express router via route config', () => {
      const projectApp = new Joint({
        service: bookshelf,
        server: express,
      })
      projectApp.generate({
        modelConfig: projectAppModels,
        methodConfig: projectAppMethods,
        routeConfig: projectAppRoutes,
        log: false,
      })

      expect(projectApp.info().api).toBe(true)
    })
  }) // END - server:express
})
