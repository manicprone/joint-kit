import chai from 'chai';
import * as BookshelfUtils from '../../../../src/lib/bookshelf/bookshelf-utils';

const expect = chai.expect;

// -----------------------
// LIBRARY bookshelf-utils
// -----------------------
describe('LIBRARY [bookshelf-utils]', function () {
  // ---------------------
  // Testing: buildOrderBy
  // ---------------------
  describe('buildOrderBy', function () {
    it('should return an empty array if no value is provided', function () {
      const orderBy = BookshelfUtils.buildOrderBy();

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(0);
    });

    it('should return the Bookshelf-compatible spec for a single order value (positive/ascending)', function () {
      const fieldValue = 'title';
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue);

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(1);

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'asc',
        });
    });

    it('should return the Bookshelf-compatible spec for a single order value (negative/descending)', function () {
      const fieldValue = '-title';
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue);

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(1);

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        });
    });

    it('should return the Bookshelf-compatible spec for multiple values (comma-delimited)', function () {
      const fieldValue = '-title,updated_at,status_id';
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue);

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(3);

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        });
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'asc',
        });
      expect(orderBy[2])
        .to.contain({
          col: 'status_id',
          order: 'asc',
        });
    });

    it('should handle extraneous spaces between values', function () {
      const fieldValue = ' -title, updated_at  ,    status_id';
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue);

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(3);

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'desc',
        });
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'asc',
        });
      expect(orderBy[2])
        .to.contain({
          col: 'status_id',
          order: 'asc',
        });
    });

    it('should handle empty values within commas', function () {
      const fieldValue = 'title,  ,   -updated_at  , ,';
      const orderBy = BookshelfUtils.buildOrderBy(fieldValue);

      expect(orderBy)
        .to.be.an('array')
        .and.to.have.length(2);

      expect(orderBy[0])
        .to.contain({
          col: 'title',
          order: 'asc',
        });
      expect(orderBy[1])
        .to.contain({
          col: 'updated_at',
          order: 'desc',
        });
    });
  }); // END - buildOrderBy
});
