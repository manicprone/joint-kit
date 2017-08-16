import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import Joint from '../../../src';
import modelConfig from '../../configs/model-config';
import methodConfig from '../../configs/method-config';
import routeConfig from '../../configs/route-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.use(chaiHelpers);

const apiBasePath = '/api/express';
const apiPort = 9999;
const apiURL = `http://localhost:${apiPort}${apiBasePath}`;

let joint = null;

describe('CUSTOM ROUTER SIMULATION [express]', () => {
  before(() => {
    joint = new Joint({
      service: bookshelf,
      server: express,
      output: 'json-api',
    });
    joint.generate({ modelConfig, methodConfig, routeConfig, log: false });

    // Run express server with configured router...
    const app = express();
    app.use(apiBasePath, joint.router);
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

            expect(res).to.have.status(200);
            expect(resBody).to.have.keys(['data', 'meta']);
            expect(data).to.have.length(10);

            const firstItem = data[0];
            expect(firstItem).to.have.property('attributes');
            expect(firstItem).to.contain({
              type: 'User',
              id: 2,
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
              external_id: '301',
              username: 'super-admin',
            });
          });
      });
    }); // END - GET /users

  }); // END - User
});
