import { describe, expect, it } from 'vitest'
import * as ActionUtils from '../../src/actions/action-utils'
import ACTION from '../../src/core/constants/action-constants'

// --------------------
// LIBRARY action-utils
// --------------------
describe('ACTION-UTILS', () => {
  // ----------------------------
  // Testing: checkRequiredFields
  // ----------------------------
  describe('checkRequiredFields', () => {
    it(`should fail if input has missing "${ACTION.SPEC_FIELDS_OPT_REQUIRED}" fields, and return an array of the missing field names (as "all")`, () => {
      const fieldSpec = [
        { name: 'user_id', type: 'Number', required: true },
        { name: 'profile_id', type: 'Number', required: true },
        { name: 'title', type: 'String', required: true },
        { name: 'category', type: 'String', required: true },
        { name: 'summary', type: 'String' },
      ]

      const fieldData = {
        profile_id: 1,
        title: 'My First Post',
      }

      const result = ActionUtils.checkRequiredFields(fieldSpec, fieldData)
      expect(result).toEqual({
        satisfied: false,
        missing: {
          all: ['user_id', 'category'],
        },
      })
    })

    it(`should fail if input has not satisfied any of the "${ACTION.SPEC_FIELDS_OPT_REQUIRED_OR}" fields, and return an array of the missing options (as "oneOf")`, () => {
      const fieldSpec = [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'username', type: 'Number', requiredOr: true },
        { name: 'email', type: 'String' },
        { name: 'display_name', type: 'String', requiredOr: false },
      ]

      const fieldData = {
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
      }

      const result = ActionUtils.checkRequiredFields(fieldSpec, fieldData)
      expect(result).toEqual({
        satisfied: false,
        missing: {
          oneOf: ['id', 'username'],
        },
      })
    })

    it('should always pass when no fields are required', () => {
      const fieldSpec = [
        { name: 'profile_id', type: 'Number' },
        { name: 'title', type: 'String', required: false },
        { name: 'summary', type: 'String', required: false },
        { name: 'keywords', type: 'String', requiredOr: false },
      ]

      const fieldData = {
        profile_id: 1,
        title: 'My First Post',
        improper_field: 'I will not be processed',
      }

      const nullSpec = ActionUtils.checkRequiredFields(null, fieldData)
      const emptySpec = ActionUtils.checkRequiredFields([], fieldData)
      const noRequiredSpec = ActionUtils.checkRequiredFields(fieldSpec, fieldData)
      const nullInput = ActionUtils.checkRequiredFields(fieldSpec, null)
      const emptyInput = ActionUtils.checkRequiredFields(fieldSpec, {})

      expect(nullSpec).toEqual({ satisfied: true })
      expect(emptySpec).toEqual({ satisfied: true })
      expect(noRequiredSpec).toEqual({ satisfied: true })
      expect(nullInput).toEqual({ satisfied: true })
      expect(emptyInput).toEqual({ satisfied: true })
    })

    it(`should pass when the input satisfies the "${ACTION.SPEC_FIELDS_OPT_REQUIRED}" fields`, () => {
      const fieldSpec = [
        { name: 'profile_id', type: 'Number', required: true },
        { name: 'status_id', type: 'Number', required: true },
        { name: 'title', type: 'String', required: true },
        { name: 'category', type: 'String', required: true },
        { name: 'summary', type: 'String', required: false },
        { name: 'keywords', type: 'String' },
      ]

      const fieldData = {
        profile_id: 1,
        status_id: 0,
        title: 'My First Post',
        category: 'Transhumanism',
      }

      const result = ActionUtils.checkRequiredFields(fieldSpec, fieldData)
      expect(result).toEqual({ satisfied: true })
    })

    it(`should support the combined usage of "${ACTION.SPEC_FIELDS_OPT_REQUIRED_OR}" and "${ACTION.SPEC_FIELDS_OPT_REQUIRED}" fields`, () => {
      const fieldSpecRequiredOrOnly = [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'username', type: 'Number', requiredOr: true },
        { name: 'email', type: 'String' },
        { name: 'display_name', type: 'String', requiredOr: false },
      ]
      const fieldSpecBothTypes = [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'username', type: 'Number', requiredOr: true },
        { name: 'email', type: 'String' },
        { name: 'display_name', type: 'String', requiredOr: false },
        { name: 'external_id', type: 'Number', required: true },
      ]

      const fieldData01 = {
        id: 1,
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
        external_id: '10000',
      }
      const fieldData02 = {
        username: 'the-thrilla',
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
      }
      const fieldData03 = {
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
        external_id: '10000',
      }
      const fieldData04 = {
        id: 1,
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
      }
      const fieldData05 = {
        email: 'the-thrilla@fantasmo.com',
        display_name: 'The Thrilla',
      }

      const testCase01 = ActionUtils.checkRequiredFields(fieldSpecRequiredOrOnly, fieldData01)
      expect(testCase01).toEqual({ satisfied: true })

      const testCase02 = ActionUtils.checkRequiredFields(fieldSpecRequiredOrOnly, fieldData02)
      expect(testCase02).toEqual({ satisfied: true })

      const testCase03 = ActionUtils.checkRequiredFields(fieldSpecRequiredOrOnly, fieldData03)
      expect(testCase03).toEqual({
        satisfied: false,
        missing: {
          oneOf: ['id', 'username'],
        },
      })

      const testCase04 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData01)
      expect(testCase04).toEqual({ satisfied: true })

      const testCase05 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData04)
      expect(testCase05).toEqual({
        satisfied: false,
        missing: {
          all: ['external_id'],
        },
      })

      const testCase06 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData05)
      expect(testCase06).toEqual({
        satisfied: false,
        missing: {
          all: ['external_id'],
          oneOf: ['id', 'username'],
        },
      })
    })
  }) // END - checkRequiredFields

  // ---------------------------
  // Testing: getLookupFieldData
  // ---------------------------
  describe('getLookupFieldData', () => {
    it('should return null when the spec does not define a lookup field', () => {
      const fieldSpec = [
        { name: 'id', type: 'Number', required: true, lookup: false },
        { name: 'external_id', type: 'String', lookupOr: false },
        { name: 'slug', type: 'String', lookupOr: false },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldData = {
        id: 1,
        slug: 'post-001',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpec, fieldData))
        .toBeNull()
    })

    it('should return null when the input does not provide a matching lookup field data pair', () => {
      const fieldSpecLookup = [
        { name: 'id', type: 'Number', required: true, lookup: true },
        { name: 'slug', type: 'String' },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]
      const fieldSpecLookupOr = [
        { name: 'id', type: 'Number', lookupOr: true },
        { name: 'external_id', type: 'String', lookupOr: true },
        { name: 'slug', type: 'String' },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldData = {
        title: 'Updated Post Title',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpecLookup, fieldData))
        .toBeNull()
      expect(ActionUtils.getLookupFieldData(fieldSpecLookupOr, fieldData))
        .toBeNull()
    })

    it('should return all required lookup fields', () => {
      const fieldSpec = [
        { name: 'id', type: 'Number', lookup: true },
        { name: 'key', type: 'String', lookup: true },
        { name: 'full_version', type: 'Boolean', lookup: true },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldData = {
        id: 333,
        key: 'omega',
        full_version: true,
        title: 'Updated Post Title',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpec, fieldData))
        .toEqual({
          id: { value: 333, matchStrategy: 'exact' },
          key: { value: 'omega', matchStrategy: 'exact' },
          full_version: { value: true, matchStrategy: 'exact' },
        })
    })

    it('should return the first matching lookup field data pair in an OR set', () => {
      const fieldSpecLookupOr = [
        { name: 'id', type: 'Number', lookupOr: true },
        { name: 'external_id', type: 'String', lookupOr: true },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldDataWithSecondOr = {
        external_id: 'external-id-333',
        title: 'Updated Post Title',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpecLookupOr, fieldDataWithSecondOr))
        .toEqual({ external_id: { value: 'external-id-333', matchStrategy: 'exact' } })
    })

    it(`should return the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" on a required lookup field, when the input does not provide the data`, () => {
      const fieldSpecLookup01 = [
        { name: 'key', type: 'String', defaultValue: 'alpha', lookup: true },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]
      const fieldSpecLookup02 = [
        { name: 'id', type: 'Number', lookup: true },
        { name: 'key', type: 'String', defaultValue: 'alpha', lookup: true },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldDataNoKey = {
        id: 333,
        title: 'Updated Post Title',
      }
      const fieldDataWithKey = {
        id: 333,
        key: 'beta',
        title: 'Updated Post Title',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpecLookup01, fieldDataNoKey))
        .toEqual({ key: { value: 'alpha', matchStrategy: 'exact' } })
      expect(ActionUtils.getLookupFieldData(fieldSpecLookup02, fieldDataNoKey))
        .toEqual({
          id: { value: 333, matchStrategy: 'exact' },
          key: { value: 'alpha', matchStrategy: 'exact' },
        })
      expect(ActionUtils.getLookupFieldData(fieldSpecLookup02, fieldDataWithKey))
        .toEqual({
          id: { value: 333, matchStrategy: 'exact' },
          key: { value: 'beta', matchStrategy: 'exact' },
        })
    })

    it(`should ignore the "${ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE}" on a "${ACTION.SPEC_FIELDS_OPT_LOOKUP_OR}" field`, () => {
      const fieldSpec = [
        { name: 'id', type: 'Number', lookupOr: true },
        { name: 'slug', type: 'String', defaultValue: 'item-011', lookupOr: true },
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
      ]

      const fieldData = {
        title: 'Updated Post Title',
      }

      expect(ActionUtils.getLookupFieldData(fieldSpec, fieldData))
        .toBeNull()
    })
  }) // END - getLookupFieldData

  // ------------------------
  // Testing: parseOwnerCreds
  // ------------------------
  describe('parseOwnerCreds', () => {
    it(`should return an empty object when the spec does not define "${ACTION.SPEC_AUTH_OWNER_CREDS}" requirements`, () => {
      const authSpecNoCreds = {}

      const authSpecEmptyCreds = {}
      authSpecEmptyCreds[ACTION.SPEC_AUTH_OWNER_CREDS] = []

      const fieldData = {
        profile_id: 1,
        user_id: 33,
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpecNoCreds, fieldData)).toEqual({})
      expect(ActionUtils.parseOwnerCreds(authSpecEmptyCreds, fieldData)).toEqual({})
    })

    it(`should return an empty object when the fieldData does not contain any of the fields described in the "${ACTION.SPEC_AUTH_OWNER_CREDS}" spec`, () => {
      const authSpec = {}
      authSpec[ACTION.SPEC_AUTH_OWNER_CREDS] = ['user_id', 'profile_id']

      const fieldData = {
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpec, fieldData)).toEqual({})
    })

    it(`should return the first matching fieldData name/value pair as described by the "${ACTION.SPEC_AUTH_OWNER_CREDS}" spec`, () => {
      const authSpec = {}
      authSpec[ACTION.SPEC_AUTH_OWNER_CREDS] = ['user_id', 'profile_id']

      const fieldData = {
        profile_id: 1,
        user_id: 33,
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpec, fieldData)).toMatchInlineSnapshot(`
        {
          "user_id": 33,
        }
      `)
    })

    it('should support field transformation when arrow notation is used on the spec', () => {
      const authSpecNoSpaces = {
        [ACTION.SPEC_AUTH_OWNER_CREDS]: ['id=>user_id', 'profile_id'],
      }

      const authSpecWithSpaces = {
        [ACTION.SPEC_AUTH_OWNER_CREDS]: ['id =>  user_id', 'profile_id'],
      }

      const fieldData = {
        profile_id: 1,
        id: 33,
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpecNoSpaces, fieldData))
        .toEqual(ActionUtils.parseOwnerCreds(authSpecWithSpaces, fieldData))
    })
  }) // END - parseOwnerCreds

  // ------------------------
  // Testing: parseLoadDirect
  // ------------------------
  describe('parseLoadDirect', () => {
    it('should return an empty object when the provided data is empty or null', () => {
      const data = []

      expect(ActionUtils.parseLoadDirect(data)).toEqual({})
      expect(ActionUtils.parseLoadDirect()).toEqual({})
    })

    it('should ignore association entries that do not specify a column mapping', () => {
      const data = ['roles', 'viewCount:count']

      const parsed = ActionUtils.parseLoadDirect(data)

      expect(parsed).toEqual({
        associations: ['viewCount'],
        colMappings: {
          viewCount: 'count',
        },
      })
    })

    it('should ensure duplicative association entries are not returned (only returning the first occurrence)', () => {
      const data = ['roles:key', 'viewCount:count', 'roles:label', 'roles:name']

      const parsed = ActionUtils.parseLoadDirect(data)

      expect(parsed).toEqual({
        associations: ['roles', 'viewCount'],
        colMappings: {
          roles: 'key',
          viewCount: 'count',
        },
      })
    })

    it('should return the expected parsed relation information (associations, colMappings)', () => {
      const data = ['roles:name', 'viewCount:count', 'profile:{name,is_default}', 'user:*']

      const parsed = ActionUtils.parseLoadDirect(data)

      expect(parsed).toEqual({
        associations: ['roles', 'viewCount', 'profile', 'user'],
        colMappings: {
          roles: 'name',
          viewCount: 'count',
          profile: ['name', 'is_default'],
          user: '*',
        },
      })
    })
  }) // END - parseLoadDirect

  // ----------------------------
  // Testing: processDefaultValue
  // ----------------------------
  describe('processDefaultValue', () => {
    it('should return null when a "defaultValue" parameter is not provided', () => {
      const fieldData = {
        title: 'The Very First',
        alias: 'alias-from-input',
      }

      expect(ActionUtils.processDefaultValue(fieldData)).toBeNull()
    })

    it('should return the original "defaultValue" for standard scenarios', () => {
      const fieldData = {
        title: 'The Very First',
        alias: 'alias-from-input',
      }

      const stringValue = 'standard-value'
      const booleanFalseValue = false
      const booleanTrueValue = true
      const numberValue = 33
      const nullValue = null

      expect(ActionUtils.processDefaultValue(fieldData, stringValue))
        .toEqual(stringValue)
      expect(ActionUtils.processDefaultValue(fieldData, booleanFalseValue))
        .toEqual(booleanFalseValue)
      expect(ActionUtils.processDefaultValue(fieldData, booleanTrueValue))
        .toEqual(booleanTrueValue)
      expect(ActionUtils.processDefaultValue(fieldData, numberValue))
        .toEqual(numberValue)
      expect(ActionUtils.processDefaultValue(fieldData, nullValue))
        .toEqual(nullValue)
    })

    it('should support the "now" operator', () => {
      const fieldData = {
        title: 'The Very First',
        alias: 'alias-from-input',
      }

      const nowOperator = '% now %'

      expect(ActionUtils.processDefaultValue(fieldData, nowOperator))
        .toHaveLength(20)
    })

    it('should support the transformation operators (camelCase, kebabCase, snakeCase, pascalCase)', () => {
      const fieldData = {
        title: 'The Very First',
        alias: 'alias-from-input',
      }

      const camelCase = '% camelCase(title) %'
      const kebabCase = '% kebabCase(title) %'
      const snakeCase = '% snakeCase(title) %'
      const pascalCase = '% pascalCase(title) %'

      // Returns null if operator not recognized, or if operand field is not provided...
      const unknownOp = '% unknownOp(title) %'
      const absentField = '% unknownOp(description) %'

      expect(ActionUtils.processDefaultValue(fieldData, camelCase))
        .toBe('theVeryFirst')
      expect(ActionUtils.processDefaultValue(fieldData, kebabCase))
        .toBe('the-very-first')
      expect(ActionUtils.processDefaultValue(fieldData, snakeCase))
        .toBe('the_very_first')
      expect(ActionUtils.processDefaultValue(fieldData, pascalCase))
        .toBe('TheVeryFirst')

      expect(ActionUtils.processDefaultValue(fieldData, unknownOp))
        .toBeNull()
      expect(ActionUtils.processDefaultValue(fieldData, absentField))
        .toBeNull()
    })
  }) // END - processDefaultValue

  // ---------------------------
  // Testing: normalizeFieldSpec
  // ---------------------------
  describe('normalizeFieldSpec', () => {
    const fieldSpecInput = [
        { name: 'user_id', type: 'Number' },
        { name: 'username', type: 'String', operators: ['contains', 'exact'] },
        { name: 'display_name' },
        { type: 'Number' },
    ]

    it('should normalize spec field from the input', () => {
      const fieldSpec = ActionUtils.normalizeFieldSpec(fieldSpecInput)
      expect(fieldSpec).toEqual([
        { name: 'user_id', type: 'Number', operators: ['exact'] },
        { name: 'username', type: 'String', operators: ['contains', 'exact'] },
        { name: 'display_name', type: 'String', operators: ['exact'] },
      ])
    })

    it('should accept nullish input', () => {
      expect(ActionUtils.normalizeFieldSpec()).toEqual([])
      expect(ActionUtils.normalizeFieldSpec(null)).toEqual([])
    })

    it('should be idempotent', () => {
      expect(ActionUtils.normalizeFieldSpec(ActionUtils.normalizeFieldSpec(fieldSpecInput)))
        .toEqual(ActionUtils.normalizeFieldSpec(fieldSpecInput))
    })
  }) // END - normalizeFieldSpec

  // ---------------------------
  // Testing: normalizeFieldData
  // ---------------------------
  describe('normalizeFieldData', () => {
    const fieldDataInput = { user_id: 1, 'username.contains': 'ed' }

    it('should normalize field data from the input', () => {
      const fieldData = ActionUtils.normalizeFieldData(fieldDataInput)

      expect(fieldData).toMatchInlineSnapshot(`
        {
          "user_id": {
            "matchStrategy": "exact",
            "value": 1,
          },
          "username": {
            "matchStrategy": "contains",
            "value": "ed",
          },
        }
      `)
    })

    it('should accept nullish input', () => {
      expect(ActionUtils.normalizeFieldData()).toEqual({})
      expect(ActionUtils.normalizeFieldData(null)).toEqual({})
    })

    it('should be idempotent', () => {
      expect(ActionUtils.normalizeFieldData(ActionUtils.normalizeFieldData(fieldDataInput)))
        .toEqual(ActionUtils.normalizeFieldData(fieldDataInput))
    })
  }) // END - normalizeFieldData

  // -------------------------
  // Testing: prepareFieldData
  // -------------------------
  describe('prepareFieldData', () => {
    it('should cast all provided fieldData values to the data type specified in the spec', () => {
      const fieldSpec = [
        { name: 'user_id', type: 'Number' },
        { name: 'item_id', type: 'Number' },
        { name: 'title', type: 'String' },
        { name: 'is_live', type: 'Boolean' },
        { name: 'is_insane', type: 'Boolean' },
        { name: 'is_awesome', type: 'Boolean' },
        { name: 'is_typical', type: 'Boolean' },
        { name: 'is_unknown', type: 'Boolean' },
        { name: 'is_simple', type: 'Boolean' },
      ]

      const fieldData = {
        user_id: '1',
        item_id: ['2', '3', '5', '8'],
        title: 123,
        is_live: 'true',
        is_insane: 'TRUE',
        is_awesome: 1,
        is_typical: 'false',
        is_unknown: 'FALSE',
        is_simple: 0,
        notRelated: 'I am ignored',
      }

      const preparedFieldData = ActionUtils.prepareFieldData(fieldSpec, fieldData)

      expect(preparedFieldData).toEqual({
        user_id: { value: 1, matchStrategy: 'exact' },
        item_id: { value: [2, 3, 5, 8], matchStrategy: 'exact' },
        title: { value: '123', matchStrategy: 'exact' },
        is_live: { value: true, matchStrategy: 'exact' },
        is_insane: { value: true, matchStrategy: 'exact' },
        is_awesome: { value: true, matchStrategy: 'exact' },
        is_typical: { value: false, matchStrategy: 'exact' },
        is_unknown: { value: false, matchStrategy: 'exact' },
        is_simple: { value: false, matchStrategy: 'exact' },
      })
    })

    it(`should by default accept the "${ACTION.INPUT_FIELD_MATCHING_STRATEGY_EXACT}" operator`, () => {
      const fieldSpec = [{ name: 'username', type: 'String' }]
      const fieldData = { 'username.exact': 'ed' }

      const preparedFieldData = ActionUtils.prepareFieldData(fieldSpec, fieldData)

      expect(preparedFieldData).toEqual({
        username: { value: 'ed', matchStrategy: 'exact' },
      })
    })

    it('should accept the operators that are whitelisted in the field spec', () => {
      const fieldSpec = [{ name: 'username', type: 'String', operators: ['contains', 'exact'] }]
      const fieldData = { 'username.contains': 'ed' }

      const preparedFieldData = ActionUtils.prepareFieldData(fieldSpec, fieldData)

      expect(preparedFieldData).toEqual({
        username: { value: 'ed', matchStrategy: 'contains' },
      })
    })

    it('should throw error if an operator is provided but not whitelisted', () => {
      const fieldSpec = [{ name: 'username', type: 'String' }]
      const fieldData = { 'username.contains': 'ed' }

      expect(() => ActionUtils.prepareFieldData(fieldSpec, fieldData))
        .toThrowErrorMatchingInlineSnapshot('[Error: Operator "contains" is not allowed on field "username". Check that it is whitelisted on the field spec with "operators"]')
    })

    it('should throw error if a "contains" operator is used on a non-string field', () => {
      const fieldSpec = [{ name: 'user_id', type: 'Number', operators: ['contains'] }]
      const fieldData = { 'user_id.contains': '10' }

      expect(() => ActionUtils.prepareFieldData(fieldSpec, fieldData))
        .toThrowErrorMatchingInlineSnapshot('[Error: "contains" operator can only be applied to a string value.]')
    })
  }) // END - prepareFieldData
})
