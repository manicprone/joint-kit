import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import modelConfig from '../../configs/models/model-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let joint = null;

// --------------------------------
// BOOKSHELF ACTIONS (associations)
// --------------------------------
describe('ASSOCIATION ACTIONS [bookshelf]', () => {
  before(() => {
    joint = new Joint({
      serviceKey: 'bookshelf',
      service: bookshelf,
    });
    joint.generate({ modelConfig, log: false });
  });

  // ---------------------------------
  // Testing: standard error scenarios
  // ---------------------------------
  describe('standard error scenarios (addAssociatedItem, hasAssociatedItem)', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should return an error (400) when the spec and input cannot be parsed for association actions', () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const specMissingMain = {
        notMain: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const specMissingAssoc = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        notAssoc: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };

      const input = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };
      const inputMissingMain = {
        noMain: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };
      const inputMissingAssoc = {
        main: {
          fields: {
            id: 1,
          },
        },
        noAssociation: {
          fields: {
            id: 1,
          },
        },
      };

      // addAssociatedItem
      const addAssociatedItem01 = expect(joint.addAssociatedItem(specMissingMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItem02 = expect(joint.addAssociatedItem(specMissingAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItem03 = expect(joint.addAssociatedItem(spec, inputMissingMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItem04 = expect(joint.addAssociatedItem(spec, inputMissingAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(specMissingMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(specMissingAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem03 = expect(joint.hasAssociatedItem(spec, inputMissingMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem04 = expect(joint.hasAssociatedItem(spec, inputMissingAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItem01,
        addAssociatedItem02,
        addAssociatedItem03,
        addAssociatedItem04,
        hasAssociatedItem01,
        hasAssociatedItem02,
        hasAssociatedItem03,
        hasAssociatedItem04,
      ]);
    });

    it('should return an error (400) when the specified main or associated models do not exist', () => {
      const specNoMain = {
        main: {
          modelName: 'AlienProject',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const specNoAssoc = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'AlienTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const input = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };

      // addAssociatedItem
      const addAssociatedItem01 = expect(joint.addAssociatedItem(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItem02 = expect(joint.addAssociatedItem(specNoAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(specNoAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItem01,
        addAssociatedItem02,
        hasAssociatedItem01,
        hasAssociatedItem02,
      ]);
    });

    it('should return an error (404) when the requested main or association resources are not found', () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const inputNoMain = {
        main: {
          fields: {
            id: 999,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };
      const inputNoAssoc = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            id: 999,
          },
        },
      };

      // addAssociatedItem
      const addAssociatedItem01 = expect(joint.addAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);
      const addAssociatedItem02 = expect(joint.addAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(404);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(404);

      return Promise.all([
        addAssociatedItem01,
        addAssociatedItem02,
        hasAssociatedItem01,
        hasAssociatedItem02,
      ]);
    });

    it('should return an error (400) when a required field is not provided', () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const inputNoMain = {
        main: {
          fields: {
            identifier: 1,
          },
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };
      const inputNoAssoc = {
        main: {
          fields: {
            id: 1,
          },
        },
        association: {
          fields: {
            identifier: 1,
          },
        },
      };

      // addAssociatedItem
      const addAssociatedItem01 = expect(joint.addAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItem02 = expect(joint.addAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItem01,
        addAssociatedItem02,
        hasAssociatedItem01,
        hasAssociatedItem02,
      ]);
    });

    it('should return an error (403) when the authorization spec is not satisfied', () => {
      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
          auth: {
            ownerCreds: ['profile_id'],
          },
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName: 'codingLanguageTags',
      };
      const input = {
        main: {
          fields: {
            id: 1,
          },
          authBundle: {},
        },
        association: {
          fields: {
            id: 1,
          },
        },
      };

      // addAssociatedItem
      const addAssociatedItem01 = expect(joint.addAssociatedItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      return Promise.all([
        addAssociatedItem01,
        hasAssociatedItem01,
      ]);
    });
  });

  // --------------------------
  // Testing: addAssociatedItem
  // --------------------------

  // TODO: Add passing test for auth / owner creds !!!
  describe('addAssociatedItem', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should associate a resource when the spec is satisfied', () => {
      const mainID = 2;
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 10, // html
          },
        },
      };

      return joint.addAssociatedItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(4);
          expect(associatedTags.models[0].attributes.key).to.equal('java');
          expect(associatedTags.models[1].attributes.key).to.equal('jsp');
          expect(associatedTags.models[2].attributes.key).to.equal('javascript');
          expect(associatedTags.models[3].attributes.key).to.equal('html');
        });
    });

    it('should ensure a duplicate association is not created, if the association already exists', () => {
      const mainID = 4;
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 3, // javascript
          },
        },
      };

      return joint.addAssociatedItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(2);
          expect(associatedTags.models[0].attributes.key).to.equal('javascript');
          expect(associatedTags.models[1].attributes.key).to.equal('coffee-script');
        });
    });
  }); // END - addAssociatedItem

  // --------------------------
  // Testing: hasAssociatedItem
  // --------------------------

  // TODO: Add passing test for auth / owner creds !!!
  describe('hasAssociatedItem', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should return an error (404) when the requested association does not exist', () => {
      const mainID = 2;
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: 9, // xslt
          },
        },
      };

      return expect(joint.hasAssociatedItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(404);
    });

    it('should return the associated resource, when the association exists', () => {
      const mainID = 2;
      const assocID = 1; // java
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: 'CodingLanguageTag',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'key', type: 'String', requiredOr: true },
          ],
        },
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
        association: {
          fields: {
            id: assocID,
          },
        },
      };

      return joint.hasAssociatedItem(spec, input)
        .then((data) => {
          expect(data.attributes.id).to.equal(assocID);
          expect(data.attributes.key).to.equal('java');
        });
    });
  }); // END - hasAssociatedItem
});
