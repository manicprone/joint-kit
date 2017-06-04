import objectUtils from '../../utils/object-utils';
import ACTION from './constants';

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
      const isRequired = objectUtils.get(field, 'required', false);
      const isRequiredOr = objectUtils.get(field, 'requiredOr', false);
      const fieldName = objectUtils.get(field, 'name', null);

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
//
// -----------------------------------------------------------------------------
// e.g.
//
// Provided:
// ['roles:name', 'viewCount:count']
//
// Returns:
// {
//   relations: ['roles', 'viewCount'],
//   colMappings: {
//     roles: 'name',
//     viewCount: 'count',
//   },
// }
// -----------------------------------------------------------------------------
export function parseLoadDirect(loadDirectData = []) {
  const loadDirect = {};

  if (Array.isArray(loadDirectData) && loadDirectData.length > 0) {
    loadDirect.relations = [];
    loadDirect.colMappings = {};

    loadDirectData.forEach((relation) => {
      const relationOpts = relation.split(':');
      const relationName = relationOpts[0];
      const relationCol = (relationOpts.length > 1) ? relationOpts[relationOpts.length - 1] : null;
      if (relationCol && !objectUtils.includes(loadDirect.relations, relationName)) {
        loadDirect.relations.push(relationName);
        loadDirect.colMappings[relationName] = relationCol;
      }
    });
  }

  return loadDirect;
}

// -----------------------------------------------------------------------------
// Looks at the provided fieldSpec defintion and fieldData to return an
// acceptable data pair for performing resource lookup.
// -----------------------------------------------------------------------------
// If a "lookupField" is not defined on the spec, or if the input does not
// contain any of the possible lookup fields, the function returns null.
//
// Otherwise, the first matching field name/value pair is returned.
//
// e.g.
// { id: 100 }
// -----------------------------------------------------------------------------
export function getLookupFieldData(fieldSpec = [], fieldData = {}) {
  let lookupData = null;

  if (Array.isArray(fieldSpec) && fieldSpec.length > 0) {
    // Look for defined lookup fields on spec...
    for (let i = 0; i < fieldSpec.length; i++) {
      const field = fieldSpec[i];
      const isLookupField = objectUtils.get(field, 'lookupField', false);

      if (isLookupField) {
        const fieldName = objectUtils.get(field, 'name', null);
        const dataType = objectUtils.get(field, 'type', 'String');
        if (fieldName && objectUtils.has(fieldData, fieldName)) {
          lookupData = {};
          lookupData[fieldName] = castValue(fieldData[fieldName], dataType);
          break;
        }
      } // end-if (isLookupField)
    } // end-for
  } // end-if (Array.isArray(fieldSpec) && fieldSpec.length > 0)

  return lookupData;
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
  switch (dataType) {
    case 'Number': return Number(value);
    case 'Boolean': return (isNaN(value)) ? (value.toLowerCase() == 'true') : Boolean(value); // eslint-disable-line eqeqeq
    case 'JSON': return JSON.stringify(value);
    default: return String(value);
  }
}
