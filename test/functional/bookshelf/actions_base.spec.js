import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const joint = new Joint({
  serviceKey: 'bookshelf',
  service: bookshelf,
});

// ------------------------
// BOOKSHELF ACTIONS (base)
// ------------------------
describe('BASE ACTIONS [bookshelf]', () => {

  // ---------------------------------
  // Testing: standard error scenarios
  // ---------------------------------
  describe('standard error scenarios (create, getItem, getItems, updateItem, upsertItem, deleteItem)', () => {
    before(() => resetDB());

    it('should return an error (400) when the specified model does not exist', () => {
      const spec = {
        modelName: 'Alien',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'Number', requiredOr: true },
        ],
      };
      const input = {
        fields: {
          id: 1,
        },
      };

      // upsertItem
      const upsertItemAction = expect(joint.upsertItem(spec, input))
        .to.be.rejected
        .and.eventually.have.keys('name', 'status', 'message')
        .and.has.property('status', 400);

      return Promise.all([
        upsertItemAction,
      ]);
    });
  }); // END - standard error scenarios

});
