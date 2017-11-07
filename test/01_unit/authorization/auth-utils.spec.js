import chai from 'chai';
import * as AuthUtils from '../../../src/authorization/auth-utils';

const expect = chai.expect;

describe('AUTH-UTILS', () => {
  // -----------------------
  // Testing: buildAuthBundle
  // -----------------------
  describe('buildAuthBundle', () => {
    it('should return the expected authBundle package, in a server-side request scenario', () => {
      const settings = {};

      const context = {
        is_logged_in: true,
        user_id: 1,
        external_id: 10000,
        username: 'moderator-blogger',
        display_name: 'Moderator Blogger',
        roles: ['moderator', 'blogger'],
        profile_ids: [5, 7, 9],
      };

      const rules = { owner: 'me', rolesAll: ['moderator', 'blogger'] };

      expect(AuthUtils.buildAuthBundle(settings, context, rules))
        .to.deep.equal({
          rules,
          user: context,
        });
    });

    it('should return the expected authBundle package, in a client-side HTTP request scenario', () => {
      const settings = {
        auth: {
          sessionNameForUser: 'joint_user',
        },
      };

      const mockSessionInfo = {
        is_logged_in: true,
        user_id: 1,
        external_id: 10000,
        username: 'moderator-blogger',
        display_name: 'Moderator Blogger',
        roles: ['moderator', 'blogger'],
        profile_ids: [5, 7, 9],
      };

      const mockRequest = {
        method: 'POST',
        originalUrl: '/api/blog/post/7/unpublish',
        session: {
          joint_user: mockSessionInfo,
        },
      };

      const rules = { owner: 'me', rolesAny: ['moderator', 'blogger'] };

      expect(AuthUtils.buildAuthBundle(settings, mockRequest, rules))
        .to.deep.equal({
          request_method: 'POST',
          request_uri: '/api/blog/post/7/unpublish',
          request_headers: null,
          rules,
          user: mockSessionInfo,
        });
    });
  }); // END - buildAuthBundle

  // -----------------------
  // Testing: isAllowedOwner
  // -----------------------
  describe('isAllowedOwner', () => {
    it('should return "false" when the ownerCreds property does not exist in the session', () => {
      const mockSessionInfo = {
        is_logged_in: true,
        id: 1,
        external_id: 10000,
        username: 'moderator-blogger',
        display_name: 'Moderator Blogger',
        avatar_url: 'http://insane.avatars.com/a7fc83f9-201e-490f-8bdf-58b56a647eb3.png',
        roles: ['moderator', 'blogger'],
        profile_ids: [5, 7, 9],
        default_profile_status_id: 3,
      };

      const ownerToCheck = 'me';
      const ownerCreds = { profile_name: 5 };

      const result = AuthUtils.isAllowedOwner(ownerToCheck, ownerCreds, mockSessionInfo);
      expect(result).to.equal(false);
    });

    it('should support owner authorization checks on both atomic and array session values', () => {
      const mockSessionInfo = {
        is_logged_in: true,
        id: 1,
        external_id: 10000,
        username: 'moderator-blogger',
        display_name: 'Moderator Blogger',
        avatar_url: 'http://insane.avatars.com/a7fc83f9-201e-490f-8bdf-58b56a647eb3.png',
        roles: ['moderator', 'blogger'],
        profile_ids: [5, 7, 9],
        default_profile_status_id: 3,
      };

      const ownerToCheck = 'me';
      const ownerCredsFromArray = { profile_ids: 5 };
      const ownerCredsFromAtomic = { external_id: 10000 };

      const resultFromArray = AuthUtils.isAllowedOwner(ownerToCheck, ownerCredsFromArray, mockSessionInfo);
      const resultFromAtomic = AuthUtils.isAllowedOwner(ownerToCheck, ownerCredsFromAtomic, mockSessionInfo);

      expect(resultFromArray).to.equal(true);
      expect(resultFromAtomic).to.equal(true);
    });
  }); // END - isAllowedOwner
});
