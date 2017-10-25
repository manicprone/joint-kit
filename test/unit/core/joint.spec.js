import chai from 'chai';
import express from 'express';
import Joint from '../../../src';
// import JointDist from '../../../dist/lib';
import modelConfig from '../../configs/model-config';
import methodConfig from '../../configs/method-config';
import routeConfig from '../../configs/route-config';
import bookshelf from '../../db/bookshelf/bookshelf';

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

  // --------------------------------------------
  // Testing: service implementation => bookshelf
  // --------------------------------------------
  describe('service: bookshelf', () => {
    it('should load all implemented bookshelf actions', () => {
      const joint = new Joint({
        service: bookshelf,
      });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });

    it('should successfully register bookshelf models via model-config', () => {
      const joint = new Joint({
        service: bookshelf,
      });
      joint.generate({ modelConfig, log: false });

      const info = joint.info();

      expect(info.models).to.have.length(11);
    });

    it('should successfully register custom methods via method-config', () => {
      const joint = new Joint({
        service: bookshelf,
      });
      joint.generate({ methodConfig, log: false });

      const info = joint.info();

      expect(info.methods).to.not.be.empty;
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

    it('should successfully build an express router via route-config', () => {
      const joint = new Joint({
        service: bookshelf,
        server: express,
      });
      joint.generate({ modelConfig, methodConfig, routeConfig, log: false });

      const info = joint.info();

      expect(info.api).to.equal(true);
    });
  }); // END - server:express
});
