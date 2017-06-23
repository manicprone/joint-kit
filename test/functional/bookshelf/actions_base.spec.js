import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as AuthHandler from '../../../src/authorization/auth-handler';
import Joint from '../../../src';
import modelConfig from '../../configs/models/model-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let joint = null;

// ------------------------
// BOOKSHELF ACTIONS (base)
// ------------------------
describe('BASE ACTIONS [bookshelf]', () => {
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
  describe('standard error scenarios (createItem, getItem, getItems, updateItem, upsertItem, deleteItem)', () => {
    before(() => resetDB(['users', 'projects']));

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
      const createItemAction = expect(joint.createItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItem
      const getItemAction = expect(joint.getItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

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
        createItemAction,
        getItemAction,
        // getItemsAction,
        // updateItemAction,
        upsertItemAction,
        // deleteItemAction,
      ]);
    });

    it('should return an error (400) when a required field is not provided', () => {
      const spec01 = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'external_id', type: 'Number', requiredOr: true },
        ],
      };
      const input01 = {
        fields: {
          identifier: 1,
        },
      };

      const spec02 = {
        modelName: 'User',
        fields: [
          { name: 'external_id', type: 'String', required: true },
          { name: 'display_name', type: 'String', requiredOr: false },
          { name: 'email', type: 'String', required: false },
          { name: 'avatar_url', type: 'String', defaultValue: '//extradimensional.org/avatars/human/random' },
          { name: 'is_intelligent', type: 'Boolean', defaultValue: false },
        ],
      };
      const input02 = {
        fields: {
          display_name: 'Jimbo',
          email: 'jimbo@mail.com',
        },
      };

      // createItem
      const createItem01 = expect(joint.createItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const createItem02 = expect(joint.createItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItem
      const getItem01 = expect(joint.getItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const getItem02 = expect(joint.getItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItems
      // const getItems01 = expect(joint.getItems(spec01, input01))
      //   .to.eventually.be.rejectedWithJointStatusError(400);
      // const getItems02 = expect(joint.getItems(spec02, input02))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // updateItem
      // const updateItem01 = expect(joint.updateItem(spec01, input01))
      //   .to.eventually.be.rejectedWithJointStatusError(400);
      // const updateItem02 = expect(joint.updateItem(spec02, input02))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      // upsertItem
      const upsertItem01 = expect(joint.upsertItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const upsertItem02 = expect(joint.upsertItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // deleteItem
      // const deleteItem01 = expect(joint.deleteItem(spec01, input01))
      //   .to.eventually.be.rejectedWithJointStatusError(400);
      // const deleteItem02 = expect(joint.deleteItem(spec02, input02))
      //   .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        createItem01,
        createItem02,
        getItem01,
        getItem02,
        // getItems01,
        // getItems02,
        // updateItem01,
        // updateItem02,
        upsertItem01,
        upsertItem02,
        // deleteItem01,
        // deleteItem02,
      ]);
    });

    it('should return an error (403) when the authorization spec is not satisfied', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'profile_id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
        ],
        auth: {
          ownerCreds: ['user_id', 'profile_id'],
        },
      };
      const input = {
        fields: {
          title: 'How to Blow Up Every Morning',
        },
        authBundle: {},
      };

      // With lookup field (for update/upsert)...
      const specForUpdate = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookupField: true },
        ],
        auth: {
          ownerCreds: ['user_id', 'profile_id'],
        },
      };
      const inputForUpdate = {
        fields: {
          id: 1,
        },
        authBundle: {},
      };

      // createItem
      const createItemAction = expect(joint.createItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // getItem
      const getItemAction = expect(joint.getItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // getItems
      // const getItemsAction = expect(joint.getItems(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(403);

      // updateItem
      // const updateItemAction = expect(joint.updateItem(specForUpdate, inputForUpdate))
      //   .to.eventually.be.rejectedWithJointStatusError(403);

      // upsertItem
      const upsertItemAction = expect(joint.upsertItem(specForUpdate, inputForUpdate))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // deleteItem
      // const deleteItemAction = expect(joint.deleteItem(spec, input))
      //   .to.eventually.be.rejectedWithJointStatusError(403);

      return Promise.all([
        createItemAction,
        getItemAction,
        // getItemsAction,
        // updateItemAction,
        upsertItemAction,
        // deleteItemAction,
      ]);
    });

    it('should report on missing required fields in a semantic way', () => {
      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'user_id', type: 'Number', required: true },
          { name: 'status_id', type: 'Number', required: true },
          { name: 'this_thing', type: 'String', requiredOr: true },
          { name: 'that_thing', type: 'String', requiredOr: true },
        ],
      };
      const missingOneRequired = {
        fields: {
          status_id: 0,
          this_thing: 'reality',
        },
      };
      const missingTwoRequired = {
        fields: {
          this_thing: 'reality',
          that_thing: 'fiction',
        },
      };
      const missingRequiredOrs = {
        fields: {
          user_id: 333,
          status_id: 0,
        },
      };
      const missingOneRequiredAndRequiredOrs = {
        fields: {
          status_id: 0,
        },
      };
      const missingTwoRequiredAndRequiredOrs = {
        fields: {},
      };

      const testCase01 = joint.createItem(spec, missingOneRequired)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required field: "user_id"');
        });

      const testCase02 = joint.createItem(spec, missingTwoRequired)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: all of => ("user_id", "status_id")');
        });

      const testCase03 = joint.createItem(spec, missingRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: at least one of => ("this_thing", "that_thing")');
        });

      const testCase04 = joint.createItem(spec, missingOneRequiredAndRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: "user_id" AND at least one of => ("this_thing", "that_thing")');
        });

      const testCase05 = joint.createItem(spec, missingTwoRequiredAndRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: all of => ("user_id", "status_id") AND at least one of => ("this_thing", "that_thing")');
        });

      return Promise.all([testCase01, testCase02, testCase03, testCase04, testCase05]);
    });
  }); // END - standard error scenarios

  // -------------------
  // Testing: createItem
  // -------------------
  describe('createItem', () => {
    before(() => resetDB());

    it('should create a new row for the specified model when the spec is satisfied', () => {
      // -------------------------
      // model: User, table: users
      // -------------------------
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'username', type: 'String', required: true },
          { name: 'display_name', type: 'String' },
        ],
      };
      const inputUser = {
        fields: {
          username: 'Blasta!',
        },
      };

      // -------------------------------
      // model: Profile, table: profiles
      // -------------------------------
      const specProfile = {
        modelName: 'Profile',
        fields: [
          { name: 'user_id', type: 'Number', required: true },
          { name: 'title', type: 'String', required: true },
          { name: 'is_live', type: 'Boolean', defaultValue: false },
        ],
      };
      const inputProfile = {
        fields: {
          user_id: 1,
          title: 'Days of Bore',
        },
      };

      const createUser = joint.createItem(specUser, inputUser)
        .then((rowData) => {
          expect(rowData)
            .to.have.property('attributes')
            .that.contains({
              id: 1,
              username: inputUser.fields.username,
            });
        });

      const createProfile = joint.createItem(specProfile, inputProfile)
        .then((rowData) => {
          expect(rowData)
            .to.have.property('attributes')
            .that.contains({
              id: 1,
              user_id: inputProfile.fields.user_id,
              title: inputProfile.fields.title,
              is_live: false,
            });
        });

      return Promise.all([createUser, createProfile]);
    });
  }); // END - createItem

  // ----------------
  // Testing: getItem
  // ----------------
  describe('getItem', () => {
    before(() => resetDB(['users', 'tags', 'profiles', 'projects']));

    it('should return the row according to the provided spec and input', () => {
      // ----
      // User
      // ----
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'external_id', type: 'Number', requiredOr: true },
          { name: 'username', type: 'String' },
          { name: 'email', type: 'String' },
        ],
      };
      const inputUser = {
        fields: {
          external_id: 301,
        },
      };

      // -------
      // Profile
      // -------
      const specProfile = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true },
        ],
      };
      const inputProfile = {
        fields: {
          id: 1,
        },
      };

      const getUser = joint.getItem(specUser, inputUser)
        .then((data) => {
          expect(data)
            .to.have.property('attributes')
            .that.contains({
              id: 1,
              external_id: inputUser.fields.external_id,
            });
        });

      const getProfile = joint.getItem(specProfile, inputProfile)
        .then((data) => {
          expect(data)
            .to.have.property('attributes')
            .that.contains({
              id: inputProfile.fields.id,
              user_id: 4,
            });
        });

      return Promise.all([
        getUser,
        getProfile,
      ]);
    });

    it('should support an "ownerCreds" authorization from a field on the retrieved item data', () => {
      const mockSession = {
        is_logged_in: true,
        user_id: 4,
        external_id: 304,
        username: 'the_manic_edge',
        roles: ['moderator', 'admin'],
        profile_id: [1, 2, 3],
      };
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/project/4',
        session: { jointUser: mockSession },
      };
      const authRules = { owner: 'me' };
      const authBundle = AuthHandler.buildAuthBundle(mockRequest, authRules);

      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
        auth: {
          ownerCreds: ['profile_id'],
        },
      };
      const input = {
        fields: { id: 4 },
        authBundle,
      };

      return expect(joint.getItem(spec, input))
        .to.be.fulfilled;
    });

    it('should only return the column data that is permitted by the spec', () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'description', 'is_default', 'is_live', 'created_at', 'updated_at'];

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true },
        ],
      };

      const specColsEmptyArray = Object.assign({}, specBase);
      specColsEmptyArray.columnsToReturn = [];

      const specColsSpecified = Object.assign({}, specBase);
      specColsSpecified.columnsToReturn = ['id', 'title', 'tagline'];

      const input = {
        fields: {
          id: 1,
        },
      };

      const getAllColsFromBase = joint.getItem(specBase, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getAllColsFromEmptyArray = joint.getItem(specColsEmptyArray, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getSpecifiedCols = joint.getItem(specColsSpecified, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsSpecified.columnsToReturn);
        });

      return Promise.all([getAllColsFromBase, getAllColsFromEmptyArray, getSpecifiedCols]);
    });

    it('should support the "columnSet" syntax, permitting various sets of returned column data', () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'description', 'is_default', 'is_live', 'created_at', 'updated_at'];

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true },
        ],
      };

      const specColsWithDefault = Object.assign({}, specBase);
      specColsWithDefault.columnsToReturn = {
        default: ['id', 'user_id', 'title', 'slug', 'tagline', 'description'],
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline'],
      };

      const specColsWithoutDefault = Object.assign({}, specBase);
      specColsWithoutDefault.columnsToReturn = {
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline'],
      };

      const inputWithUndefinedSet = {
        fields: { id: 1 },
        columnSet: 'unknown',
      };
      const inputWithDefaultSet = {
        fields: { id: 1 },
        columnSet: 'default',
      };
      const inputWithListSet = {
        fields: { id: 1 },
        columnSet: 'list',
      };

      const getAllColsWithBase = joint.getItem(specBase, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getDefaultSetImplicitly = joint.getItem(specColsWithDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.columnsToReturn.default);
        });

      const getAllColsWithUnknownSetAndNoDefault = joint.getItem(specColsWithoutDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getDefaultSetExplicitly = joint.getItem(specColsWithDefault, inputWithDefaultSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.columnsToReturn.default);
        });

      const getListSet = joint.getItem(specColsWithDefault, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.columnsToReturn.list);
        });

      return Promise.all([
        getAllColsWithBase,
        getDefaultSetImplicitly,
        getAllColsWithUnknownSetAndNoDefault,
        getDefaultSetExplicitly,
        getListSet,
      ]);
    });

    // TODO: Support relation registration on models !!!
    it.skip('should return relation data when the "input.relations" property is used', () => {
      const relationName = 'profile';

      const specPost = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const inputPostWithRelation = {
        fields: { id: 1 },
        relations: [relationName],
      };
      const inputPostWithoutRelation = {
        fields: { id: 1 },
      };

      const withRelation = joint.getItem(specPost, inputPostWithRelation)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(relationName);
        });

      const withoutRelation = joint.getItem(specPost, inputPostWithoutRelation)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withRelation, withoutRelation]);
    });

    // it(`should load relation data directly to the base attributes when the "input.${TEMPLATE.INPUT_LOAD_DIRECT}" property is used`, () => {
    //   const specPost = {
    //     modelName: 'BlogPost',
    //     fields: [
    //       { name: 'id', type: 'Number', required: true },
    //     ],
    //   };
    //   const inputPost = {
    //     fields: { id: 1 },
    //     loadDirect: ['profile:title', 'user:username', 'customTags:key'],
    //   };
    //
    //   const withLoadDirect = joint.getItem(specPost, inputPost)
    //     .then((data) => {
    //       expect(data.attributes)
    //         .to.contain({
    //           profile: 'Heavy Synapse',
    //           user: 'super-admin',
    //         });
    //
    //       expect(data.attributes)
    //         .to.have.property('custom_tags')
    //         .that.has.members(['custom-tag-001', 'custom-tag-004', 'custom-tag-005']);
    //
    //       expect(data)
    //         .to.have.property('relations')
    //         .that.is.empty;
    //     });
    //
    //   return Promise.all([withLoadDirect]);
    // });

    // it(`should support the combined usage of "input.${TEMPLATE.INPUT_RELATIONS}" and "input.${TEMPLATE.INPUT_LOAD_DIRECT}" properties`, () => {
    //   const specPost = {
    //     modelName: 'BlogPost',
    //     fields: [
    //       { name: 'id', type: 'Number', required: true },
    //     ],
    //   };
    //   const inputPost = {
    //     fields: { id: 1 },
    //     relations: ['profile'],
    //     loadDirect: ['customTags:key', 'user:username'],
    //   };
    //
    //   const withBoth = joint.getItem(specPost, inputPost)
    //     .then((data) => {
    //       expect(data.attributes)
    //         .to.have.property('custom_tags')
    //         .that.has.members(['custom-tag-001', 'custom-tag-004', 'custom-tag-005']);
    //
    //       expect(data.attributes)
    //         .to.contain({ user: 'super-admin' });
    //
    //       expect(data.relations).to.have.keys('profile');
    //     });
    //
    //   return Promise.all([withBoth]);
    // });
  }); // END - getItem

  // -------------------
  // Testing: upsertItem
  // -------------------
  describe('upsertItem', () => {
    before(() => resetDB());

    it('should return an error (400) when the input does not provide a "lookupField"', () => {
      const spec = {
        modelName: 'AppSettings',
        fields: [
          { name: 'app_id', type: 'String', lookupField: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const settingsData = { a: true, b: false, c: 'string-value' };

      const input = {
        fields: { data: settingsData },
      };

      return expect(joint.upsertItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
    });

    it('should perform a create action when the resource does not exist', () => {
      const spec = {
        modelName: 'AppSettings',
        fields: [
          { name: 'app_id', type: 'String', required: true, lookupField: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const appID = 'app-12345';
      const settingsData = { a: true, b: false, c: 'string-value' };

      const input = {
        fields: { app_id: appID, data: settingsData },
      };

      return joint.upsertItem(spec, input)
        .then((data) => {
          expect(data.attributes.id).to.equal(1);
          expect(data.attributes.app_id).to.equal(appID);

          const dataJSON = JSON.parse(data.attributes.data);
          expect(dataJSON.c).to.equal('string-value');
        });
    });

    it('should perform an update action when the resource already exists', () => {
      const spec = {
        modelName: 'AppSettings',
        fields: [
          { name: 'app_id', type: 'String', required: true, lookupField: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const appID = 'app-12345';
      const settingsData = { a: true, b: false, c: 'updated-string-value' };

      const input = {
        fields: { app_id: appID, data: settingsData },
      };

      return joint.upsertItem(spec, input)
        .then((data) => {
          expect(data.attributes.id).to.equal(1);
          expect(data.attributes.app_id).to.equal(appID);

          const dataJSON = JSON.parse(data.attributes.data);
          expect(dataJSON.c).to.equal('updated-string-value');
        });
    });
  }); // END - upsertItem

});
