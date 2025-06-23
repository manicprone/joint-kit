import { describe, expect, it } from 'vitest'
import stringUtils from '../../src/utils/string-utils'

describe('STRING-UTILS', () => {
  describe('escapeSqlLike', () => {
    it('should escape percent signs', () => {
      expect(stringUtils.escapeSqlLike('test%value')).toBe('test\\%value')
    })

    it('should escape underscores', () => {
      expect(stringUtils.escapeSqlLike('test_value')).toBe('test\\_value')
    })

    it('should escape backslashes', () => {
      expect(stringUtils.escapeSqlLike('test\\value')).toBe('test\\\\value')
    })

    it('should escape multiple special characters', () => {
      expect(stringUtils.escapeSqlLike('test%_\\value')).toBe('test\\%\\_\\\\value')
    })

    it('should handle strings without special characters', () => {
      expect(stringUtils.escapeSqlLike('normal text')).toBe('normal text')
    })

    it('should handle empty strings', () => {
      expect(stringUtils.escapeSqlLike('')).toBe('')
    })

    it('should handle non-string inputs', () => {
      expect(stringUtils.escapeSqlLike(null)).toBe(null)
      expect(stringUtils.escapeSqlLike(undefined)).toBe(undefined)
      expect(stringUtils.escapeSqlLike(123)).toBe(123)
    })

    it('should handle real-world examples with special characters', () => {
      expect(stringUtils.escapeSqlLike('user\\name')).toBe('user\\\\name')
      expect(stringUtils.escapeSqlLike('file_name%')).toBe('file\\_name\\%')
      expect(stringUtils.escapeSqlLike('path\\to\\file')).toBe('path\\\\to\\\\file')
    })
  })
})
