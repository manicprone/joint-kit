import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import bookshelf from '../../../../../src/services/bookshelf';
import modelConfig from '../../../../../src/engine/models/model-config';
import methodConfig from '../../../../../src/engine/methods/method-config';
import JointEngine from '../../../../../src/engine';
import { resetDB } from '../../../../test-db-utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const Joint = new JointEngine({
  serviceKey: 'bookshelf',
  service: bookshelf,
  modelConfig,
  methodConfig,
});
Joint.start({ logStart: false, logRegister: false });

// console.log('[ ----- Joint --------------------------------------------- ]');
// console.log(Joint.info());
// console.log('[ --------------------------------------------------------- ]');

describe('ENGINE METHODS [AppContent]', () => {
  // -------------------------------
  // Testing: saveContent action...
  // -------------------------------
  describe('saveContent', () => {
    before(() => resetDB());

    it('should return an error (400) when the "app_id" and "data" fields are not provided', () => {
      // const data = { appContent: { a: true, b: 'testMe', c: { deep: 1000 } } };
      const input = {};

      return expect(Joint.method.AppContent.saveContent(input))
        .to.be.rejected
        .and.eventually.have.keys('name', 'status', 'message')
        .and.has.property('status', 400);
    });
  }); // END - saveContent

});
