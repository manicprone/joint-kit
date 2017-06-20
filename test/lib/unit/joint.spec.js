import chai from 'chai';
import Joint from '../../../src/lib';

const expect = chai.expect;

// Values for expectation...
const jointProps = ['serviceKey'];
const actionsBookshelf = ['upsertItem'];

// -------------
// LIBRARY Joint
// -------------
describe('LIBRARY [Joint]', () => {
  // ------------------------------
  // Testing: general functionality
  // ------------------------------
  describe('(general)', () => {
    it('should default to "bookshelf" when a serviceKey is not provided', () => {
      const joint = new Joint();
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });

    it('should fail safe when an invalid serviceKey is provided', () => {
      const joint = new Joint({ serviceKey: 'alien' });

      expect(joint).to.have.keys(jointProps);
      expect(joint.serviceKey).to.equal('alien');
    });
  });

  // ------------------
  // Testing: bookshelf
  // ------------------
  describe('bookshelf', () => {
    it('should load all implemented "bookshelf" actions', () => {
      const joint = new Joint({ serviceKey: 'bookshelf' });
      const keys = jointProps.concat(actionsBookshelf);

      expect(joint).to.have.keys(keys);
      expect(joint.serviceKey).to.equal('bookshelf');
    });
  });
});
