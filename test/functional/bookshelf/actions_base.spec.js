import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
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
    before(() => resetDB(['users']));

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

      // createItem
      // const createItemAction = expect(joint.createItem(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // getItem
      // const getItemAction = expect(joint.getItem(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // getItems
      // const getItemsAction = expect(joint.getItems(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // updateItem
      // const updateItemAction = expect(joint.updateItem(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // upsertItem
      const upsertItemAction = expect(joint.upsertItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // deleteItem
      // const deleteItemAction = expect(joint.deleteItem(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        // createItemAction,
        // getItemAction,
        // getItemsAction,
        // updateItemAction,
        upsertItemAction,
        // deleteItemAction,
      ]);
    });
  }); // END - standard error scenarios

});
