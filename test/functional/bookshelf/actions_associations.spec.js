import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import modelConfig from '../../configs/model-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let joint = null;
let jointJsonApi = null;

// --------------------------------
// BOOKSHELF ACTIONS (associations)
// --------------------------------
describe('ASSOCIATION ACTIONS [bookshelf]', () => {
  before(() => {
    joint = new Joint({
      service: bookshelf,
    });
    joint.generate({ modelConfig, log: false });

    jointJsonApi = new Joint({
      service: bookshelf,
      output: 'json-api',
    });
    jointJsonApi.generate({ modelConfig, log: false });
  });

  // ---------------------------------
  // Testing: standard error scenarios
  // ---------------------------------
  describe('standard error scenarios (addAssociatedItems, hasAssociatedItem, removeAssociatedItem, removeAllAssociatedItems)', () => {
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
      const specMissingAssocName = {
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
        noAssociationName: 'codingLanguageTags',
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

      // addAssociatedItems
      const addAssociatedItems01 = expect(joint.addAssociatedItems(specMissingMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems02 = expect(joint.addAssociatedItems(specMissingAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems03 = expect(joint.addAssociatedItems(spec, inputMissingMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems04 = expect(joint.addAssociatedItems(spec, inputMissingAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems05 = expect(joint.addAssociatedItems(specMissingAssocName, input))
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
      const hasAssociatedItem05 = expect(joint.hasAssociatedItem(specMissingAssocName, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAssociatedItem
      const removeAssociatedItem01 = expect(joint.removeAssociatedItem(specMissingMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem02 = expect(joint.removeAssociatedItem(specMissingAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem03 = expect(joint.removeAssociatedItem(spec, inputMissingMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem04 = expect(joint.removeAssociatedItem(spec, inputMissingAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem05 = expect(joint.removeAssociatedItem(specMissingAssocName, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAllAssociatedItems
      const removeAllAssociatedItems01 = expect(joint.removeAllAssociatedItems(specMissingMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAllAssociatedItems02 = expect(joint.removeAllAssociatedItems(spec, inputMissingMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAllAssociatedItems03 = expect(joint.removeAllAssociatedItems(specMissingAssocName, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItems01,
        addAssociatedItems02,
        addAssociatedItems03,
        addAssociatedItems04,
        addAssociatedItems05,

        hasAssociatedItem01,
        hasAssociatedItem02,
        hasAssociatedItem03,
        hasAssociatedItem04,
        hasAssociatedItem05,

        removeAssociatedItem01,
        removeAssociatedItem02,
        removeAssociatedItem03,
        removeAssociatedItem04,
        removeAssociatedItem05,

        removeAllAssociatedItems01,
        removeAllAssociatedItems02,
        removeAllAssociatedItems03,
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

      // addAssociatedItems
      const addAssociatedItems01 = expect(joint.addAssociatedItems(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems02 = expect(joint.addAssociatedItems(specNoAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(specNoAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAssociatedItem
      const removeAssociatedItem01 = expect(joint.removeAssociatedItem(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem02 = expect(joint.removeAssociatedItem(specNoAssoc, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAllAssociatedItems
      const removeAllAssociatedItems01 = expect(joint.removeAllAssociatedItems(specNoMain, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItems01,
        addAssociatedItems02,
        hasAssociatedItem01,
        hasAssociatedItem02,
        removeAssociatedItem01,
        removeAssociatedItem02,
        removeAllAssociatedItems01,
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

      // addAssociatedItems
      const addAssociatedItems01 = expect(joint.addAssociatedItems(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);
      const addAssociatedItems02 = expect(joint.addAssociatedItems(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(404);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(404);

      // removeAssociatedItem
      const removeAssociatedItem01 = expect(joint.removeAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);
      const removeAssociatedItem02 = expect(joint.removeAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(404);

      // removeAllAssociatedItems
      const removeAllAssociatedItems01 = expect(joint.removeAllAssociatedItems(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(404);

      return Promise.all([
        addAssociatedItems01,
        addAssociatedItems02,
        hasAssociatedItem01,
        hasAssociatedItem02,
        removeAssociatedItem01,
        removeAssociatedItem02,
        removeAllAssociatedItems01,
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

      // addAssociatedItems
      const addAssociatedItems01 = expect(joint.addAssociatedItems(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const addAssociatedItems02 = expect(joint.addAssociatedItems(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const hasAssociatedItem02 = expect(joint.hasAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAssociatedItem
      const removeAssociatedItem01 = expect(joint.removeAssociatedItem(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const removeAssociatedItem02 = expect(joint.removeAssociatedItem(spec, inputNoAssoc))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // removeAllAssociatedItems
      const removeAllAssociatedItems01 = expect(joint.removeAllAssociatedItems(spec, inputNoMain))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        addAssociatedItems01,
        addAssociatedItems02,
        hasAssociatedItem01,
        hasAssociatedItem02,
        removeAssociatedItem01,
        removeAssociatedItem02,
        removeAllAssociatedItems01,
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

      // addAssociatedItems
      const addAssociatedItems01 = expect(joint.addAssociatedItems(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // hasAssociatedItem
      const hasAssociatedItem01 = expect(joint.hasAssociatedItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // removeAssociatedItem
      const removeAssociatedItem01 = expect(joint.removeAssociatedItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // removeAllAssociatedItems
      const removeAllAssociatedItems01 = expect(joint.removeAllAssociatedItems(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      return Promise.all([
        addAssociatedItems01,
        hasAssociatedItem01,
        removeAssociatedItem01,
        removeAllAssociatedItems01,
      ]);
    });
  });

  // --------------------------
  // Testing: addAssociatedItems
  // --------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('addAssociatedItems', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should associate a resource when the spec is satisfied', () => {
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

      const inputSingle = {
        main: {
          fields: {
            id: 2,
          },
        },
        association: {
          fields: {
            id: 10, // html
          },
        },
      };

      const inputMultiple = {
        main: {
          fields: {
            id: 5,
          },
        },
        association: {
          fields: {
            id: [1, 2, 9, 10], // java, jsp, xslt, html
          },
        },
      };

      const addSingleAssoc = joint.addAssociatedItems(spec, inputSingle)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: 2,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(4);
          expect(associatedTags.models[0].attributes.key).to.equal('java');
          expect(associatedTags.models[1].attributes.key).to.equal('jsp');
          expect(associatedTags.models[2].attributes.key).to.equal('javascript');
          expect(associatedTags.models[3].attributes.key).to.equal('html');
        });

      const addMultipleAssoc = joint.addAssociatedItems(spec, inputMultiple)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: 5,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(5);
          expect(associatedTags.models[0].attributes.key).to.equal('python');
          expect(associatedTags.models[1].attributes.key).to.equal('java');
          expect(associatedTags.models[2].attributes.key).to.equal('jsp');
          expect(associatedTags.models[3].attributes.key).to.equal('xslt');
          expect(associatedTags.models[4].attributes.key).to.equal('html');
        });

      return Promise.all([addSingleAssoc, addMultipleAssoc]);
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

      return joint.addAssociatedItems(spec, input)
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

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project';
      const mainID = 4;
      const assocModelName = 'CodingLanguageTag';
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: mainModelName,
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
          ],
        },
        association: {
          modelName: assocModelName,
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
            id: 7, // ruby
          },
        },
      };

      const globalLevel = jointJsonApi.addAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Included...
          expect(payload).to.have.property('included').that.has.length(3);
          const thirdItem = payload.included[2];
          expect(thirdItem)
            .to.contain({
              id: 7,
              type: assocModelName,
            });
          expect(thirdItem).to.have.property('attributes');
          expect(thirdItem.attributes)
            .to.contain({
              key: 'ruby',
            });
        });

      const methodLevel = joint.addAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Included...
          expect(payload).to.have.property('included').that.has.length(3);
          const thirdItem = payload.included[2];
          expect(thirdItem)
            .to.contain({
              id: 7,
              type: assocModelName,
            });
          expect(thirdItem).to.have.property('attributes');
          expect(thirdItem.attributes)
            .to.contain({
              key: 'ruby',
            });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - addAssociatedItems

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

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project';
      const mainID = 2;
      const assocModelName = 'CodingLanguageTag';
      const assocID = 1; // java
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: mainModelName,
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

      const globalLevel = jointJsonApi.hasAssociatedItem(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: assocID,
              type: assocModelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              key: 'java',
            });
        });

      const methodLevel = joint.hasAssociatedItem(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: assocID,
              type: assocModelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              key: 'java',
            });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - hasAssociatedItem

  // -----------------------------
  // Testing: removeAssociatedItem
  // -----------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAssociatedItem', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should remove the associaton from the main resource, and return the affected main resource', () => {
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

      return joint.removeAssociatedItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(2);
          expect(associatedTags.models[0].attributes.key).to.equal('jsp');
          expect(associatedTags.models[1].attributes.key).to.equal('javascript');
        });
    });

    it('should succeed and return the unaffected main resource, if the association did not exist', () => {
      const mainID = 4;
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

      return joint.removeAssociatedItem(spec, input)
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

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project';
      const mainID = 2;
      const assocModelName = 'CodingLanguageTag';
      const assocID = 1; // java
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: mainModelName,
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

      const globalLevel = jointJsonApi.removeAssociatedItem(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys(associationName);

          // Included...
          expect(payload).to.have.property('included').that.has.length(2);
          expect(payload.included[0]).to.contain({ type: assocModelName });
        });

      const methodLevel = joint.removeAssociatedItem(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys(associationName);

          // Included...
          expect(payload).to.have.property('included').that.has.length(2);
          expect(payload.included[0]).to.contain({ type: assocModelName });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - removeAssociatedItem

  // ---------------------------------
  // Testing: removeAllAssociatedItems
  // ---------------------------------
  // TODO: Add passing test for auth / owner creds !!!
  describe('removeAllAssociatedItems', () => {
    before(() => resetDB(['tags', 'projects']));

    it('should remove the associatons from the main resource, and return the affected main resource', () => {
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
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      };

      return joint.removeAllAssociatedItems(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(0);
        });
    });

    it('should succeed and return the unaffected main resource, if the associations did not exist', () => {
      const mainID = 1; // no tags
      const associationName = 'codingLanguageTags';

      const spec = {
        main: {
          modelName: 'Project',
          fields: [
            { name: 'id', type: 'Number', requiredOr: true },
            { name: 'slug', type: 'Number', requiredOr: true },
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
      };

      return joint.removeAllAssociatedItems(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: mainID,
          });

          const associatedTags = data.relations[associationName];
          expect(associatedTags.models).to.have.length(0);
        });
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const mainModelName = 'Project';
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
        associationName,
      };
      const input = {
        main: {
          fields: {
            id: mainID,
          },
        },
      };

      const globalLevel = jointJsonApi.removeAllAssociatedItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys(associationName);
          expect(payload.data.relationships[associationName])
            .to.have.property('data').that.has.length(0);

          // Included...
          expect(payload).to.not.have.property('included');
        });

      const methodLevel = joint.removeAllAssociatedItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: mainID,
              type: mainModelName,
            });

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys(associationName);
          expect(payload.data.relationships[associationName])
            .to.have.property('data').that.has.length(0);

          // Included...
          expect(payload).to.not.have.property('included');
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - removeAllAssociatedItems
});
