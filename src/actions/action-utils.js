import dateUtils from '../utils/date-utils';
import objectUtils from '../utils/object-utils';
import stringUtils from '../utils/string-utils';
import ACTION from './action-constants';

// -----------------------------------------------------------------------------
// Looks at the provided fieldSpec defintion, and ensures the provided
// fieldData contains the fields required by the spec.
// -----------------------------------------------------------------------------
// If the spec is satisfied, the function returns an object with a property
// "satisfied" as true.
//
// If the provided fieldData does not satisfy the spec, the functions returns
// an object with a property "satisfied" as false, along with a property
// "missing", which contain`s the detailed info describing which fields are
// missing.
// -----------------------------------------------------------------------------
//
// (TODO: Provide full description of return object !!!)
//
// Returns:
// {
//   satisfied: true | false,
//   missing: {
//     all: [...],
//     oneOf: [...],
//   }
// }
// -----------------------------------------------------------------------------
export function checkRequiredFields(fieldSpec = [], fieldData = {}) {
  const result = {
    satisfied: true,
  };

  // Loop through field spec, checking if all field requirements are satisfied...
  if (Array.isArray(fieldSpec) && fieldSpec.length > 0) {
    const missingAllFields = [];
    const requiredOrs = [];
    let isRequiredOrSatisfied = false;

    fieldSpec.forEach((field) => {
      const fieldName = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_NAME, null);
      const isRequired = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_REQUIRED, false);
      const isRequiredOr = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_REQUIRED_OR, false);

      // Record missing "required" fields...
      if (fieldName && isRequired && !objectUtils.has(fieldData, fieldName)) {
        missingAllFields.push(fieldName);

      // Handle "requiredOr" requirements...
      } else if (fieldName && isRequiredOr) {
        requiredOrs.push(fieldName); // track all requiredOr fields
        if (objectUtils.has(fieldData, fieldName)) isRequiredOrSatisfied = true; // mark as satisfied
      }
    });

    // If missing fields, provide details and mark satisfied as false...
    const hasMissingAll = missingAllFields.length > 0;
    const hasMissingOneOf = requiredOrs.length > 0 && !isRequiredOrSatisfied;
    if (hasMissingAll || hasMissingOneOf) {
      result.satisfied = false;
      result.missing = {};
      if (hasMissingAll) result.missing.all = missingAllFields;
      if (hasMissingOneOf) result.missing.oneOf = requiredOrs;
    }
  } // end-if (Array.isArray(fieldSpec) && fieldSpec.length > 0)

  return result;
}

// -----------------------------------------------------------------------------
// Looks at the provided fieldSpec defintion and fieldData to return an
// acceptable name/value set for performing a resource lookup.
// -----------------------------------------------------------------------------
// If a "lookup" is not defined on the spec, or if the input does not
// staisfy the specified lookup fields, the function returns null.
//
// Otherwise, the first found acceptable name/value sets are returned.
//
// e.g.
// { id: 100, key: 'v1.0.0' }
// -----------------------------------------------------------------------------
export function getLookupFieldData(fieldSpec = [], fieldData = {}) {
  let lookupData = null;

  // Loop through field spec, checking if all lookup field requirements are satisfied...
  if (Array.isArray(fieldSpec) && fieldSpec.length > 0) {
    const lookupOrs = [];
    let isLookupOrSatisfied = false;

    for (let i = 0; i < fieldSpec.length; i++) {
      const field = fieldSpec[i];
      const dataType = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_TYPE, 'String');
      const fieldName = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_NAME, null);

      if (fieldName) {
        const isLookup = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_LOOKUP, false);
        const isLookupOr = objectUtils.get(field, ACTION.SPEC_FIELDS_OPT_LOOKUP_OR, false);
        const hasInput = objectUtils.has(fieldData, fieldName);

        if (isLookupOr && !isLookupOrSatisfied) {
          lookupOrs.push(fieldName); // track all lookupOr fields
          if (hasInput) {
            if (!lookupData) lookupData = {};
            lookupData[fieldName] = castValue(fieldData[fieldName], dataType);
            isLookupOrSatisfied = true; // mark as satisfied
          }
        } // end-if (isLookupOr && !isLookupOrSatisfied)

        if (isLookup) {
          const hasDefault = objectUtils.has(field, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE);
          if (hasInput || hasDefault) {
            if (!lookupData) lookupData = {};
            lookupData[fieldName] = (hasInput)
                ? castValue(fieldData[fieldName], dataType)
                : castValue(field[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE], dataType);
          }
        } // end-if (isLookup)
      } // end-if (fieldName)
    } // end-for
  } // end-if (Array.isArray(fieldSpec) && fieldSpec.length > 0)

  return lookupData;
}

// -----------------------------------------------------------------------------
// Looks at the provided authSpec for any declared ownerCreds fields,
// and returns the first matching field name/value pair from fieldData.
// -----------------------------------------------------------------------------
// If fields are listed in the authSpec.ownerCreds array, the function will
// look for the presence of any of these fields in the provided fieldData
// object. The function will return the name/value pair the first matching
// field (according to the order described in the authSpec.ownerCreds array).
//
// If the authSpec.ownerCreds array does not exist, or is empty, the function
// returns an empty object. Similarly, if the array is not empty, but none of
// the fields exists in the fieldData object, the function returns an empty
// object.
//
// e.g.
//
// Provided parameters:
// -------------------------
// authSpec = { ownerCreds: ['user_id', 'profile_id'] }
// fieldData = { profile_id: 1, user_id: 33 }
//
// The function will return:
// -------------------------
// { user_id: 33 }
//
// ...since "user_id" was listed first in the spec declaration.
//
// -----------------------------------------------------------------------------
// The ownerCreds spec also supports field name transformations using
// arrow notation.
// -----------------------------------------------------------------------------
// e.g.
// ownerCreds: ['id => user_id', 'profile_id']
//
// where the input field data can provide:
// fieldData = { id: 33 }
//
// the function will return:
// -------------------------
// { user_id: 33 }
//
// ...since "id" is specified to transform into "user_id".
// -----------------------------------------------------------------------------
export function parseOwnerCreds(authSpec = {}, fieldData = {}) {
  const creds = {};
  const acceptedFields = objectUtils.get(authSpec, ACTION.SPEC_AUTH_OWNER_CREDS, []);

  // Prepare ownerCreds field name/value pair, if specified...
  for (let i = 0; i < acceptedFields.length; i++) {
    const fieldNameMapping = acceptedFields[i].replace(/\s+/g, '').split('=>'); // support arrow notation
    const inputFieldName = fieldNameMapping[0];
    const targetFieldName = (fieldNameMapping.length > 1) ? fieldNameMapping[1] : fieldNameMapping[0];
    if (objectUtils.has(fieldData, inputFieldName)) {
      creds[targetFieldName] = fieldData[inputFieldName];
      break;
    }
  } // end-for

  return creds;
}

// -----------------------------------------------------------------------------
// Looks at the provided loadDirect spec defintion, and parses out the info
// needed to perform the loadDirect action on resource association data.
// -----------------------------------------------------------------------------
// e.g.
//
// Provided:
// ['viewCount:count', profile:{name,is_default}, 'user:*']
//
// Returns:
// {
//   associations: ['viewCount', 'profile', 'user'],
//   colMappings: {
//     viewCount: 'count',
//     profile: ['name', 'is_default'],
//     user: '*',
//   },
// }
// -----------------------------------------------------------------------------
export function parseLoadDirect(loadDirectSpec = []) {
  const loadDirect = {};

  if (Array.isArray(loadDirectSpec) && loadDirectSpec.length > 0) {
    loadDirect.associations = [];
    loadDirect.colMappings = {};

    loadDirectSpec.forEach((assoc) => {
      const assocOpts = assoc.split(':');
      const assocName = assocOpts[0];
      const assocColDef = (assocOpts.length > 1) ? assocOpts[assocOpts.length - 1].trim() : null;

      if (assocColDef && !objectUtils.includes(loadDirect.associations, assocName)) {
        const multiColPattern = /^{(.+)}/;
        const match = multiColPattern.exec(assocColDef);
        const assocCols = (match && match.length > 1) ? match[1].split(',') : assocColDef;
        loadDirect.associations.push(assocName);
        loadDirect.colMappings[assocName] = assocCols;
      }
    });
  }

  return loadDirect;
}

// -----------------------------------------------------------------------------
// Handles the processing of the "defaultValue" field option.
// -----------------------------------------------------------------------------
// This facade function exists, specifically, to handle the dynamic value
// operations (i.e. interpolations).
//
// A dynamic value string is denoted by enclosing the chosen operator
// within "%" characters. For example: defaultValue: '% now %'
//
// Supported dynamic value operations:
//
// now                     => Generates a timestamp reflecting the date/time
//                            the action request is executed.
//
// kebabCase<fieldName>)   => Transforms the specified field value to kebab case.
//
// snakeCase(<fieldName>)  => Transforms the specified field value to snake case.
//
// camelCase(<fieldName>)  => Transforms the specified field value to camel case.
//
// pascalCase(<fieldName>) => Transforms the specified field value to pascal case.
// -----------------------------------------------------------------------------
export function processDefaultValue(fieldData = {}, defaultValue) {
  let value = null;

  if (defaultValue) {
    const dynamicOperationPattern = /^%(.+)%/;
    const match = dynamicOperationPattern.exec(defaultValue);

    // Handle interpolation...
    if (match && match.length > 1) {
      const dynamicOperation = match[1].trim();
      const opPattern = /^(.+)\((.+)\)/;
      const opMatch = opPattern.exec(dynamicOperation);

      // Decompose operation instructions...
      let operator = dynamicOperation;
      let operand = null;
      if (opMatch && opMatch.length > 2) {
        operator = opMatch[1].trim();
        operand = opMatch[2].trim();
      }

      // "now" operator...
      if (operator === 'now') {
        value = dateUtils.now();

      // "camelCase" operator...
      } else if (operator === 'camelCase') {
        value = (fieldData[operand]) ? stringUtils.toCamelCase(fieldData[operand]) : null;

      // "kebabCase" operator...
      } else if (operator === 'kebabCase') {
        value = (fieldData[operand]) ? stringUtils.toKebabCase(fieldData[operand]) : null;

      // "snakeCase" operator...
      } else if (operator === 'snakeCase') {
        value = (fieldData[operand]) ? stringUtils.toSnakeCase(fieldData[operand]) : null;

      // "pascalCase" operator...
      } else if (operator === 'pascalCase') {
        value = (fieldData[operand]) ? stringUtils.toPascalCase(fieldData[operand]) : null;
      }

    // Otherwise, just return the original value...
    } else {
      value = defaultValue;
    }
  }

  return value;
}

// -----------------------------------------------------------------------------
// Iterates through the provided fieldSpec, performing the relevant data type
// conversion (cast) on matching fieldData values. Returns the prepared
// fieldData object, which can be used type-safely within the template logic.
// -----------------------------------------------------------------------------
export function prepareFieldData(fieldSpec = [], fieldData = {}) {
  const preparedFieldData = {};

  if (Array.isArray(fieldSpec) && fieldSpec.length > 0) {
    fieldSpec.forEach((field) => {
      const fieldName = objectUtils.get(field, 'name', null);
      const dataType = objectUtils.get(field, 'type', 'String');

      // Perform data type cast on provided field values...
      if (fieldName && objectUtils.has(fieldData, fieldName)) {
        preparedFieldData[fieldName] = castValue(fieldData[fieldName], dataType);
      }
    });
  }

  return preparedFieldData;
}

// TODO: Add try/catch to protect from bad values !!!
// -----------------------------------------------------------------------------
// Performs the appropriate casting of field data value.
// (per the configured spec field "type")
// -----------------------------------------------------------------------------
export function castValue(value, dataType) {
  if (Array.isArray(value)) {
    return value.map(element => castValue(element, dataType));
  }

  switch (dataType) {
    case 'Number': return Number(value);
    case 'Boolean': return (isNaN(value)) ? (value.toLowerCase() == 'true') : Boolean(value); // eslint-disable-line eqeqeq
    case 'JSON': return JSON.stringify(value);
    default: return String(value);
  }
}
