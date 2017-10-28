import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import Joint from '../../../src';
import blogAppModels from '../../scenarios/blog-app/model-config';
import blogAppMethods from '../../scenarios/blog-app/method-config';
import blogAppRoutes from '../../scenarios/blog-app/route-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.use(chaiHelpers);

const apiBasePath = '/api/express';
const apiPort = 9999;
const apiURL = `http://localhost:${apiPort}${apiBasePath}`;

let blogApp = null;

describe('CUSTOM ROUTER SIMULATION [express]', () => {
  before(() => {
    // --------
    // Blog App
    // --------
    blogApp = new Joint({ service: bookshelf, server: express, output: 'json-api' });
    blogApp.generate({
      modelConfig: blogAppModels,
      methodConfig: blogAppMethods,
      routeConfig: blogAppRoutes,
      log: false,
    });

    // Run express server with configured router...
    const app = express();
    app.use(apiBasePath, blogApp.router);
    app.listen(apiPort);
  });

  // ---------------------------------------------------------------------------
  // Resource: User
  // ---------------------------------------------------------------------------
  describe('User', () => {

    // -----------------
    // Route: GET /users
    // -----------------
    describe('GET /users', () => {
      before(() => resetDB(['users']));

      it('should return (200) with the requested collection of users', () => {
        const resourceURI = '/users';

        return chai.request(apiURL).get(resourceURI)
          .then((res) => {
            const resBody = res.body;
            const data = resBody.data;
            const meta = resBody.meta;

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data', 'meta']);

            expect(data).to.have.length(10);
            expect(meta).to.have.keys(['total_items']);
            expect(meta).to.contain({
              total_items: 10,
            });

            const firstItem = data[0];
            expect(firstItem).to.have.property('attributes');
            expect(firstItem).to.contain({
              type: 'User',
              id: 2,
            });
          });
      });

      it('should support paginated requests when the "skip" and "limit" parameters are used', () => {
        const skip = 0;
        const limit = 3;
        const resourceURI = '/users';
        const queryString = `skip=${skip}&limit=${limit}`;

        return chai.request(apiURL).get(resourceURI).query(queryString)
          .then((res) => {
            const resBody = res.body;
            const data = resBody.data;
            const meta = resBody.meta;

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data', 'meta']);

            expect(data).to.have.length(limit);
            expect(meta).to.have.keys(['total_items', 'skip', 'limit']);
            expect(meta).to.contain({
              total_items: 10,
              skip,
              limit,
            });
          });
      });
    }); // END - GET /users

    // --------------------
    // Route: GET /user/:id
    // --------------------
    describe('GET /user/:id', () => {
      before(() => resetDB(['users']));

      it('should return (200) with the requested user', () => {
        const userID = 1;
        const resourceURI = `/user/${userID}`;

        return chai.request(apiURL).get(resourceURI)
          .then((res) => {
            const resBody = res.body;
            const data = resBody.data;

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data']);
            expect(data).to.contain({
              type: 'User',
              id: userID,
            });
            expect(data.attributes).to.contain({
              display_name: 'Supa Admin',
              username: 'super-admin',
            });
          });
      });

      it('should return associations when the "with" parameter is used', () => {
        const userID = 6;
        const assocName = 'info';
        const resourceURI = `/user/${userID}`;
        const queryString = `with=${assocName}`;

        return chai.request(apiURL).get(resourceURI).query(queryString)
          .then((res) => {
            const resBody = res.body;
            const data = resBody.data;

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data', 'included']);
            expect(data).to.contain({
              type: 'User',
              id: userID,
            });
            expect(data.attributes).to.contain({
              username: 'ricksanchez',
            });
            expect(data.relationships).to.have.keys([assocName]);
          });
      });

      it('should load association data directly to the base attributes when the "load" parameter is used', () => {
        const userID = 4;
        const assocName = 'info';
        const assocField = 'professional_title';
        const resourceURI = `/user/${userID}`;
        const queryString = `load=${assocName}:${assocField}`;

        return chai.request(apiURL).get(resourceURI).query(queryString)
          .then((res) => {
            const resBody = res.body;
            const data = resBody.data;

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data']);

            expect(data).to.contain({
              type: 'User',
              id: userID,
            });

            expect(data.attributes)
              .to.contain({
                info: 'EdgeCaser',
              });
          });
      });
    }); // END - GET /user/:id

  }); // END - User
});
