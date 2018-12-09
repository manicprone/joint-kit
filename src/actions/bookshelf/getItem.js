import objectUtils from '../../utils/object-utils';
import * as StatusErrors from '../../core/errors/status-errors';
import * as AuthUtils from '../../core/authorization/auth-utils';
import ACTION from '../../core/constants/action-constants';
import * as ActionUtils from '../action-utils';
import * as BookshelfUtils from './bookshelf-utils';
import toJsonApi from './serializers/json-api';

const debug = false;

export default async function getItem(bookshelf, spec = {}, input = {}, output) {
  const modelName = spec[ACTION.SPEC_MODEL_NAME];
  const specFields = spec[ACTION.SPEC_FIELDS];
  const specAuth = spec[ACTION.SPEC_AUTH] || {};
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES];
  const returnColsDef = spec[ACTION.SPEC_FIELDS_TO_RETURN];
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
  const trx = input[ACTION.INPUT_TRANSACTING];
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT];

  // Reject if model does not exist...
  const model = bookshelf.model(modelName);
  if (!model) {
    if (debug) console.log(`[JOINT] [action:getItem] The model "${modelName}" is not recognized`);
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName));
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:getItem] Action has missing required fields:', requiredFieldCheck.missing);
    return Promise.reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
  }

  // Prepare action options...
  const actionOpts = { require: true };
  if (trx) actionOpts.transacting = trx;

  // Restrict columns to return with payload...
  if (returnColsDef) {
    // If a single set (array) is defined, honor the setting...
    if (Array.isArray(returnColsDef)) {
      actionOpts.columns = returnColsDef;

    // Otherwise, try to honor the set requested by the input...
    } else if (input[ACTION.INPUT_FIELD_SET] && objectUtils.has(returnColsDef, input[ACTION.INPUT_FIELD_SET])) {
      actionOpts.columns = returnColsDef[input[ACTION.INPUT_FIELD_SET]];

    // If the input does not declare a set, check for a "default" set...
    } else if (returnColsDef.default && Array.isArray(returnColsDef.default)) {
      actionOpts.columns = returnColsDef.default;
    }
  } // end-if (returnColsDef)

  // -------------------------------------------------------------------------
  // Include associations (associations & loadDirect will be combined)
  // -------------------------------------------------------------------------
  // Handle "loadDirect" option...
  const inputLoadDirectDef = input[ACTION.INPUT_LOAD_DIRECT] || [];
  const loadDirectDef = (spec[ACTION.SPEC_FORCE_LOAD_DIRECT])
      ? spec[ACTION.SPEC_FORCE_LOAD_DIRECT].concat(inputLoadDirectDef)
      : inputLoadDirectDef;
  const loadDirect = ActionUtils.parseLoadDirect(loadDirectDef);
  // Handle "associations" option...
  const inputAssocs = input[ACTION.INPUT_ASSOCIATIONS] || [];
  const assocs = (spec[ACTION.SPEC_FORCE_ASSOCIATIONS])
      ? objectUtils.union(spec[ACTION.SPEC_FORCE_ASSOCIATIONS], inputAssocs)
      : inputAssocs;
  // Combine...
  const allAssociations = (loadDirect.associations && loadDirect.associations.length > 0)
      ? objectUtils.union(assocs, loadDirect.associations)
      : assocs;
  if (allAssociations.length > 0) actionOpts.withRelated = allAssociations;

  // Build where clause...
  const whereOpts = {};
  if (inputFields && specFields) {
    specFields.forEach((fieldSpec) => {
      const fieldName = fieldSpec.name;
      const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE);
      const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null;
      const hasInput = objectUtils.has(inputFields, fieldName);
      const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false);

      if (!isLocked && (hasInput || hasDefault)) {
        whereOpts[fieldName] = (hasInput)
            ? inputFields[fieldName]
            : defaultValue;
      } else if (isLocked && hasDefault) {
        whereOpts[fieldName] = defaultValue;
      }
    }); // end-specFields.forEach
  } // end-if (inputFields && specFields)

  // Debug executing logic...
  if (debug) console.log(`[JOINT] [action:getItem] EXECUTING => GET ${modelName} WHERE`, whereOpts);

  try {
    // Get item...
    const data = await model.where(whereOpts).fetch(actionOpts);

    // Respect auth...
    if (authRules) {
      const combinedFields = Object.assign({}, data.attributes, inputFields);
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields);
      if (!AuthUtils.isAllowed(authContext, authRules, ownerCreds)) {
        return Promise.reject(StatusErrors.generateNotAuthorizedError());
      }
    } // end-if (authRules)

    // Handle loadDirect requests...
    if (loadDirect.associations) BookshelfUtils.loadRelationsToItemBase(data, loadDirect, input.associations);

    // Return data in requested format...
    switch (output) {
      case 'json-api': return toJsonApi(modelName, data, bookshelf);
      default: return data;
    }
  } catch (error) {
    let jointError = null;
    if (error.message) {
      // (404)
      if (error.message === 'EmptyResponse') {
        jointError = StatusErrors.generateResourceNotFoundError(modelName);
      // (400)
      } else if (inputAssocs && error.message.includes(inputAssocs)) {
        jointError = StatusErrors.generateAssociationNotRecognizedError(inputAssocs);
        if (debug) console.error('[JOINT] [action:getItem]', jointError);
      }
      // (500)
    } else {
      if (debug) console.error(`[JOINT] [action:getItem] Action encountered a third-party error: ${error.message} =>`, error);
      jointError = StatusErrors.generateThirdPartyError(error);
    }

    throw jointError;
  }
} // END - getItem
