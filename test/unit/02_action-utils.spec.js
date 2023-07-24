import chai from 'chai'
import * as ActionUtils from '../../src/actions/action-utils'
import ACTION from '../../src/core/constants/action-constants'

const expect = chai.expect

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
      expect(result).to.deep.equal({
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
      expect(result).to.deep.equal({
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

      expect(nullSpec).to.deep.equal({ satisfied: true })
      expect(emptySpec).to.deep.equal({ satisfied: true })
      expect(noRequiredSpec).to.deep.equal({ satisfied: true })
      expect(nullInput).to.deep.equal({ satisfied: true })
      expect(emptyInput).to.deep.equal({ satisfied: true })
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
      expect(result).to.deep.equal({ satisfied: true })
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
      expect(testCase01).to.deep.equal({ satisfied: true })

      const testCase02 = ActionUtils.checkRequiredFields(fieldSpecRequiredOrOnly, fieldData02)
      expect(testCase02).to.deep.equal({ satisfied: true })

      const testCase03 = ActionUtils.checkRequiredFields(fieldSpecRequiredOrOnly, fieldData03)
      expect(testCase03).to.deep.equal({
        satisfied: false,
        missing: {
          oneOf: ['id', 'username'],
        },
      })

      const testCase04 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData01)
      expect(testCase04).to.deep.equal({ satisfied: true })

      const testCase05 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData04)
      expect(testCase05).to.deep.equal({
        satisfied: false,
        missing: {
          all: ['external_id'],
        },
      })

      const testCase06 = ActionUtils.checkRequiredFields(fieldSpecBothTypes, fieldData05)
      expect(testCase06).to.deep.equal({
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
        .to.be.null
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
        .to.be.null
      expect(ActionUtils.getLookupFieldData(fieldSpecLookupOr, fieldData))
        .to.be.null
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
        .to.deep.equal({
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
        .to.deep.equal({ external_id: { value: 'external-id-333', matchStrategy: 'exact' } })
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
        .to.deep.equal({ key: { value: 'alpha', matchStrategy: 'exact' } })
      expect(ActionUtils.getLookupFieldData(fieldSpecLookup02, fieldDataNoKey))
        .to.deep.equal({
          id: { value: 333, matchStrategy: 'exact' },
          key: { value: 'alpha', matchStrategy: 'exact' },
        })
      expect(ActionUtils.getLookupFieldData(fieldSpecLookup02, fieldDataWithKey))
        .to.deep.equal({
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
        .to.be.null
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

      expect(ActionUtils.parseOwnerCreds(authSpecNoCreds, fieldData))
        .to.be.empty
      expect(ActionUtils.parseOwnerCreds(authSpecEmptyCreds, fieldData))
        .to.be.empty
    })

    it(`should return an empty object when the fieldData does not contain any of the fields described in the "${ACTION.SPEC_AUTH_OWNER_CREDS}" spec`, () => {
      const authSpec = {}
      authSpec[ACTION.SPEC_AUTH_OWNER_CREDS] = ['user_id', 'profile_id']

      const fieldData = {
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpec, fieldData))
        .to.be.empty
    })

    it(`should return the first matching fieldData name/value pair as described by the "${ACTION.SPEC_AUTH_OWNER_CREDS}" spec`, () => {
      const authSpec = {}
      authSpec[ACTION.SPEC_AUTH_OWNER_CREDS] = ['user_id', 'profile_id']

      const fieldData = {
        profile_id: 1,
        user_id: 33,
        title: 'My First Post',
      }

      expect(ActionUtils.parseOwnerCreds(authSpec, fieldData))
        .to.contain({ user_id: 33 })
    })

    it('should support field transformation when arrow notation is used on the spec', () => {
      const authSpecNoSpaces = {}
      authSpecNoSpaces[ACTION.SPEC_AUTH_OWNER_CREDS] = ['id=>user_id', 'profile_id']

      const authSpecWithSpaces = {}
      authSpecWithSpaces[ACTION.SPEC_AUTH_OWNER_CREDS] = ['id =>  user_id', 'profile_id']

      const fieldData = {
        profile_id: 1,
        id: 33,
        title: 'My First Post',
      }

      const parsedNoSpaces = ActionUtils.parseOwnerCreds(authSpecNoSpaces, fieldData)
      const parsedWithSpaces = ActionUtils.parseOwnerCreds(authSpecWithSpaces, fieldData)

      expect(parsedNoSpaces).to.contain({ user_id: 33 })
      expect(parsedWithSpaces).to.contain({ user_id: 33 })
    })
  }) // END - parseOwnerCreds

  // ------------------------
  // Testing: parseLoadDirect
  // ------------------------
  describe('parseLoadDirect', () => {
    it('should return an empty object when the provided data is empty or null', () => {
      const data = []

      expect(ActionUtils.parseLoadDirect(data)).to.be.an('object').and.to.be.empty
      expect(ActionUtils.parseLoadDirect()).to.be.an('object').and.to.be.empty
    })

    it('should ignore association entries that do not specify a column mapping', () => {
      const data = ['roles', 'viewCount:count']

      const parsed = ActionUtils.parseLoadDirect(data)

      expect(parsed).to.deep.equal({
        associations: ['viewCount'],
        colMappings: {
          viewCount: 'count',
        },
      })
    })

    it('should ensure duplicative association entries are not returned (only returning the first occurrence)', () => {
      const data = ['roles:key', 'viewCount:count', 'roles:label', 'roles:name']

      const parsed = ActionUtils.parseLoadDirect(data)

      expect(parsed).to.deep.equal({
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

      expect(parsed).to.deep.equal({
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

      expect(ActionUtils.processDefaultValue(fieldData)).to.be.null
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
        .to.equal(stringValue)
      expect(ActionUtils.processDefaultValue(fieldData, booleanFalseValue))
        .to.equal(booleanFalseValue)
      expect(ActionUtils.processDefaultValue(fieldData, booleanTrueValue))
        .to.equal(booleanTrueValue)
      expect(ActionUtils.processDefaultValue(fieldData, numberValue))
        .to.equal(numberValue)
      expect(ActionUtils.processDefaultValue(fieldData, nullValue))
        .to.equal(nullValue)
    })

    it('should support the "now" operator', () => {
      const fieldData = {
        title: 'The Very First',
        alias: 'alias-from-input',
      }

      const nowOperator = '% now %'

      expect(ActionUtils.processDefaultValue(fieldData, nowOperator))
        .to.have.length(20)
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
        .to.equal('theVeryFirst')
      expect(ActionUtils.processDefaultValue(fieldData, kebabCase))
        .to.equal('the-very-first')
      expect(ActionUtils.processDefaultValue(fieldData, snakeCase))
        .to.equal('the_very_first')
      expect(ActionUtils.processDefaultValue(fieldData, pascalCase))
        .to.equal('TheVeryFirst')

      expect(ActionUtils.processDefaultValue(fieldData, unknownOp))
        .to.be.null
      expect(ActionUtils.processDefaultValue(fieldData, absentField))
        .to.be.null
    })
  }) // END - processDefaultValue

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
        { name: 'username.contains', type: 'String' },
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
        'username.contains': 'ed',
      }

      const preparedFieldData = ActionUtils.prepareFieldData(fieldSpec, fieldData)

      expect(preparedFieldData).to.deep.equal({
        user_id: { value: 1, matchStrategy: 'exact' },
        item_id: { value: [2, 3, 5, 8], matchStrategy: 'exact' },
        title: { value: '123', matchStrategy: 'exact' },
        is_live: { value: true, matchStrategy: 'exact' },
        is_insane: { value: true, matchStrategy: 'exact' },
        is_awesome: { value: true, matchStrategy: 'exact' },
        is_typical: { value: false, matchStrategy: 'exact' },
        is_unknown: { value: false, matchStrategy: 'exact' },
        is_simple: { value: false, matchStrategy: 'exact' },
        username: { value: 'ed', matchStrategy: 'contains' },
      })
    })
  }) // END - prepareFieldData
})
