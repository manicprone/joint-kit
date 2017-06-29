import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import modelConfig from '../../configs/models/model-config';
import methodConfig from '../../configs/methods/method-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

let joint = null;

describe('CUSTOM METHOD SIMULATION [bookshelf]', () => {
  before(() => {
    joint = new Joint({
      serviceKey: 'bookshelf',
      service: bookshelf,
    });
    joint.generate({ modelConfig, methodConfig, log: false });
  });

  // -------------------
  // Testing: upsertItem
  // -------------------
  describe('upsertItem', () => {
    before(() => resetDB());

    it('should return an error (400) when the "app_id" and "data" fields are not provided', () => {
      // const data = { appContent: { a: true, b: 'testMe', c: { deep: 1000 } } };
      const input = {};

      return expect(joint.method.AppContent.saveContent(input))
        .to.be.rejected
        .and.eventually.have.keys('name', 'status', 'message')
        .and.has.property('status', 400);
    });
  }); // END - upsertItem

});
