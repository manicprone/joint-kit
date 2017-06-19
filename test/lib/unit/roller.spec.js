import chai from 'chai';
import JointRoller from '../../../src/lib';

const expect = chai.expect;

// Values for expectation...
const rollerProps = ['serviceKey'];
const actionsBookshelf = ['upsertItem'];

let roller = null;

// -------------------
// LIBRARY JointRoller
// -------------------
describe('LIBRARY [JointRoller]', () => {
  // ------------------------------
  // Testing: general functionality
  // ------------------------------
  describe('(general)', () => {
    it('should default to "bookshelf" when a serviceKey is not provided', () => {
      roller = new JointRoller();
      const keys = rollerProps.concat(actionsBookshelf);

      expect(roller).to.have.keys(keys);
      expect(roller.serviceKey).to.equal('bookshelf');
    });

    it('should fail safe when an invalid serviceKey is provided', () => {
      roller = new JointRoller({ serviceKey: 'alien' });

      expect(roller).to.have.keys(rollerProps);
      expect(roller.serviceKey).to.equal('alien');
    });
  });

  // ------------------
  // Testing: bookshelf
  // ------------------
  describe('bookshelf', () => {
    before(() => {
      roller = new JointRoller({ serviceKey: 'bookshelf' });
    });

    it('should load all implemented "bookshelf" actions', () => {
      const keys = rollerProps.concat(actionsBookshelf);

      expect(roller).to.have.keys(keys);
      expect(roller.serviceKey).to.equal('bookshelf');
    });
  });
});
