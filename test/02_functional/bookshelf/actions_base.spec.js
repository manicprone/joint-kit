import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ACTION from '../../../src/actions/action-constants';
import Joint from '../../../src';
import appMgmtModels from '../../scenarios/app-mgmt/model-config';
import projectAppModels from '../../scenarios/project-app/model-config';
import blogAppModels from '../../scenarios/blog-app/model-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let appMgmt = null;
let appMgmtJsonApi = null;
let projectApp = null;
let projectAppJsonApi = null;
let blogApp = null;
let blogAppJsonApi = null;

// Values for expectation...
const allColsUser = [
  'id',
  'external_id',
  'email',
  'username',
  'display_name',
  'first_name',
  'last_name',
  'preferred_locale',
  'avatar_url',
  'last_login_at',
  'created_at',
  'updated_at',
];

// ------------------------
// BOOKSHELF ACTIONS (base)
// ------------------------
describe('BASE ACTIONS [bookshelf]', () => {
  before(() => {
    // --------
    // App Mgmt
    // --------
    appMgmt = new Joint({ service: bookshelf });
    appMgmt.generate({ modelConfig: appMgmtModels, log: false });

    appMgmtJsonApi = new Joint({ service: bookshelf, output: 'json-api' });
    appMgmtJsonApi.generate({ modelConfig: appMgmtModels, log: false });

    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf });
    projectApp.generate({ modelConfig: projectAppModels, log: false });

    projectAppJsonApi = new Joint({ service: bookshelf, output: 'json-api' });
    projectAppJsonApi.generate({ modelConfig: projectAppModels, log: false });

    // --------
    // Blog App
    // --------
    blogApp = new Joint({ service: bookshelf });
    blogApp.generate({ modelConfig: blogAppModels, log: false });

    blogAppJsonApi = new Joint({ service: bookshelf, output: 'json-api' });
    blogAppJsonApi.generate({ modelConfig: blogAppModels, log: false });
  });

  // ---------------------------------
  // Testing: standard error scenarios
  // ---------------------------------
  describe('standard error scenarios (createItem, upsertItem, updateItem, getItem, getItems, deleteItem)', () => {
    before(() => resetDB(['users', 'profiles', 'projects']));

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
      const createItemAction = expect(projectApp.createItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // upsertItem
      const upsertItemAction = expect(projectApp.upsertItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // updateItem
      const updateItemAction = expect(projectApp.updateItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItem
      const getItemAction = expect(projectApp.getItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItems
      const getItemsAction = expect(projectApp.getItems(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // deleteItem
      const deleteItemAction = expect(projectApp.deleteItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        createItemAction,
        upsertItemAction,
        updateItemAction,
        getItemAction,
        getItemsAction,
        deleteItemAction,
      ]);
    });

    it('should return an error (400) when a required field is not provided', () => {
      const spec01 = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'external_id', type: 'String', requiredOr: true },
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
      const createItem01 = expect(projectApp.createItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const createItem02 = expect(projectApp.createItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // upsertItem
      const upsertItem01 = expect(projectApp.upsertItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const upsertItem02 = expect(projectApp.upsertItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // updateItem
      const updateItem01 = expect(projectApp.updateItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const updateItem02 = expect(projectApp.updateItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItem
      const getItem01 = expect(projectApp.getItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const getItem02 = expect(projectApp.getItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // getItems
      const getItems01 = expect(projectApp.getItems(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const getItems02 = expect(projectApp.getItems(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      // deleteItem
      const deleteItem01 = expect(projectApp.deleteItem(spec01, input01))
        .to.eventually.be.rejectedWithJointStatusError(400);
      const deleteItem02 = expect(projectApp.deleteItem(spec02, input02))
        .to.eventually.be.rejectedWithJointStatusError(400);

      return Promise.all([
        createItem01,
        createItem02,
        upsertItem01,
        upsertItem02,
        updateItem01,
        updateItem02,
        getItem01,
        getItem02,
        getItems01,
        getItems02,
        deleteItem01,
        deleteItem02,
      ]);
    });

    it('should return an error (403) when the authorization spec is not satisfied', () => {
      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'user_id', type: 'Number' },
        ],
        auth: {
          ownerCreds: ['id => profile_ids', 'user_id'],
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
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
        ],
        auth: {
          ownerCreds: ['id => profile_ids', 'user_id'],
        },
      };
      const inputForUpdate = {
        fields: {
          id: 1,
        },
        authBundle: {},
      };

      // createItem
      const createItemAction = expect(blogApp.createItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // upsertItem
      const upsertItemAction = expect(blogApp.upsertItem(specForUpdate, inputForUpdate))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // updateItem
      const updateItemAction = expect(blogApp.updateItem(specForUpdate, inputForUpdate))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // getItem
      const getItemAction = expect(blogApp.getItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // getItems
      const getItemsAction = expect(blogApp.getItems(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      // deleteItem
      const deleteItemAction = expect(blogApp.deleteItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(403);

      return Promise.all([
        createItemAction,
        upsertItemAction,
        updateItemAction,
        getItemAction,
        getItemsAction,
        deleteItemAction,
      ]);
    });

    it('should report on missing required fields in a semantic way', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'user_id', type: 'Number', required: true },
          { name: 'status_code', type: 'Number', required: true },
          { name: 'this_thing', type: 'String', requiredOr: true },
          { name: 'that_thing', type: 'String', requiredOr: true },
        ],
      };
      const missingOneRequired = {
        fields: {
          status_code: 0,
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
          status_code: 0,
        },
      };
      const missingOneRequiredAndRequiredOrs = {
        fields: {
          status_code: 0,
        },
      };
      const missingTwoRequiredAndRequiredOrs = {
        fields: {},
      };

      const testCase01 = projectApp.createItem(spec, missingOneRequired)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required field: "user_id"');
        });

      const testCase02 = projectApp.createItem(spec, missingTwoRequired)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: all of => ("user_id", "status_code")');
        });

      const testCase03 = projectApp.createItem(spec, missingRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: at least one of => ("this_thing", "that_thing")');
        });

      const testCase04 = projectApp.createItem(spec, missingOneRequiredAndRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: "user_id" AND at least one of => ("this_thing", "that_thing")');
        });

      const testCase05 = projectApp.createItem(spec, missingTwoRequiredAndRequiredOrs)
        .catch((error) => {
          expect(error.message)
            .to.equal('Missing required fields: all of => ("user_id", "status_code") AND at least one of => ("this_thing", "that_thing")');
        });

      return Promise.all([testCase01, testCase02, testCase03, testCase04, testCase05]);
    });
  }); // END - standard error scenarios

  // -------------------
  // Testing: createItem
  // -------------------
  describe('createItem', () => {
    before(() => resetDB());

    it('should create a new resource item when the spec is satisfied', () => {
      // ----
      // User
      // ----
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

      // -------
      // Profile
      // -------
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

      const createUser = blogApp.createItem(specUser, inputUser)
        .then((rowData) => {
          expect(rowData)
            .to.have.property('attributes')
            .that.contains({
              id: 1,
              username: inputUser.fields.username,
            });
        });

      const createProfile = blogApp.createItem(specProfile, inputProfile)
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

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const projectName = 'Project for Test';
      const defaultAlias = 'alias-is-locked';
      const alias = 'user-updated-alias';

      const specNoDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'alias', type: 'String', locked: true },
          { name: 'brief_description', type: 'String' },
        ],
      };
      const specWithDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: defaultAlias },
          { name: 'brief_description', type: 'String' },
        ],
      };

      const input = {
        fields: { name: projectName, alias },
      };

      // If no "defaultValue" is provided, the field value does not get set...
      const noDefaultValue = projectApp.createItem(specNoDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({ name: projectName });
          expect(data.attributes).to.not.have.keys(['alias']);
        });

      const withDefaultValue = projectApp.createItem(specWithDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            name: projectName,
            alias: defaultAlias,
          });
        });

      return Promise.all([noDefaultValue, withDefaultValue]);
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'Project';
      const projectName = 'The Storytold';

      const specProject = {
        modelName,
        fields: [
          { name: 'name', type: 'String', required: true },
        ],
      };
      const inputProject = {
        fields: {
          name: projectName,
        },
      };

      const globalLevel = projectAppJsonApi.createItem(specProject, inputProject)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              name: projectName,
            });
        });

      const methodLevel = projectApp.createItem(specProject, inputProject, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              name: projectName,
            });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - createItem

  // -------------------
  // Testing: upsertItem
  // -------------------
  describe('upsertItem', () => {
    before(() => resetDB());

    it('should return an error (400) when the input does not provide a "lookup field"', () => {
      const spec = {
        modelName: 'AppSettings',
        fields: [
          { name: 'app_id', type: 'String', lookup: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const settingsData = { a: true, b: false, c: 'string-value' };

      const input = {
        fields: { data: settingsData },
      };

      return expect(appMgmt.upsertItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
    });

    it('should perform a create action when the resource does not exist', () => {
      const spec = {
        modelName: 'AppSettings',
        fields: [
          { name: 'app_id', type: 'String', required: true, lookup: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const appID = 'app-12345';
      const settingsData = { a: true, b: false, c: 'string-value' };

      const input = {
        fields: { app_id: appID, data: settingsData },
      };

      return appMgmt.upsertItem(spec, input)
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
          { name: 'app_id', type: 'String', required: true, lookup: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const appID = 'app-12345';
      const settingsData = { a: true, b: false, c: 'updated-string-value' };

      const input = {
        fields: { app_id: appID, data: settingsData },
      };

      return appMgmt.upsertItem(spec, input)
        .then((data) => {
          expect(data.attributes.id).to.equal(1);
          expect(data.attributes.app_id).to.equal(appID);

          const dataJSON = JSON.parse(data.attributes.data);
          expect(dataJSON.c).to.equal('updated-string-value');
        });
    });

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const defaultAlias = 'alias-is-locked';
      const alias = 'user-updated-alias';

      const specNoDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true },
        ],
      };
      const inputNoDefaultValue = {
        fields: { name: 'Project 1', alias },
      };

      const specWithDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'name', type: 'String', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: defaultAlias },
        ],
      };
      const inputWithDefaultValue = {
        fields: { name: 'Project 2', alias },
      };

      // If no "defaultValue" is provided, the field value does not get set...
      const noDefaultValue = projectApp.upsertItem(specNoDefaultValue, inputNoDefaultValue)
        .then((data) => {
          expect(data.attributes).to.contain({
            id: 1,
            name: 'Project 1',
          });
          expect(data.attributes).to.not.have.keys(['alias']);
        });

      // Create...
      const withDefaultValue = projectApp.upsertItem(specWithDefaultValue, inputWithDefaultValue)
        .then((created) => {
          expect(created.attributes).to.contain({
            id: 2,
            name: 'Project 2',
            alias: defaultAlias,
          });

          // Udpate...
          return projectApp.upsertItem(specWithDefaultValue, inputWithDefaultValue)
            .then((udpated) => {
              expect(udpated.attributes).to.contain({
                id: 2,
                name: 'Project 2',
                alias: defaultAlias,
              });
            });
        });

      return Promise.all([noDefaultValue, withDefaultValue]);
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'AppSettings';
      const appID = 'app-12345';
      const settingsData = { a: true, b: false, c: 'another-string-value' };

      const spec = {
        modelName,
        fields: [
          { name: 'app_id', type: 'String', required: true, lookup: true },
          { name: 'data', type: 'JSON', required: true },
        ],
      };

      const input = {
        fields: { app_id: appID, data: settingsData },
      };

      const globalLevel = appMgmtJsonApi.upsertItem(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: 1,
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              app_id: appID,
            });
        });

      const methodLevel = appMgmt.upsertItem(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id: 1,
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              app_id: appID,
            });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - upsertItem

  // -------------------
  // Testing: updateItem
  // -------------------
  describe('updateItem', () => {
    before(() => resetDB(['profiles', 'projects']));

    it('should return an error (400) when the input does not provide a "lookup" field', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' },
        ],
      };
      const input = {
        fields: {
          name: 'Updated Name',
        },
      };

      return expect(projectApp.updateItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(400);
    });

    it('should return an error (404) when the requested resource is not found', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' },
        ],
      };
      const input = {
        fields: {
          id: 999,
          name: 'Updated Name',
        },
      };

      return expect(projectApp.updateItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(404);
    });

    it('should udpate the resource when the spec is satisfied', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' },
        ],
      };

      const id = 2;
      const name = 'Updated Name';

      const input = {
        fields: { id, name },
      };

      return projectApp.updateItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id,
            name,
          });
        });
    });

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const id = 1;
      const defaultName = 'Default Name';
      const name = 'Name is Locked';

      const specNoDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String', locked: true },
          { name: 'brief_description', type: 'String' },
        ],
      };
      const specWithDefaultValue = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String', locked: true, defaultValue: defaultName },
          { name: 'brief_description', type: 'String' },
        ],
      };

      const input = {
        fields: { id, name },
      };

      // If no "defaultValue" is provided, the field will not be updated...
      const noDefaultValue = projectApp.updateItem(specNoDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id,
            name: 'Mega-Seed Mini-Sythesizer',
          });
        });

      const withDefaultValue = projectApp.updateItem(specWithDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id,
            name: defaultName,
          });
        });

      return Promise.all([noDefaultValue, withDefaultValue]);
    });

    it(`should support dynamic values on the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" option (now, camelCase, kebabCase, snakeCase, pascalCase)`, () => {
      const id = 4;
      // const valueToTransform = 'teSt ThIS guY';
      const valueToTransform = 'test This guy';

      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'alias', type: 'String', locked: true, defaultValue: '% camelCase(full_description) %' },
          { name: 'location', type: 'String', defaultValue: '% kebabCase(full_description) %' },
          { name: 'name', type: 'String', defaultValue: '% snakeCase(full_description) %' },
          { name: 'brief_description', type: 'String', defaultValue: '% pascalCase(full_description) %' },
          { name: 'started_at', type: 'String', defaultValue: '% now %' },
          { name: 'full_description', type: 'String' },
        ],
      };

      const input = {
        fields: { id, full_description: valueToTransform },
      };

      return projectApp.updateItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            id,
            alias: 'testThisGuy', // camel case
            location: 'test-this-guy', // kebab case
            name: 'test_this_guy', // snake case
            brief_description: 'TestThisGuy', // pascal case
          });
          expect(data.attributes.started_at).to.have.length(20);
        });
    });

    it(`should support an "${ACTION.SPEC_AUTH_OWNER_CREDS}" authorization from a field on the looked-up item data`, () => {
      const userContext = {
        is_logged_in: true,
        id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: [],
        profile_ids: [1, 2, 3],
      };
      const authRules = { owner: 'me' };
      const authBundle = blogApp.buildAuthBundle(userContext, authRules);

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'title', type: 'String' },
          { name: 'tagline', type: 'String' },
        ],
        auth: {
          ownerCreds: ['user_id => id'],
        },
      };

      const input = {
        fields: {
          id: 1,
          title: 'A New Title for a New Day',
        },
        authBundle,
      };

      return expect(blogApp.updateItem(spec, input))
        .to.be.fulfilled;
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'Project';
      const id = 2;
      const name = 'The Third Name';

      const spec = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
          { name: 'name', type: 'String' },
          { name: 'brief_description', type: 'String' },
        ],
      };

      const input = {
        fields: { id, name },
      };

      const globalLevel = projectAppJsonApi.updateItem(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id,
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              name,
            });
        });

      const methodLevel = projectApp.updateItem(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              id,
              type: modelName,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.contain({
              name,
            });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - updateItem

  // ----------------
  // Testing: getItem
  // ----------------
  describe('getItem', () => {
    before(() => resetDB(['users', 'roles', 'profiles', 'app-content']));

    it('should return the row according to the provided spec and input', () => {
      const specUser = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'external_id', type: 'String', requiredOr: true },
          { name: 'username', type: 'String' },
          { name: 'email', type: 'String' },
        ],
      };
      const inputUser = {
        fields: {
          external_id: '301',
        },
      };

      const getUser = blogApp.getItem(specUser, inputUser)
        .then((data) => {
          expect(data)
            .to.have.property('attributes')
            .that.contains({
              id: 1,
              external_id: inputUser.fields.external_id,
            });
        });

      return Promise.all([
        getUser,
      ]);
    });

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const appID = 'app-001';
      const key = 'v2.0';

      const specNoDefaultValue = {
        modelName: 'AppContent',
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'key', type: 'String', locked: true },
        ],
      };
      const specWithDefaultValue = {
        modelName: 'AppContent',
        fields: [
          { name: 'app_id', type: 'String', required: true },
          { name: 'key', type: 'String', locked: true, defaultValue: 'v1.0' },
        ],
      };

      const input = {
        fields: { app_id: appID, key },
      };

      // If no "defaultValue" is provided, the field will not be included in the request...
      const noDefaultValue = appMgmt.getItem(specNoDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            app_id: appID,
            key: 'default', // But, bookshelf returns the first created from the matches !!!
          });
        });

      const withDefaultValue = appMgmt.getItem(specWithDefaultValue, input)
        .then((data) => {
          expect(data.attributes).to.contain({
            app_id: appID,
            key: 'v1.0',
          });
        });

      return Promise.all([noDefaultValue, withDefaultValue]);
    });

    it(`should support an "${ACTION.SPEC_AUTH_OWNER_CREDS}" authorization from a field on the retrieved item data`, () => {
      const userContext = {
        is_logged_in: true,
        user_id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: ['moderator', 'admin'],
        profile_ids: [1, 2, 3],
      };
      const authRules = { owner: 'me' };
      const authBundle = blogApp.buildAuthBundle(userContext, authRules);

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
        auth: {
          ownerCreds: ['user_id'],
        },
      };
      const input = {
        fields: { id: 1 },
        authBundle,
      };

      return expect(blogApp.getItem(spec, input))
        .to.be.fulfilled;
    });

    it('should only return the field data that is permitted by the spec', () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'avatar_url', 'description', 'is_default', 'is_live', 'created_at', 'updated_at'];

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true },
        ],
      };

      const specColsEmptyArray = Object.assign({}, specBase);
      specColsEmptyArray.fieldsToReturn = [];

      const specColsSpecified = Object.assign({}, specBase);
      specColsSpecified.fieldsToReturn = ['id', 'title', 'tagline'];

      const input = {
        fields: {
          id: 1,
        },
      };

      const getAllColsFromBase = blogApp.getItem(specBase, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getAllColsFromEmptyArray = blogApp.getItem(specColsEmptyArray, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getSpecifiedCols = blogApp.getItem(specColsSpecified, input)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsSpecified.fieldsToReturn);
        });

      return Promise.all([getAllColsFromBase, getAllColsFromEmptyArray, getSpecifiedCols]);
    });

    it(`should support the "input.${ACTION.INPUT_FIELD_SET}" syntax, permitting various sets of returned field data`, () => {
      const allAvailableCols = ['id', 'user_id', 'title', 'slug', 'tagline', 'avatar_url', 'description', 'is_default', 'is_live', 'created_at', 'updated_at'];

      const specBase = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', requiredOr: true },
          { name: 'slug', type: 'String', requiredOr: true },
        ],
      };

      const specColsWithDefault = Object.assign({}, specBase);
      specColsWithDefault.fieldsToReturn = {
        default: ['id', 'user_id', 'title', 'slug', 'tagline', 'description'],
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline'],
      };

      const specColsWithoutDefault = Object.assign({}, specBase);
      specColsWithoutDefault.fieldsToReturn = {
        list: ['id', 'user_id', 'title'],
        tagline: ['user_id', 'tagline'],
      };

      const inputWithUndefinedSet = {
        fields: { id: 1 },
        fieldSet: 'unknown',
      };
      const inputWithDefaultSet = {
        fields: { id: 1 },
        fieldSet: 'default',
      };
      const inputWithListSet = {
        fields: { id: 1 },
        fieldSet: 'list',
      };

      const getAllColsWithBase = blogApp.getItem(specBase, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getDefaultSetImplicitly = blogApp.getItem(specColsWithDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default);
        });

      const getAllColsWithUnknownSetAndNoDefault = blogApp.getItem(specColsWithoutDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(allAvailableCols);
        });

      const getDefaultSetExplicitly = blogApp.getItem(specColsWithDefault, inputWithDefaultSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default);
        });

      const getListSet = blogApp.getItem(specColsWithDefault, inputWithListSet)
        .then((data) => {
          expect(data.attributes).to.have.keys(specColsWithDefault.fieldsToReturn.list);
        });

      return Promise.all([
        getAllColsWithBase,
        getDefaultSetImplicitly,
        getAllColsWithUnknownSetAndNoDefault,
        getDefaultSetExplicitly,
        getListSet,
      ]);
    });

    it(`should return association data when the "input.${ACTION.INPUT_ASSOCIATIONS}" property is used`, () => {
      const associationNameInfo = 'info';
      const associationNameProfiles = 'profiles';
      const associationNameRoles = 'roles';

      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const inputWithOneToOneAssoc = {
        fields: { id: 4 },
        associations: [associationNameInfo], // One-to-One
      };
      const inputWithOneToManyAssoc = {
        fields: { id: 4 },
        associations: [associationNameProfiles], // One-to-Many
      };
      const inputWithManyToManyAssoc = {
        fields: { id: 4 },
        associations: [associationNameRoles], // Many-to-Many
      };
      const inputWithoutAssoc = {
        fields: { id: 1 },
      };

      const withOneToOneAssoc = blogApp.getItem(spec, inputWithOneToOneAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameInfo);
        });

      const withOneToManyAssoc = blogApp.getItem(spec, inputWithOneToManyAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameProfiles);

          expect(data.relations[associationNameProfiles]).to.have.length(3);
        });

      const withManyToManyAssoc = blogApp.getItem(spec, inputWithManyToManyAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.has.property(associationNameRoles);

          expect(data.relations[associationNameRoles]).to.have.length(4);
        });

      const withoutAssoc = blogApp.getItem(spec, inputWithoutAssoc)
        .then((data) => {
          expect(data)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withOneToOneAssoc, withOneToManyAssoc, withManyToManyAssoc, withoutAssoc]);
    });

    it(`should support the "spec.${ACTION.SPEC_FORCE_ASSOCIATIONS}" option`, () => {
      const associationNameInfo = 'info';
      const associationNameRoles = 'roles';
      const associationNameProfiles = 'profiles';

      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
        forceAssociations: [associationNameInfo, associationNameProfiles],
      };
      const inputNoAssoc = {
        fields: { id: 4 },
      };
      const inputWithAssoc = {
        fields: { id: 4 },
        associations: [associationNameProfiles, associationNameRoles],
      };

      const withoutInputAssoc = blogApp.getItem(spec, inputNoAssoc)
        .then((data) => {
          expect(data.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles,
          ]);
        });

      const withInputAssoc = blogApp.getItem(spec, inputWithAssoc)
        .then((data) => {
          expect(data.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles,
            associationNameRoles,
          ]);
        });

      return Promise.all([withoutInputAssoc, withInputAssoc]);
    });

    it(`should load association data directly to the base attributes when the "input.${ACTION.INPUT_LOAD_DIRECT}" property is used`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const input = {
        fields: { id: 4 },
        loadDirect: ['info:*', 'roles:{name,display_name}', 'profiles:slug'],
      };

      const withLoadDirect = blogApp.getItem(spec, input)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness',
            });
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at']);

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' },
            ]);

          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized']);

          expect(data)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withLoadDirect]);
    });

    it(`should support the "spec.${ACTION.SPEC_FORCE_LOAD_DIRECT}" option, granting precendence over the input`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
        forceLoadDirect: ['info:*', 'roles:{name,display_name}'],
      };
      const inputNoLoadDirect = {
        fields: { id: 4 },
      };
      const inputWithLoadDirect = {
        fields: { id: 4 },
        loadDirect: ['info:user_id', 'profiles:slug'],
      };

      const noInputLoadDirect = blogApp.getItem(spec, inputNoLoadDirect)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness',
            });
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at']);

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' },
            ]);

          expect(data)
            .to.have.property('relations')
            .that.is.empty;
        });

      const withInputLoadDirect = blogApp.getItem(spec, inputWithLoadDirect)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('info')
            .to.contain({
              id: 1,
              user_id: 4,
              professional_title: 'EdgeCaser',
              tagline: 'Catapult like impulse, infect like madness',
            });
          expect(data.attributes.info)
            .to.have.keys(['id', 'user_id', 'professional_title', 'tagline', 'description', 'created_at', 'updated_at']);

          expect(data.attributes)
            .to.have.property('roles')
            .to.deep.equal([
              { name: 'admin', display_name: 'Admin' },
              { name: 'moderator', display_name: 'Moderator' },
              { name: 'developer', display_name: 'Developer' },
              { name: 'blogger', display_name: 'Blogger' },
            ]);

          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized']);

          expect(data)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([noInputLoadDirect, withInputLoadDirect]);
    });

    it(`should support the combined usage of "input.${ACTION.INPUT_ASSOCIATIONS}" and "input.${ACTION.INPUT_LOAD_DIRECT}" properties`, () => {
      const spec = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const input = {
        fields: { id: 4 },
        associations: ['roles', 'profiles'],
        loadDirect: ['profiles:slug', 'info:professional_title'],
      };

      const withBoth = blogApp.getItem(spec, input)
        .then((data) => {
          expect(data.attributes)
            .to.have.property('profiles')
            .that.has.members(['functional-fanatic', 'heavy-synapse', 'a-life-organized']);

          expect(data.attributes)
            .to.contain({ info: 'EdgeCaser' });

          expect(data.relations).to.have.keys(['roles', 'profiles']);
          expect(data.relations).to.not.have.keys(['info']);
        });

      return Promise.all([withBoth]);
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'User';
      const itemID = 6;

      const specUser = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const inputUser = {
        fields: { id: itemID },
        associations: ['profiles'],
        loadDirect: ['roles:name'],
      };

      const globalLevel = blogAppJsonApi.getItem(specUser, inputUser)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: itemID,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger']);

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys('profiles');

          // Included...
          expect(payload).to.have.property('included');
          expect(payload.included[0]).to.contain({ type: 'Profile' });
        });

      const methodLevel = blogAppJsonApi.getItem(specUser, inputUser, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: itemID,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes');
          expect(payload.data.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger']);

          // Relationships...
          expect(payload.data).to.have.property('relationships');
          expect(payload.data.relationships).to.have.keys('profiles');

          // Included...
          expect(payload).to.have.property('included');
          expect(payload.included[0]).to.contain({ type: 'Profile' });
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - getItem

  // -----------------
  // Testing: getItems
  // -----------------
  describe('getItems', () => {
    before(() => resetDB(['users', 'roles', 'profiles', 'projects']));

    it('should return all rows according to the provided spec and input', () => {
      // ----
      // User
      // ----
      const specUser = {
        modelName: 'User',
        defaultOrderBy: '-created_at',
      };
      const inputUsers = {};

      // -------
      // Profile
      // -------
      const specProfile = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean' },
        ],
        defaultOrderBy: '-created_at',
      };
      const inputAllProfiles = {};
      const inputLiveProfiles = {
        fields: {
          is_live: true,
        },
      };
      const inputNotLiveProfiles = {
        fields: {
          is_live: false,
        },
      };
      const inputExplicitSetOfProfiles = {
        fields: {
          id: [1, 2, 4, 5, 6],
        },
      };

      const getUsers = blogApp.getItems(specUser, inputUsers)
        .then((data) => {
          expect(data.models).to.have.length(10);
        });

      const getAllProfiles = blogApp.getItems(specProfile, inputAllProfiles)
        .then((data) => {
          expect(data.models).to.have.length(11);
        });

      const getLiveProfiles = blogApp.getItems(specProfile, inputLiveProfiles)
        .then((data) => {
          expect(data.models).to.have.length(7);
        });

      const getNotLiveProfiles = blogApp.getItems(specProfile, inputNotLiveProfiles)
        .then((data) => {
          expect(data.models).to.have.length(4);
        });

      const getExplicitSetOfProfiles = blogApp.getItems(specProfile, inputExplicitSetOfProfiles)
        .then((data) => {
          expect(data.models).to.have.length(5);
        });

      return Promise.all([getUsers, getAllProfiles, getLiveProfiles, getNotLiveProfiles, getExplicitSetOfProfiles]);
    });

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOCKED}"/"${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" pattern for system control of input`, () => {
      const onlyLiveProfiles = true;

      const specNoDefaultValue = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean', locked: true },
        ],
        defaultOrderBy: '-created_at',
      };
      const specWithDefaultValue = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number' },
          { name: 'user_id', type: 'Number' },
          { name: 'is_live', type: 'Boolean', locked: true, defaultValue: onlyLiveProfiles },
        ],
        defaultOrderBy: '-created_at',
      };
      const specWithExplicitIDs = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', locked: true, defaultValue: [1, 2, 4] },
        ],
        defaultOrderBy: '-created_at',
      };

      const input = {
        fields: { is_live: false },
      };

      // If no "defaultValue" is provided, the field will not be included in the request...
      const noDefaultValue = blogApp.getItems(specNoDefaultValue, input)
        .then((data) => {
          expect(data.models).to.have.length(11);
        });

      const withDefaultValue = blogApp.getItems(specWithDefaultValue, input)
        .then((data) => {
          expect(data.models).to.have.length(7);
        });

      const withExplicitIDs = blogApp.getItems(specWithExplicitIDs, input)
        .then((data) => {
          expect(data.models).to.have.length(3);
        });

      return Promise.all([noDefaultValue, withDefaultValue, withExplicitIDs]);
    });

    it('should only return the field data that is permitted by the spec', () => {
      const specBase = {
        modelName: 'User',
        defaultOrderBy: '-created_at',
      };

      const specColsSpecified = Object.assign({}, specBase);
      specColsSpecified.fieldsToReturn = ['id', 'username', 'display_name'];

      const input = {};

      const getAllColsFromBase = blogApp.getItems(specBase, input)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(allColsUser);
        });

      const getSpecifiedCols = blogApp.getItems(specColsSpecified, input)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsSpecified.fieldsToReturn);
        });

      return Promise.all([getAllColsFromBase, getSpecifiedCols]);
    });

    it(`should support the "input.${ACTION.INPUT_FIELD_SET}" syntax, permitting various sets of returned field data`, () => {
      const specBase = {
        modelName: 'User',
        defaultOrderBy: '-created_at',
      };

      const specColsWithDefault = Object.assign({}, specBase);
      specColsWithDefault.fieldsToReturn = {
        default: ['id', 'email', 'username', 'display_name', 'external_id'],
        list: ['id', 'username', 'display_name'],
        avatar: ['display_name', 'avatar_url'],
      };

      const specColsWithoutDefault = Object.assign({}, specBase);
      specColsWithoutDefault.fieldsToReturn = {
        list: ['id', 'username', 'display_name'],
        avatar: ['display_name', 'avatar_url'],
      };

      const inputWithUndefinedSet = { fieldSet: 'unknown' };
      const inputWithDefaultSet = { fieldSet: 'default' };
      const inputWithListSet = { fieldSet: 'list' };

      const getAllColsWithBase = blogApp.getItems(specBase, inputWithListSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(allColsUser);
        });

      const getDefaultSetImplicitly = blogApp.getItems(specColsWithDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default);
        });

      const getAllColsWithUnknownSetAndNoDefault = blogApp.getItems(specColsWithoutDefault, inputWithUndefinedSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(allColsUser);
        });

      const getDefaultSetExplicitly = blogApp.getItems(specColsWithDefault, inputWithDefaultSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.default);
        });

      const getListSet = blogApp.getItems(specColsWithDefault, inputWithListSet)
        .then((data) => {
          expect(data.models[0].attributes).to.have.keys(specColsWithDefault.fieldsToReturn.list);
        });

      return Promise.all([
        getAllColsWithBase,
        getDefaultSetImplicitly,
        getAllColsWithUnknownSetAndNoDefault,
        getDefaultSetExplicitly,
        getListSet,
      ]);
    });

    it(`should return association data when the "input.${ACTION.INPUT_ASSOCIATIONS}" property is used`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
      };
      const inputWithAssoc = {
        associations: ['info'],
      };
      const inputWithoutAssoc = {};

      const withAssoc = blogApp.getItems(spec, inputWithAssoc)
        .then((data) => {
          const fourthUser = data.models[3];

          expect(fourthUser)
            .to.have.property('relations')
            .that.has.property('info');

          const infoData = fourthUser.relations.info;
          expect(infoData)
            .to.have.property('attributes')
            .that.contains({
              user_id: 4,
              professional_title: 'EdgeCaser',
            });
        });

      const withoutAssoc = blogApp.getItems(spec, inputWithoutAssoc)
        .then((data) => {
          expect(data.models[3])
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withAssoc, withoutAssoc]);
    });

    it(`should support the "spec.${ACTION.SPEC_FORCE_ASSOCIATIONS}" option`, () => {
      const associationNameInfo = 'info';
      const associationNameRoles = 'roles';
      const associationNameProfiles = 'profiles';

      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
        forceAssociations: [associationNameInfo, associationNameProfiles],
      };

      const inputWithoutAssoc = {};
      const inputWithAssoc = {
        associations: [associationNameProfiles, associationNameRoles],
      };

      const withoutInputAssoc = blogApp.getItems(spec, inputWithoutAssoc)
        .then((data) => {
          const fourthUser = data.models[3];

          expect(fourthUser.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles,
          ]);
        });

      const withInputAssoc = blogApp.getItems(spec, inputWithAssoc)
        .then((data) => {
          const fourthUser = data.models[3];

          expect(fourthUser.relations).to.have.keys([
            associationNameInfo,
            associationNameProfiles,
            associationNameRoles,
          ]);
        });

      return Promise.all([withoutInputAssoc, withInputAssoc]);
    });

    it(`should load association data directly to the base attributes when the "input.${ACTION.INPUT_LOAD_DIRECT}" property is used`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
      };

      const input = {
        loadDirect: ['info:professional_title', 'roles:name'],
      };

      const withLoadDirect = blogApp.getItems(spec, input)
        .then((data) => {
          const sixthUser = data.models[5];

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' });

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger']);

          expect(sixthUser)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withLoadDirect]);
    });

    it(`should support the "spec.${ACTION.SPEC_FORCE_LOAD_DIRECT}" option, granting precendence over the input`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
        forceLoadDirect: ['info:professional_title'],
      };

      const inputNoLoadDirect = {};
      const inputWithLoadDirect = {
        loadDirect: ['info:*', 'roles:name'],
      };

      const noInputLoadDirect = blogApp.getItems(spec, inputNoLoadDirect)
        .then((data) => {
          const sixthUser = data.models[5];

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' });

          expect(sixthUser)
            .to.have.property('relations')
            .that.is.empty;
        });

      const withInputLoadDirect = blogApp.getItems(spec, inputWithLoadDirect)
        .then((data) => {
          const sixthUser = data.models[5];

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' });

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger']);

          expect(sixthUser)
            .to.have.property('relations')
            .that.is.empty;
        });

      return Promise.all([withInputLoadDirect, noInputLoadDirect]);
    });

    it(`should support the combined usage of "input.${ACTION.INPUT_ASSOCIATIONS}" and "input.${ACTION.INPUT_LOAD_DIRECT}" properties`, () => {
      const spec = {
        modelName: 'User',
        defaultOrderBy: 'updated_at',
      };

      const input = {
        associations: ['profiles'],
        loadDirect: ['info:professional_title', 'roles:name'],
      };

      const withBoth = blogApp.getItems(spec, input)
        .then((data) => {
          const sixthUser = data.models[5];

          expect(sixthUser.attributes)
            .to.contain({ info: 'Rickforcer' });

          expect(sixthUser.attributes)
            .to.have.property('roles')
            .that.has.members(['transcendent', 'developer', 'blogger']);

          expect(sixthUser.relations).to.have.keys('profiles');
        });

      return Promise.all([withBoth]);
    });

    it(`should return paginated results when the "input.${ACTION.INPUT_PAGINATE}" option is used`, () => {
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' },
        ],
        defaultOrderBy: 'created_at',
      };
      const inputFirstThree = {
        fields: { is_internal: false },
        paginate: { skip: 0, limit: 3 },
      };
      const inputSecondThree = {
        fields: { is_internal: false },
        paginate: { skip: 3, limit: 3 },
      };
      const inputThirdAndFourth = {
        fields: { is_internal: false },
        paginate: { skip: 2, limit: 2 },
      };
      const inputTheRest = {
        fields: { is_internal: false },
        paginate: { skip: 6, limit: 99 },
      };

      const firstThree = projectApp.getItems(specProject, inputFirstThree)
        .then((data) => {
          expect(data.models).to.have.length(3);
          expect(data.models[0]).to.contain({ id: 5 });
          expect(data.models[1]).to.contain({ id: 6 });
          expect(data.models[2]).to.contain({ id: 7 });
        });

      const secondThree = projectApp.getItems(specProject, inputSecondThree)
        .then((data) => {
          expect(data.models).to.have.length(3);
          expect(data.models[0]).to.contain({ id: 8 });
          expect(data.models[1]).to.contain({ id: 9 });
          expect(data.models[2]).to.contain({ id: 10 });
        });

      const theThirdAndFourth = projectApp.getItems(specProject, inputThirdAndFourth)
        .then((data) => {
          expect(data.models).to.have.length(2);
          expect(data.models[0]).to.contain({ id: 7 });
          expect(data.models[1]).to.contain({ id: 8 });
        });

      const theRest = projectApp.getItems(specProject, inputTheRest)
        .then((data) => {
          expect(data.models).to.have.length(4);
          expect(data.models[0]).to.contain({ id: 11 });
          expect(data.models[1]).to.contain({ id: 12 });
          expect(data.models[2]).to.contain({ id: 13 });
          expect(data.models[3]).to.contain({ id: 14 });
        });

      return Promise.all([firstThree, secondThree, theThirdAndFourth, theRest]);
    });

    it('should return an empty array when requesting a pagination offset that does not exist', () => {
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' },
        ],
        defaultOrderBy: 'created_at',
      };
      const inputProjects = {
        fields: { is_internal: false },
        paginate: { skip: 9999, limit: 10 },
      };

      return projectApp.getItems(specProject, inputProjects)
        .then((data) => {
          expect(data.models).to.have.length(0);
        });
    });

    it(`should order the results according to the "spec.${ACTION.SPEC_DEFAULT_ORDER_BY}" and "input.${ACTION.INPUT_ORDER_BY}" options`, () => {
      // -------
      // Profile
      // -------
      const specProfile = {
        modelName: 'Profile',
        defaultOrderBy: 'created_at',
      };
      const profilesDefaultOrder = {};

      // -------
      // Project
      // -------
      const specProject = {
        modelName: 'Project',
        fields: [
          { name: 'is_internal', type: 'Boolean' },
        ],
        defaultOrderBy: 'created_at',
      };
      const projectsDefaultOrder = {
        fields: { is_internal: false },
      };
      const projectsNameASC = {
        fields: { is_internal: false },
        orderBy: 'name',
      };

      const getProfilesInDefaultOrder = blogApp.getItems(specProfile, profilesDefaultOrder)
        .then((data) => {
          expect(data.models).to.have.length(11);
          expect(data.models[0]).to.contain({ id: 1 });
          expect(data.models[1]).to.contain({ id: 2 });
          expect(data.models[2]).to.contain({ id: 3 });
          expect(data.models[3]).to.contain({ id: 4 });
          expect(data.models[4]).to.contain({ id: 5 });
          expect(data.models[5]).to.contain({ id: 6 });
          expect(data.models[6]).to.contain({ id: 7 });
          expect(data.models[7]).to.contain({ id: 8 });
          expect(data.models[8]).to.contain({ id: 9 });
          expect(data.models[9]).to.contain({ id: 10 });
          expect(data.models[10]).to.contain({ id: 11 });
        });

      const getProjectsInDefaultOrder = projectApp.getItems(specProject, projectsDefaultOrder)
        .then((data) => {
          expect(data.models).to.have.length(10);
          expect(data.models[0]).to.contain({ id: 5 });
          expect(data.models[1]).to.contain({ id: 6 });
          expect(data.models[2]).to.contain({ id: 7 });
          expect(data.models[3]).to.contain({ id: 8 });
          expect(data.models[4]).to.contain({ id: 9 });
          expect(data.models[5]).to.contain({ id: 10 });
          expect(data.models[6]).to.contain({ id: 11 });
          expect(data.models[7]).to.contain({ id: 12 });
          expect(data.models[8]).to.contain({ id: 13 });
          expect(data.models[9]).to.contain({ id: 14 });
        });

      const getProjectsInNameASC = projectApp.getItems(specProject, projectsNameASC)
        .then((data) => {
          expect(data.models).to.have.length(10);
          expect(data.models[0]).to.contain({ id: 12 }); // A
          expect(data.models[1]).to.contain({ id: 5 });  // E
          expect(data.models[2]).to.contain({ id: 11 }); // H
          expect(data.models[3]).to.contain({ id: 6 });  // J
          expect(data.models[4]).to.contain({ id: 14 }); // K
          expect(data.models[5]).to.contain({ id: 9 });  // L
          expect(data.models[6]).to.contain({ id: 13 }); // N
          expect(data.models[7]).to.contain({ id: 7 });  // P
          expect(data.models[8]).to.contain({ id: 10 }); // T
          expect(data.models[9]).to.contain({ id: 8 });  // W
        });

      return Promise.all([
        getProfilesInDefaultOrder,
        getProjectsInDefaultOrder,
        getProjectsInNameASC,
      ]);
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'User';

      const spec = {
        modelName,
        defaultOrderBy: 'created_at',
      };

      const input = {
        loadDirect: ['roles:name'],
        associations: ['profiles'],
        paginate: { skip: 3, limit: 3 },
      };

      const globalLevel = blogAppJsonApi.getItems(spec, input)
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3);

          // Included...
          expect(payload).to.have.property('included');
          expect(payload.included[0]).to.contain({ type: 'Profile' });

          // Meta....
          expect(payload).to.have.property('meta');
          expect(payload.meta)
            .to.contain({
              total_items: 10,
              skip: 3,
              limit: 3,
            });

          // First Item....
          const firstItem = payload.data[0];
          expect(firstItem)
            .to.contain({
              type: modelName,
              id: 4,
            });

          expect(firstItem).to.have.property('attributes');
          expect(firstItem.attributes)
            .to.have.property('roles')
            .that.has.members(['admin', 'moderator', 'developer', 'blogger']);

          expect(firstItem).to.have.property('relationships');
          expect(firstItem.relationships).to.have.keys('profiles');
        });

      const methodLevel = blogApp.getItems(spec, input, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data')
            .that.is.an('array').that.has.lengthOf(3);

          // Included...
          expect(payload).to.have.property('included');
          expect(payload.included[0]).to.contain({ type: 'Profile' });

          // Meta....
          expect(payload).to.have.property('meta');
          expect(payload.meta)
            .to.contain({
              total_items: 10,
              skip: 3,
              limit: 3,
            });

          // First Item....
          const firstItem = payload.data[0];
          expect(firstItem)
            .to.contain({
              type: modelName,
              id: 4,
            });

          expect(firstItem).to.have.property('attributes');
          expect(firstItem.attributes)
            .to.have.property('roles')
            .that.has.members(['admin', 'moderator', 'developer', 'blogger']);

          expect(firstItem).to.have.property('relationships');
          expect(firstItem.relationships).to.have.keys('profiles');
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - getItems

  // -------------------
  // Testing: deleteItem
  // -------------------
  describe('deleteItem', () => {
    before(() => resetDB(['profiles', 'projects']));

    it('should return an error (404) when the requested resource is not found', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };
      const input = {
        fields: {
          id: 999,
        },
      };

      return expect(projectApp.deleteItem(spec, input))
        .to.eventually.be.rejectedWithJointStatusError(404);
    });

    it('should delete the resource when the spec is satisfied', () => {
      const spec = {
        modelName: 'Project',
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };

      const input = {
        fields: {
          id: 1,
        },
      };

      return projectApp.deleteItem(spec, input)
        .then((data) => {
          expect(data.attributes).to.be.empty;

          return expect(projectApp.getItem(spec, input))
            .to.eventually.be.rejectedWithJointStatusError(404);
        });
    });

    it(`should support the "${ACTION.SPEC_FIELDS_OPT_LOOKUP}" option, to handle authorization from the retrieved item`, () => {
      const userContext = {
        is_logged_in: true,
        id: 4,
        external_id: '304',
        username: 'the_manic_edge',
        roles: [],
        profile_ids: [1, 2, 3],
      };
      const authRules = { owner: 'me' };
      const authBundle = projectApp.buildAuthBundle(userContext, authRules);

      const spec = {
        modelName: 'Profile',
        fields: [
          { name: 'id', type: 'Number', required: true, lookup: true },
        ],
        auth: {
          ownerCreds: ['user_id => id'],
        },
      };

      const input = {
        fields: { id: 3 },
        authBundle,
      };

      return expect(projectApp.deleteItem(spec, input))
        .to.be.fulfilled;
    });

    it('should return in JSON API shape when payload format is set to "json-api"', () => {
      const modelName = 'Project';

      const spec = {
        modelName,
        fields: [
          { name: 'id', type: 'Number', required: true },
        ],
      };

      const globalLevel = projectAppJsonApi.deleteItem(spec, { fields: { id: 2 } })
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: null,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
            .that.is.empty;
        });

      const methodLevel = projectApp.deleteItem(spec, { fields: { id: 3 } }, 'json-api')
        .then((payload) => {
          // Top Level...
          expect(payload).to.have.property('data');
          expect(payload.data)
            .to.contain({
              type: modelName,
              id: null,
            });

          // Base Attributes...
          expect(payload.data).to.have.property('attributes')
            .that.is.empty;
        });

      return Promise.all([globalLevel, methodLevel]);
    });
  }); // END - deleteItem

});
