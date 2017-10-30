import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ACTION from '../../../src/actions/action-constants';
import Joint from '../../../src';
import appMgmtModels from '../../scenarios/app-mgmt/model-config';
import appMgmtMethods from '../../scenarios/app-mgmt/method-config';
import projectAppModels from '../../scenarios/project-app/model-config';
import projectAppMethods from '../../scenarios/project-app/method-config';
import blogAppModels from '../../scenarios/blog-app/model-config';
import blogAppMethods from '../../scenarios/blog-app/method-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let appMgmt = null;
let projectApp = null;
let blogApp = null;

describe('CUSTOM METHOD SIMULATION [bookshelf]', () => {
  before(() => {
    // --------
    // App Mgmt
    // --------
    appMgmt = new Joint({ service: bookshelf });
    appMgmt.generate({ modelConfig: appMgmtModels, methodConfig: appMgmtMethods, log: false });

    // -----------
    // Project App
    // -----------
    projectApp = new Joint({ service: bookshelf });
    projectApp.generate({ modelConfig: projectAppModels, methodConfig: projectAppMethods, log: false });

    // --------
    // Blog App
    // --------
    blogApp = new Joint({ service: bookshelf });
    blogApp.generate({ modelConfig: blogAppModels, methodConfig: blogAppMethods, log: false });
  });

  // ---------------------------------------------------------------------------
  // Resource: AppContent (app-mgmt)
  // ---------------------------------------------------------------------------
  describe('AppContent', () => {
    before(() => resetDB());

    // -------------------------------------------------------------------------
    // Method: saveContent
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'app_id', type: 'String', required: true, lookupField: true },
    //     { name: 'data', type: 'JSON', required: true },
    //     { name: 'key', type: 'String', required: true },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('saveContent', () => {
      it('should return an error (400) when the "app_id" and "data" fields are not provided', () => {
        const appID = 'failed-app';
        const appContent = { appContent: { a: true, b: 'testMe', c: { deep: 1000 } } };

        const inputNoAppID = {
          fields: {
            data: appContent,
          },
        };
        const inputNoData = {
          fields: {
            app_id: appID,
          },
        };

        const noAppID = expect(appMgmt.method.AppContent.saveContent(inputNoAppID))
          .to.eventually.be.rejectedWithJointStatusError(400);
        const noData = expect(appMgmt.method.AppContent.saveContent(inputNoData))
          .to.eventually.be.rejectedWithJointStatusError(400);

        return Promise.all([
          noAppID,
          noData,
        ]);
      });

      // TODO: Complete support for AND/OR logic with "lookup" field option !!!

      // it('should return an error (400) when the "app_id" and "data" fields are not provided', () => {
      //   const appID = 'failed-app';
      //   const appContent = { appContent: { a: true, b: 'testMe', c: { deep: 1000 } } };
      //
      //   const inputNoAppID = {
      //     fields: {
      //       data: appContent,
      //     },
      //   };
      //   const inputNoData = {
      //     fields: {
      //       app_id: appID,
      //     },
      //   };
      //
      //   const noAppID = expect(appMgmt.method.AppContent.saveContent(inputNoAppID))
      //     .to.eventually.be.rejectedWithJointStatusError(400);
      //   const noData = expect(appMgmt.method.AppContent.saveContent(inputNoData))
      //     .to.eventually.be.rejectedWithJointStatusError(400);
      //
      //   return Promise.all([
      //     noAppID,
      //     noData,
      //   ]);
      // });

      // it('should save a new package of data for a provided "app_id", automatically saving the key value as "default"', () => {
      //   const appID = 'trendy-boutique';
      //   const appContent = {
      //     trending: {
      //       men: 'hats',
      //       women: 'belts',
      //       kids: 'mobile-phone-accessories',
      //     },
      //     newBrands: ['twisted-kids', 'forlorn', 'girl-in-the-rain'],
      //   };
      //
      //   const input = {
      //     fields: {
      //       app_id: appID,
      //       data: appContent,
      //     },
      //   };
      //
      //   return appMgmt.method.AppContent.saveContent(input)
      //     .then((data) => {
      //       expect(data.attributes.app_id).to.equal(appID);
      //       expect(data.attributes.key).to.equal('default');
      //
      //       const contentJSON = JSON.parse(data.attributes.data);
      //       expect(contentJSON.trending.men).to.equal('hats');
      //       expect(contentJSON.trending.women).to.equal('belts');
      //       expect(contentJSON.newBrands).to.be.an('array').that.has.length(3);
      //     });
      // });

      it('should save a new package of data for a provided "app_id" and "key"', () => {
        const appID = 'trendy-boutique';
        const key = 'winter-promo';
        const appContent = {
          trending: {
            men: 'pleather-jackets',
            women: 'faux-cotton-socks',
            kids: 'serial-killer-pillows',
          },
          discountBreakpoints: ['20%', '30%', '50%'],
        };

        const input = {
          fields: {
            app_id: appID,
            key,
            data: appContent,
          },
        };

        return appMgmt.method.AppContent.saveContent(input)
          .then((data) => {
            expect(data.attributes.id).to.equal(1);
            expect(data.attributes.app_id).to.equal(appID);
            expect(data.attributes.key).to.equal(key);

            const contentJSON = JSON.parse(data.attributes.data);
            expect(contentJSON.trending.men).to.equal('pleather-jackets');
            expect(contentJSON.trending.women).to.equal('faux-cotton-socks');
            expect(contentJSON.discountBreakpoints).to.be.an('array').that.has.length(3);
          });
      });

      it('should update an existing package of data for a provided "app_id" and "key"', () => {
        const appID = 'trendy-boutique';
        const key = 'winter-promo';
        const appContent = {
          trending: {
            men: 'mascara',
            women: 'faux-cotton-socks',
          },
          discountBreakpoints: ['10%', '20%', '30%', '35%', '40%'],
        };

        const input = {
          fields: {
            app_id: appID,
            key,
            data: appContent,
          },
        };

        return appMgmt.method.AppContent.saveContent(input)
          .then((data) => {
            expect(data.attributes.id).to.equal(1);
            expect(data.attributes.app_id).to.equal(appID);
            expect(data.attributes.key).to.equal(key);

            const contentJSON = JSON.parse(data.attributes.data);
            expect(contentJSON.trending.men).to.equal('mascara');
            expect(contentJSON.trending.women).to.equal('faux-cotton-socks');
            expect(contentJSON.discountBreakpoints).to.be.an('array').that.has.length(5);
          });
      });
    }); // END - AppContent.saveContent

    // -------------------------------------------------------------------------
    // Method: getContent
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'app_id', type: 'String', required: true },
    //     { name: 'key', type: 'String', required: true },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('getContent', () => {
      it('should return an error (400) when the "app_id" field is not provided', () => {
        const input = {
          fields: {
            ignored_field: 'give-me-everything',
          },
        };

        const noAppID = expect(appMgmt.method.AppContent.getContent(input))
          .to.eventually.be.rejectedWithJointStatusError(400);

        return Promise.all([
          noAppID,
        ]);
      });

      // TODO: Complete support for AND/OR logic with "lookup" field option !!!

      // it('should retrieve the "default" package of data for a provided "app_id"', () => {
      //   const appID = 'trendy-boutique';
      //
      //   const input = {
      //     fields: {
      //       app_id: appID,
      //     },
      //   };
      //
      //   return appMgmt.method.AppContent.getContent(input)
      //     .then((data) => {
      //       expect(data.attributes.app_id).to.equal(appID);
      //       expect(data.attributes.key).to.equal('default');
      //
      //       const contentJSON = JSON.parse(data.attributes.data);
      //       expect(contentJSON.trending.men).to.equal('hats');
      //       expect(contentJSON.trending.women).to.equal('belts');
      //       expect(contentJSON.newBrands).to.be.an('array').that.has.length(3);
      //     });
      // });

      it('should retrieve the requested package of data for a provided "app_id" and "key"', () => {
        const appID = 'trendy-boutique';
        const key = 'winter-promo';

        const input = {
          fields: {
            app_id: appID,
            key,
          },
        };

        return appMgmt.method.AppContent.getContent(input)
          .then((data) => {
            expect(data.attributes.app_id).to.equal(appID);
            expect(data.attributes.key).to.equal(key);

            const contentJSON = JSON.parse(data.attributes.data);
            expect(contentJSON.trending.men).to.equal('mascara');
            expect(contentJSON.trending.women).to.equal('faux-cotton-socks');
            expect(contentJSON.discountBreakpoints).to.be.an('array').that.has.length(5);
          });
      });
    }); // END - AppContent.getContent

  }); // END - AppContent

  // ---------------------------------------------------------------------------
  // Resource: User (blog-app)
  // ---------------------------------------------------------------------------
  describe('User', () => {

    // -------------------------------------------------------------------------
    // Method: createUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'username', type: 'String', required: true },
    //     { name: 'external_id', type: 'String' },
    //     { name: 'email', type: 'String' },
    //     { name: 'display_name', type: 'String' },
    //     { name: 'first_name', type: 'String' },
    //     { name: 'last_name', type: 'String' },
    //     { name: 'preferred_locale', type: 'String' },
    //     { name: 'avatar_url', type: 'String' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('createUser', () => {
      before(() => resetDB());

      it('should return an error (400) when the required field is not provided', () => {
        const email = 'mastablasta@mail.com';
        const displayName = 'Blasta!';

        const input = {
          fields: {
            email,
            display_name: displayName,
          },
        };

        return expect(blogApp.method.User.createUser(input))
          .to.eventually.be.rejectedWithJointStatusError(400);
      });

      it('should create a user when the required field is provided', () => {
        const username = 'mastablasta';

        const input = {
          fields: {
            username,
          },
        };

        return blogApp.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
              });
          });
      });

      it('should support all accepted fields in the spec', () => {
        const username = 'the_edge_case';
        const externalID = '333.011';
        const email = 'the_edge_case@mail.com';
        const displayName = 'The Edge Case';
        const firstName = 'Edge';
        const lastName = 'Case';
        const preferredLocale = 'zh-CN';
        const avatarURL = '//edgy.org/profile/333.011/avatar.png';

        const input = {
          fields: {
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
            preferred_locale: preferredLocale,
            avatar_url: avatarURL,
          },
        };

        return blogApp.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
                external_id: externalID,
                email,
                display_name: displayName,
                first_name: firstName,
                last_name: lastName,
                preferred_locale: preferredLocale,
                avatar_url: avatarURL,
              });
          });
      });
    }); // END - User.createUser

    // -------------------------------------------------------------------------
    // Method: updateUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', required: true, lookupField: true },
    //     { name: 'username', type: 'String' },
    //     { name: 'email', type: 'String' },
    //     { name: 'display_name', type: 'String' },
    //     { name: 'first_name', type: 'String' },
    //     { name: 'last_name', type: 'String' },
    //     { name: 'preferred_locale', type: 'String' },
    //     { name: 'avatar_url', type: 'String' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe('updateUser', () => {
      before(() => resetDB(['users']));

      it('should return an error (400) when the required field is not provided', () => {
        const displayName = 'Updated Name';

        const input = {
          fields: {
            identifier: 4,
            display_name: displayName,
          },
        };

        return expect(blogApp.method.User.updateUser(input))
          .to.eventually.be.rejectedWithJointStatusError(400);
      });

      it('should return an error (404) when the requested user does not exist', () => {
        const userID = 999;
        const displayName = 'Updated Name';

        const input = {
          fields: {
            id: userID,
            display_name: displayName,
          },
        };

        return expect(blogApp.method.User.updateUser(input))
          .to.eventually.be.rejectedWithJointStatusError(404);
      });

      it('should update an existing user for a single field', () => {
        const userID = 4;
        const displayName = 'Updated Name';

        const input = {
          fields: {
            id: userID,
            display_name: displayName,
          },
        };

        return blogApp.method.User.updateUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username: 'the_manic_edge',
                external_id: '304',
                email: 'the-manic-edge@demo.com',
                display_name: displayName,
              });
          });
      });

      it('should support all accepted fields in the spec', () => {
        const userID = 4;
        const username = 'updated_username';
        const externalID = 'I will not be updated';
        const email = 'updated_email';
        const displayName = 'Updated Display Name';
        const firstName = 'The New First';
        const lastName = 'The New Last';
        const preferredLocale = 'zh-CN';
        const avatarURL = 'https://updated_avatar.jpg';

        const input = {
          fields: {
            id: userID,
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
            preferred_locale: preferredLocale,
            avatar_url: avatarURL,
          },
        };

        return blogApp.method.User.updateUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: '304',
                email,
                display_name: displayName,
                first_name: firstName,
                last_name: lastName,
                preferred_locale: preferredLocale,
                avatar_url: avatarURL,
              });
          });
      });
    }); // END - User.updateUser

    // -------------------------------------------------------------------------
    // Method: getUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', requiredOr: true },
    //     { name: 'username', type: 'String', requiredOr: true },
    //     { name: 'external_id', type: 'String', requiredOr: true },
    //   ],
    //   fieldsToReturn: ['id', 'username', 'display_name', 'avatar_url'],
    // },
    // -------------------------------------------------------------------------
    describe('getUser', () => {
      before(() => resetDB(['users']));

      it('should return an error (400) when none of the required fields are provided', () => {
        const input = {
          fields: {
            identifier: 4,
          },
        };

        return expect(blogApp.method.User.getUser(input))
          .to.eventually.be.rejectedWithJointStatusError(400);
      });

      it('should return an error (404) when the requested user does not exist', () => {
        const userID = 999;
        const username = 'not-segmented';
        const externalID = '999305';

        const inputWithID = {
          fields: {
            id: userID,
          },
        };
        const inputWithUsername = {
          fields: {
            username,
          },
        };
        const inputWithExternalID = {
          fields: {
            external_id: externalID,
          },
        };

        const viaID = expect(blogApp.method.User.getUser(inputWithID))
          .to.eventually.be.rejectedWithJointStatusError(404);
        const viaUsername = expect(blogApp.method.User.getUser(inputWithUsername))
          .to.eventually.be.rejectedWithJointStatusError(404);
        const viaExternalID = expect(blogApp.method.User.getUser(inputWithExternalID))
          .to.eventually.be.rejectedWithJointStatusError(404);

        return Promise.all([
          viaID,
          viaUsername,
          viaExternalID,
        ]);
      });

      it(`should return only the fields specified by the "${ACTION.SPEC_FIELDS_TO_RETURN}" option`, () => {
        const userID = 5;
        const username = 'segmented';
        const externalID = '305';
        const displayName = 'Segmented';

        const inputWithID = {
          fields: {
            id: userID,
          },
        };
        const inputWithUsername = {
          fields: {
            username,
          },
        };
        const inputWithExternalID = {
          fields: {
            external_id: externalID,
          },
        };

        const viaID = blogApp.method.User.getUser(inputWithID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              });

            expect(data.attributes).to.have.property('avatar_url');
            expect(data.attributes).to.not.have.property('email');
            expect(data.attributes).to.not.have.property('external_id');
          });

        const viaUsername = blogApp.method.User.getUser(inputWithUsername)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              });

            expect(data.attributes).to.have.property('avatar_url');
            expect(data.attributes).to.not.have.property('email');
            expect(data.attributes).to.not.have.property('external_id');
          });

        const viaExternalID = blogApp.method.User.getUser(inputWithExternalID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                display_name: displayName,
              });

            expect(data.attributes).to.have.property('avatar_url');
            expect(data.attributes).to.not.have.property('email');
            expect(data.attributes).to.not.have.property('external_id');
          });

        return Promise.all([
          viaID,
          viaUsername,
          viaExternalID,
        ]);
      });
    }); // END - User.getUser

    // -------------------------------------------------------------------------
    // Method: getUsers
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'preferred_locale', type: 'String' },
    //   ],
    //   fieldsToReturn: ['id', 'username', 'display_name', 'avatar_url'],
    //   defaultOrderBy: '-created_at,username',
    // },
    // -------------------------------------------------------------------------
    describe('getUsers', () => {
      before(() => resetDB(['users']));

      it('should return all users in the order defined by the spec, when no fields are provided');

      it('should return the filtered set of users when an accepted field is provided');

      it(`should return only the fields specified by the "${ACTION.SPEC_FIELDS_TO_RETURN}" option`);

    }); // END - User.getUsers

    // -------------------------------------------------------------------------
    // Method: deleteUser
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'id', type: 'Number', requiredOr: true },
    //     { name: 'username', type: 'String', requiredOr: true },
    //     { name: 'external_id', type: 'String', requiredOr: true },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe.skip('deleteUser', () => {
      before(() => resetDB(['users']));

    }); // END - User.deleteUser

  }); // END - User

  // ---------------------------------------------------------------------------
  // Resource: Project (project-app)
  // ---------------------------------------------------------------------------
  describe('Project', () => {
    before(() => resetDB());

    // -------------------------------------------------------------------------
    // Method: createProject
    // -------------------------------------------------------------------------
    // spec: {
    //   fields: [
    //     { name: 'name', type: 'String', required: true },
    //     { name: 'alias', type: 'String' },
    //     { name: 'image_url', type: 'String' },
    //     { name: 'location', type: 'String' },
    //     { name: 'brief_description', type: 'String' },
    //     { name: 'full_description', type: 'String' },
    //     { name: 'is_internal', type: 'Boolean', defaultValue: false },
    //     { name: 'status_code', type: 'Number' },
    //     { name: 'started_at', type: 'String' },
    //     { name: 'finished_at', type: 'String' },
    //     { name: 'created_by', type: 'Number' },
    //   ],
    // },
    // -------------------------------------------------------------------------
    describe.skip('createProject', () => {
    }); // END - Project.createProject

  }); // END - Project

});
