import chai from 'chai';
import bookshelf from '../../db/bookshelf/bookshelf';
import * as CoreUtils from '../../../src/core/core-utils';

const expect = chai.expect;

// -----------------
// CORE (core-utils)
// -----------------
describe('CORE [core-utils]', () => {
  // ---------------------------------------
  // Testing: determineServiceKeyFromService
  // ---------------------------------------
  describe('determineServiceKeyFromService', () => {
    it('should return null when a service is not provided', () => {
      const service = null;
      expect(CoreUtils.determineServiceKeyFromService(service)).to.be.null;
    });

    it('should return null when an unrecognized service is provided', () => {
      const service = {
        version: '0.0.0',
        data: [],
        fauxLogic: () => {
          return null;
        },
      };
      expect(CoreUtils.determineServiceKeyFromService(service)).to.be.null;
    });

    it('should return "bookshelf" when the bookshelf service is provided', () => {
      const service = bookshelf;
      expect(CoreUtils.determineServiceKeyFromService(service)).to.equal('bookshelf');
    });
  });

  // ------------------------------
  // Testing: parseAssociationPath
  // ------------------------------
  describe('parseAssociationPath', () => {
    it('should return null when a "direct" path string cannot be parsed', () => {
      // Incomplete path (1 part)
      let path = 'User.id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Missing model/field (on part 2)
      path = 'profile_id => id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;
    });

    it('should return null when a "through" path string cannot be parsed', () => {
      // Incomplete path (3 parts)
      let path = 'profile_id => Profile.user_id => User.id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Invalid path (4+ parts)
      path = 'profile_id => Profile.id => Profile.user_id => User.id => User.username';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Missing model/field (on part 2)
      path = 'profile_id => id => Profile.user_id => User.id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Missing model/field (on part 3)
      path = 'profile_id => Profile.id => user_id => User.id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Missing model/field (on part 4)
      path = 'profile_id => Profile.id => Profile.user_id => id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;

      // Mis-mathing model names (from part 3 and 4)
      path = 'profile_id => Profile.id => Other.user_id => User.id';
      expect(CoreUtils.parseAssociationPath(path)).to.be.null;
    });

    it('should parse a valid "direct" path string', () => {
      // Expected format...
      const pathNoModelOnSource = 'profile_id => Profile.id';
      const infoNoModelOnSource = CoreUtils.parseAssociationPath(pathNoModelOnSource);

      // Source with model...
      const pathWithModelOnSource = 'Project.profile_id => Profile.id';
      const infoWithModelOnSource = CoreUtils.parseAssociationPath(pathWithModelOnSource);

      expect(infoNoModelOnSource).to.deep.equal(infoWithModelOnSource)
        .to.deep.equal({
          sourceField: 'profile_id',
          targetModelName: 'Profile',
          targetField: 'id',
        });
    });
  });
});
