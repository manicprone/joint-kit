import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthUtils from '../../authorization/auth-utils';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function deleteItem(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performDeleteItem(bookshelf, spec, input, output);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performDeleteItem(bookshelf, spec, newInput, output);
  });
}

function performDeleteItem(bookshelf, spec = {}, input = {}, output) {
  const modelName = spec[ACTION.SPEC_MODEL_NAME];
  const specFields = spec[ACTION.SPEC_FIELDS];
  const specAuth = spec[ACTION.SPEC_AUTH] || {};
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
  const trx = input[ACTION.INPUT_TRANSACTING];
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT];

  // Reject if model does not exist...
  const model = bookshelf.model(modelName);
  if (!model) {
    if (debug) console.log(`[JOINT] [action:deleteItem] The model "${modelName}" is not recognized`);
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName));
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:deleteItem] Action has missing required fields:', requiredFieldCheck.missing);
    return Promise.reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
  }

  // Perform lookup of item first, if specified...
  const lookupFieldData = ActionUtils.getLookupFieldData(specFields, inputFields);
  if (lookupFieldData) {
    return doLookupThenAction(bookshelf, lookupFieldData, modelName, specFields, specAuth, inputFields, authContext, trx, output);
  }

  // Otherwise, just perform action...
  return doAction(bookshelf, modelName, specFields, specAuth, null, inputFields, authContext, trx, output);
} // END - performDeleteItem

function doLookupThenAction(bookshelf, lookupFieldData, modelName, specFields, specAuth, inputFields, authContext, trx, output) {
  const getItemOpts = { require: true };
  if (trx) getItemOpts.transacting = trx;

  return bookshelf.model(modelName).where(lookupFieldData).fetch(getItemOpts)
    .then((resource) => {
      // Prepare ownerCreds from retrieved data...
      const combinedFields = Object.assign({}, resource.attributes, inputFields);
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields);

      return doAction(bookshelf, modelName, specFields, specAuth, ownerCreds, inputFields, authContext, trx, output);
    })
    .catch((error) => {
      // (404)
      if (error.message && error.message === 'EmptyResponse') {
        return Promise.reject(StatusErrors.generateResourceNotFoundError(modelName));
      }
      // (500)
      if (debug) console.log('[JOINT] [action:deleteItem] Action encountered an error =>', error);
      return Promise.reject(StatusErrors.generateThirdPartyError(error));
    });
} // END - doLookupThenAction

function doAction(bookshelf, modelName, specFields, specAuth, ownerCreds, inputFields, authContext, trx, output) {
  // Respect auth...
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES];
  if (authRules) {
    const ownerCredsData = ownerCreds || ActionUtils.parseOwnerCreds(specAuth, inputFields);
    if (!AuthUtils.isAllowed(authContext, authRules, ownerCredsData)) {
      return Promise.reject(StatusErrors.generateNotAuthorizedError());
    }
  } // end-if (authRules)

  // Prepare action options...
  const actionOpts = { require: true };
  if (trx) actionOpts.transacting = trx;

  // Build where clause...
  const whereOpts = {};
  if (inputFields && specFields) {
    specFields.forEach((fieldSpec) => {
      const fieldName = fieldSpec.name;
      const hasInput = objectUtils.has(inputFields, fieldName);

      if (hasInput) {
        whereOpts[fieldName] = inputFields[fieldName];
      }
    });
  } // end-if (inputFields && specFields)

  // Debug executing logic...
  if (debug) console.log(`[JOINT] [action:deleteItem] EXECUTING => DELETE ${modelName} WHERE`, whereOpts);

  // Delete item...
  return bookshelf.model(modelName).where(whereOpts).destroy(actionOpts)
    .then((data) => {
      // Return data in requested format...
      switch (output) {
        case 'json-api': return Promise.resolve(toJsonApi(modelName, data, bookshelf));
        default: return Promise.resolve(data);
      }
    })
    .catch((error) => {
      // (404)
      if (error.message && error.message === 'No Rows Deleted') {
        return Promise.reject(StatusErrors.generateResourceNotFoundError(modelName));
      }
      // (500)
      if (debug) console.log('[JOINT] [action:deleteItem] Action encountered an error =>', error);
      return Promise.reject(StatusErrors.generateThirdPartyError(error));
    });
} // END - doAction
