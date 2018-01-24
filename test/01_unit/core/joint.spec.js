import chai from 'chai';
import express from 'express';
import Joint from '../../../src';
// import JointDist from '../../../dist/lib';
import appMgmtModels from '../../scenarios/app-mgmt/model-config';
import projectAppModels from '../../scenarios/project-app/model-config';
import projectAppMethods from '../../scenarios/project-app/method-config';
import projectAppRoutes from '../../scenarios/project-app/route-config';
import blogAppModels from '../../scenarios/blog-app/model-config';
import bookshelf from '../../db/bookshelf/service';

const expect = chai.expect;

// Values for expectation...
const jointProps = [
  'service',
  'serviceKey',
  'server',
  'serverKey',
  'output',
  'settings',
  'buildAuthBundle',
  'hasGenerated',
];
const actionsBookshelf = [
  'createItem',
  'upsertItem',
  'updateItem',
  'getItem',
  'getItems',
  'deleteItem',
  'addAssociatedItems',
  'hasAssociatedItem',
  'getAllAssociatedItems',
  'removeAssociatedItems',
  'removeAllAssociatedItems',
];
const modelNamesProjectApp = [
  'User',
  'UserInfo',
  'Project',
  'ProjectContributor',
  'CodingLanguageTag',
  'SoftwareTag',
  'TechConceptTag',
];
const methodNamesUser = [
  'createUser',
  'updateUser',
  'markLogin',
  'getUser',
  'getUsers',
  'deleteUser',
];

describe('JOINT', () => {
  // ------------------------------
  // Testing: general instantiation
  // ------------------------------
  describe('constructor (general)', () => {
    it('should throw an error when a service instance is not provided', () => {
      try {
        new Joint();
      }
      catch (error) {
        expect(error).to.have.keys('name', 'module', 'message');
        expect(error.name).to.equal('JointError');
        expect(error.message).to.equal('A service must be configured to use Joint.');
      }
    });

    it('should throw an error when an unrecognized or unsupported service is provided', () => {
      const fauxService = {
        version: '0.0.0',
        data: [],
        fauxLogic: () => {
          return null;
        },
      };

      try {
        new Joint({ service: fauxService });
      }
      catch (error) {
        expect(error).to.have.keys('name', 'module', 'message');
        expect(error.name).to.equal('JointError');
        expect(error.message).to.equal('The provided service is either not recognized or not supported by Joint.');
      }
    });

    // TODO: Move to a separate describe block (for bundled testing) !!!
    // it('should be bundled correctly for shared use', () => {
    //   const joint = new JointDist({
    //     service: bookshelf,
    //   });
    //   const keys = jointProps.concat(actionsBookshelf);
    //
    //   expect(joint).to.have.keys(keys);
    //   expect(joint.serviceKey).to.equal('bookshelf');
    // });
  }); // END - constructor

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
      const joint = new Joint({ service: bookshelf });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });

    it('should successfully register bookshelf models via model config', () => {
      const appMgmt = new Joint({ service: bookshelf });
      appMgmt.generate({ modelConfig: appMgmtModels, log: false });
      appMgmt.generate({ modelConfig: appMgmtModels, log: false }); // Run again to test redundant attempts !!!

      const projectApp = new Joint({ service: bookshelf });
      projectApp.generate({ modelConfig: projectAppModels, log: false });

      const blogApp = new Joint({ service: bookshelf });
      blogApp.generate({ modelConfig: blogAppModels, log: false });

      expect(appMgmt.info().models).to.have.length(3);
      expect(projectApp.info().models).to.have.length(14);
      expect(blogApp.info().models).to.have.length(6);
    });

    it('should successfully register custom methods via method config', () => {
      const projectApp = new Joint({ service: bookshelf });
      projectApp.generate({ methodConfig: projectAppMethods, log: false });

      expect(projectApp.method).to.have.keys(modelNamesProjectApp);
      expect(projectApp.method.User).to.have.keys(methodNamesUser);
    });
  }); // END - service:bookshelf

  // -----------------------------------------
  // Testing: server implementation => express
  // -----------------------------------------
  describe('server: express', () => {
    it('should recognize the express server instance', () => {
      const joint = new Joint({
        service: bookshelf,
        server: express,
      });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serverKey).to.equal('express');
    });

    it('should successfully build an express router via route config', () => {
      const projectApp = new Joint({
        service: bookshelf,
        server: express,
      });
      projectApp.generate({
        modelConfig: projectAppModels,
        methodConfig: projectAppMethods,
        routeConfig: projectAppRoutes,
        log: false,
      });

      expect(projectApp.info().api).to.equal(true);
    });
  }); // END - server:express
});
