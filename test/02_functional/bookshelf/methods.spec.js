import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Joint from '../../../src';
import modelConfig from '../../configs/model-config';
import methodConfig from '../../configs/method-config';
import bookshelf from '../../db/bookshelf/bookshelf';
import { resetDB } from '../../db/bookshelf/db-utils';
import chaiHelpers from '../chai-helpers';

chai.use(chaiAsPromised);
chai.use(chaiHelpers);
const expect = chai.expect;

let joint = null;

describe('CUSTOM METHOD SIMULATION [bookshelf]', () => {
  before(() => {
    joint = new Joint({
      service: bookshelf,
    });
    joint.generate({ modelConfig, methodConfig, log: false });
  });

  // ---------------------------------------------------------------------------
  // Resource: AppContent
  // ---------------------------------------------------------------------------
  describe('AppContent', () => {
    before(() => resetDB());

    // -------------------
    // Method: saveContent
    // -------------------
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

        const noAppID = expect(joint.method.AppContent.saveContent(inputNoAppID))
          .to.eventually.be.rejectedWithJointStatusError(400);
        const noData = expect(joint.method.AppContent.saveContent(inputNoData))
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
      //   const noAppID = expect(joint.method.AppContent.saveContent(inputNoAppID))
      //     .to.eventually.be.rejectedWithJointStatusError(400);
      //   const noData = expect(joint.method.AppContent.saveContent(inputNoData))
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
      //   return joint.method.AppContent.saveContent(input)
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

        return joint.method.AppContent.saveContent(input)
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

        return joint.method.AppContent.saveContent(input)
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

    // ------------------
    // Method: getContent
    // ------------------
    describe('getContent', () => {
      it('should return an error (400) when the "app_id" field is not provided', () => {
        const input = {
          fields: {
            ignored_field: 'give-me-everything',
          },
        };

        const noAppID = expect(joint.method.AppContent.getContent(input))
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
      //   return joint.method.AppContent.getContent(input)
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

        return joint.method.AppContent.getContent(input)
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
  // Resource: User
  // ---------------------------------------------------------------------------
  describe('User', () => {

    // ------------------
    // Method: createUser
    // ------------------
    describe('createUser', () => {
      before(() => resetDB());

      it('should return an error (400) when the "username" field is not provided', () => {
        const email = 'mastablasta@mail.com';
        const displayName = 'Blasta!';

        const input = {
          fields: {
            email,
            display_name: displayName,
          },
        };

        return expect(joint.method.User.createUser(input))
          .to.eventually.be.rejectedWithJointStatusError(400);
      });

      it('should create a user when the "username" field is provided', () => {
        const username = 'mastablasta';

        const input = {
          fields: {
            username,
          },
        };

        return joint.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
              });
          });
      });

      it('should support the optionally provided fields: "external_id", "email", "display_name", "avatar_url"', () => {
        const username = 'the_edge_case';
        const externalID = '333.011';
        const email = 'the_edge_case@mail.com';
        const displayName = 'The Edge Case';
        const avatarURL = '//edgy.org/profile/333.011/avatar.png';

        const input = {
          fields: {
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            avatar_url: avatarURL,
          },
        };

        return joint.method.User.createUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                username,
                external_id: externalID,
                email,
                display_name: displayName,
                avatar_url: avatarURL,
              });
          });
      });
    }); // END - User.createUser

    // ------------------
    // Method: updateUser
    // ------------------
    describe('updateUser', () => {
      before(() => resetDB(['users']));

      it('should return an error (400) when the "id" field is not provided', () => {
        const displayName = 'Updated Name';

        const input = {
          fields: {
            identifier: 4,
            display_name: displayName,
          },
        };

        return expect(joint.method.User.updateUser(input))
          .to.eventually.be.rejectedWithJointStatusError(400);
      });

      it('should return an error (404) when the requested "id" does not exist', () => {
        const userID = 999;
        const displayName = 'Updated Name';

        const input = {
          fields: {
            id: userID,
            display_name: displayName,
          },
        };

        return expect(joint.method.User.updateUser(input))
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

        return joint.method.User.updateUser(input)
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

      it('should support updating the provided fields: "username", "email", "display_name", "avatar_url"', () => {
        const userID = 4;
        const username = 'updated_username';
        const externalID = 'I will not be updated';
        const email = 'updated_email';
        const displayName = 'Updated Display Name';
        const avatarURL = 'https://updated_avatar.jpg';

        const input = {
          fields: {
            id: userID,
            username,
            external_id: externalID,
            email,
            display_name: displayName,
            avatar_url: avatarURL,
          },
        };

        return joint.method.User.updateUser(input)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: '304',
                email,
                display_name: displayName,
                avatar_url: avatarURL,
              });
          });
      });
    }); // END - User.updateUser

    // ---------------
    // Method: getUser
    // ---------------
    describe('getUser', () => {
      before(() => resetDB(['users']));

      it('should return an error (400) when none of the required fields are provided: "id", "username", or "external_id"', () => {
        const input = {
          fields: {
            identifier: 4,
          },
        };

        return expect(joint.method.User.getUser(input))
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

        const viaID = expect(joint.method.User.getUser(inputWithID))
          .to.eventually.be.rejectedWithJointStatusError(404);
        const viaUsername = expect(joint.method.User.getUser(inputWithUsername))
          .to.eventually.be.rejectedWithJointStatusError(404);
        const viaExternalID = expect(joint.method.User.getUser(inputWithExternalID))
          .to.eventually.be.rejectedWithJointStatusError(404);

        return Promise.all([
          viaID,
          viaUsername,
          viaExternalID,
        ]);
      });

      it('should return the public attributes of a user with a valid "id", "username", or "external_id"', () => {
        const userID = 5;
        const username = 'segmented';
        const externalID = '305';

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

        const viaID = joint.method.User.getUser(inputWithID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: externalID,
              })
              .and.to.not.have.property('email');
          });

        const viaUsername = joint.method.User.getUser(inputWithUsername)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: externalID,
              })
              .and.to.not.have.property('email');
          });

        const viaExternalID = joint.method.User.getUser(inputWithExternalID)
          .then((data) => {
            expect(data)
              .to.have.property('attributes')
              .that.contains({
                id: userID,
                username,
                external_id: externalID,
              })
              .and.to.not.have.property('email');
          });

        return Promise.all([
          viaID,
          viaUsername,
          viaExternalID,
        ]);
      });
    }); // END - User.getUser

  }); // END - User
});
