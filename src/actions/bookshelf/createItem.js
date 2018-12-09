import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as StatusErrors from '../../core/errors/status-errors';
import * as AuthUtils from '../../core/authorization/auth-utils';
import ACTION from '../../core/constants/action-constants';
import * as ActionUtils from '../action-utils';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function createItem(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performCreateItem(bookshelf, spec, input, output);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performCreateItem(bookshelf, spec, newInput, output);
  });
}

function performCreateItem(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const modelName = spec[ACTION.SPEC_MODEL_NAME];
    const specFields = spec[ACTION.SPEC_FIELDS];
    const specAuth = spec[ACTION.SPEC_AUTH] || {};
    const authRules = specAuth[ACTION.SPEC_AUTH_RULES];
    const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
    const trx = input[ACTION.INPUT_TRANSACTING];
    const authContext = input[ACTION.INPUT_AUTH_CONTEXT];

    // Reject if model does not exist...
    const model = bookshelf.model(modelName);
    if (!model) {
      if (debug) console.log(`[JOINT] [action:createItem] The model "${modelName}" is not recognized`);
      return reject(StatusErrors.generateModelNotRecognizedError(modelName));
    }

    // Reject when required fields are not provided...
    const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
    if (!requiredFieldCheck.satisfied) {
      if (debug) console.log('[JOINT] [action:createItem] Action has missing required fields:', requiredFieldCheck.missing);
      return reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
    }

    // Respect auth...
    if (authRules) {
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, inputFields);
      if (!AuthUtils.isAllowed(authContext, authRules, ownerCreds)) {
        return reject(StatusErrors.generateNotAuthorizedError());
      }
    } // end-if (authRules)

    // Prepare action options...
    const actionOpts = {};
    if (trx) actionOpts.transacting = trx;

    // Build create package...
    const createData = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE);
        const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null;
        const hasInput = objectUtils.has(inputFields, fieldName);
        const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false);

        if (!isLocked && (hasInput || hasDefault)) {
          createData[fieldName] = (hasInput)
              ? inputFields[fieldName]
              : defaultValue;
        } else if (isLocked && hasDefault) {
          createData[fieldName] = defaultValue;
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Debug executing logic...
    if (debug) console.log(`[JOINT] [action:createItem] EXECUTING => CREATE ${modelName} WITH`, createData);

    // Create row...
    return model.forge(createData).save(null, actionOpts)
      .then((data) => {
        // Return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
          default: return resolve(data);
        }
      })
      .catch((error) => {
        console.error(`[JOINT] [action:createItem] Action encountered a third-party error: ${error.message} =>`, error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - performCreateItem
