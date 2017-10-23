import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthUtils from '../../authorization/auth-utils';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';
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
    const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
    const trx = input[ACTION.INPUT_TRANSACTING];
    const authBundle = input[ACTION.INPUT_AUTH_BUNDLE];

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
    if (authBundle) {
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, inputFields);
      if (!AuthUtils.isAllowed(authBundle, ownerCreds)) {
        return reject(StatusErrors.generateNotAuthorizedError());
      }
    } // end-if (authBundle)

    // Prepare action options...
    const actionOpts = {};
    if (trx) actionOpts.transacting = trx;

    // Build row data...
    const rowData = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasDefault = objectUtils.has(fieldSpec, 'defaultValue');
        const hasInput = objectUtils.has(inputFields, fieldName);

        if (hasInput || hasDefault) {
          const fieldValue = (hasInput)
              ? inputFields[fieldName]
              : fieldSpec.defaultValue;

          rowData[fieldName] = fieldValue;
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Debug executing logic...
    if (debug) console.log(`[JOINT] [action:createItem] EXECUTING => CREATE ${modelName} WITH`, rowData);

    // Create row...
    return model.forge(rowData).save(null, actionOpts)
      .then((data) => {
        // Return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
          default: return resolve(data);
        }
      })
      .catch((error) => {
        if (debug) console.log('[JOINT] [action:createItem] Action encountered an error =>', error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - performCreateItem
