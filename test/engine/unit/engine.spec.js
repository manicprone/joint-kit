import chai from 'chai';
import JointEngine from '../../../src/engine';

const expect = chai.expect;

// ------------------
// ENGINE JointEngine
// ------------------
describe('ENGINE [JointEngine]', () => {
  // --------------------
  // Testing: constructor
  // --------------------
  describe('constructor', () => {
    it('should do its thing', () => {
      const engine = new JointEngine({});

      expect(engine.isRunning).to.be.false;
    });
  });
});
