import { describe, expect, it } from 'vitest'
import bookshelf from '../db/bookshelf/service'
import * as CoreUtils from '../../src/core/core-utils'

describe('CORE-UTILS', () => {
  // ---------------------------------------
  // Testing: determineServiceKeyFromService
  // ---------------------------------------
  describe('determineServiceKeyFromService', () => {
    it('should return null when a service is not provided', () => {
      const service = null
      expect(CoreUtils.determineServiceKeyFromService(service)).toBeNull()
    })

    it('should return null when an unrecognized service is provided', () => {
      const service = {
        version: '0.0.0',
        data: [],
        fauxLogic: () => {
          return null
        }
      }
      expect(CoreUtils.determineServiceKeyFromService(service)).toBeNull()
    })

    it('should return "bookshelf" when the bookshelf service is provided', () => {
      const service = bookshelf
      expect(CoreUtils.determineServiceKeyFromService(service)).toBe('bookshelf')
    })
  })

  // ------------------------------
  // Testing: parseAssociationPath
  // ------------------------------
  describe('parseAssociationPath', () => {
    it('should return null when a "direct" path string cannot be parsed', () => {
      // Incomplete path (1 part)
      let path = 'User.id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Missing model/field (on part 2)
      path = 'profile_id => id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()
    })

    it('should return null when a "through" path string cannot be parsed', () => {
      // Incomplete path (3 parts)
      let path = 'profile_id => Profile.user_id => User.id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Invalid path (4+ parts)
      path = 'profile_id => Profile.id => Profile.user_id => User.id => User.username'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Missing model/field (on part 2)
      path = 'profile_id => id => Profile.user_id => User.id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Missing model/field (on part 3)
      path = 'profile_id => Profile.id => user_id => User.id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Missing model/field (on part 4)
      path = 'profile_id => Profile.id => Profile.user_id => id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()

      // Mis-mathing model names (from part 3 and 4)
      path = 'profile_id => Profile.id => Other.user_id => User.id'
      expect(CoreUtils.parseAssociationPath(path)).toBeNull()
    })

    it.only('should parse a valid "direct" path string', () => {
      // Expected format...
      const pathNoModelOnSource = 'profile_id => Profile.id'
      const infoNoModelOnSource = CoreUtils.parseAssociationPath(pathNoModelOnSource)

      // Source with model...
      const pathWithModelOnSource = 'Project.profile_id => Profile.id'
      const infoWithModelOnSource = CoreUtils.parseAssociationPath(pathWithModelOnSource)

      expect(infoNoModelOnSource).toEqual(infoWithModelOnSource)
      expect(infoNoModelOnSource).toMatchInlineSnapshot(`
        {
          "sourceField": "profile_id",
          "targetField": "id",
          "targetModelName": "Profile",
        }
      `)
    })
  })
})
