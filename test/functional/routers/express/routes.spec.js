import { beforeAll, describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import Joint from '../../../../src'
import blogAppModels from '../../../scenarios/blog-app/model-config'
import blogAppMethods from '../../../scenarios/blog-app/method-config'
import blogAppRoutes from '../../../scenarios/blog-app/route-config'
import bookshelf from '../../../db/bookshelf/service'
import { resetDB } from '../../../db/bookshelf/db-utils'

let app
let blogApp = null

describe('CUSTOM ROUTER SIMULATION [express]', async () => {
  beforeAll(() => {
    // --------
    // Blog App
    // --------
    blogApp = new Joint({ service: bookshelf, server: express, output: 'json-api' })
    blogApp.generate({
      modelConfig: blogAppModels,
      methodConfig: blogAppMethods,
      routeConfig: blogAppRoutes,
      log: false
    })

    app = express()
    app.use(blogApp.router)
  })

  // ---------------------------------------------------------------------------
  // Resource: User
  // ---------------------------------------------------------------------------
  describe('User', () => {
    // -----------------
    // Route: GET /users
    // -----------------
    describe('GET /users', () => {
      beforeAll(() => resetDB(['users']))

      it('should return (200) with the requested collection of users', async () => {
        const response = await request(app)
          .get('/users')
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body).toMatchSnapshot()
      })

      it('should support paginated requests when the "skip" and "limit" parameters are used', async () => {
        const response = await request(app)
          .get('/users')
          .query('skip=0&limit=3')
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body).toMatchSnapshot()
      })
    }) // END - GET /users

    // --------------------
    // Route: GET /user/:id
    // --------------------
    describe('GET /user/:id', () => {
      beforeAll(() => resetDB(['users']))

      it('should return (200) with the requested user', async () => {
        const response = await request(app)
          .get('/user/1')
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body).toMatchSnapshot()
      })

      it('should return associations when the "with" parameter is used', async () => {
        const response = await request(app)
          .get('/user/6')
          .query('with=info')
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body.data).toMatchSnapshot()

        // Due to a bug with property matchers in array the snapshot tested must be done in a loop
        // https://github.com/jestjs/jest/issues/9079
        response.body.included.forEach((data) => {
          expect(data.attributes).toMatchSnapshot({
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        })

        expect.assertions(2)
      })

      it('should load association data directly to the base attributes when the "load" parameter is used', async () => {
        const response = await request(app)
          .get('/user/4')
          .query('load=info:professional_title')
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body).toMatchSnapshot()
      })
    }) // END - GET /user/:id
  }) // END - User
})
