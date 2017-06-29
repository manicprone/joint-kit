import chai from 'chai';
import Joint from '../../../src';
import modelConfig from '../../configs/models/model-config';
import methodConfig from '../../configs/methods/method-config';
import bookshelf from '../../db/bookshelf/bookshelf';

const expect = chai.expect;

// Values for expectation...
const jointProps = ['serviceKey', 'service'];
const actionsBookshelf = ['createItem', 'upsertItem', 'updateItem', 'getItem', 'getItems'];

// -------------
// LIBRARY Joint
// -------------
describe('JOINT', () => {
  // ------------------------------
  // Testing: general instantiation
  // ------------------------------
  describe('constructor (general)', () => {
    it.skip('should throw an error when a service instance is not provided', () => {
      expect(new Joint()).to.throw();
    });

    it.skip('should throw an error when an invalid serviceKey is provided', () => {
      const joint = new Joint({
        serviceKey: 'alien',
        service: bookshelf,
      });

      expect(joint).to.have.keys(jointProps);
      expect(joint.serviceKey).to.equal('alien');
    });

    it('should default to "bookshelf" when a serviceKey is not provided', () => {
      const joint = new Joint({
        service: bookshelf,
      });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });
  });

  // ---------------------------------
  // Testing: bookshelf implementation
  // ---------------------------------
  describe('bookshelf service', () => {
    it('should load all implemented bookshelf actions', () => {
      const joint = new Joint({
        serviceKey: 'bookshelf',
        service: bookshelf,
      });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });

    it('should successfully register bookshelf models via model-config', () => {
      const joint = new Joint({
        serviceKey: 'bookshelf',
        service: bookshelf,
      });
      joint.generate({ modelConfig, log: false });

      const info = joint.info();

      expect(info.models).to.have.length(10);
    });

    it('should successfully register custom methods via method-config', () => {
      const joint = new Joint({
        serviceKey: 'bookshelf',
        service: bookshelf,
      });
      joint.generate({ methodConfig, log: false });

      const info = joint.info();

      expect(info.methods).to.not.be.empty;
    });
  });
});
