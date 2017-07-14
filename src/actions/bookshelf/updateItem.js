import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthHandler from '../../authorization/auth-handler';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';

const debug = false;

export default function updateItem(bookshelf, spec = {}, input = {}) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performUpdateItem(bookshelf, spec, input);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performUpdateItem(bookshelf, spec, newInput);
  });
}

function performUpdateItem(bookshelf, spec = {}, input = {}) {
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
      if (debug) console.log(`[JOINT] [action:updateItem] The model "${modelName}" is not recognized`);
      return reject(StatusErrors.generateModelNotRecognizedError(modelName));
    }

    // Reject when required fields are not provided...
    const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
    if (!requiredFieldCheck.satisfied) {
      if (debug) console.log('[JOINT] [action:updateItem] Action has missing required fields:', requiredFieldCheck.missing);
      return reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
    }

    // Determine lookup field to fetch item...
    const lookupFieldData = ActionUtils.getLookupFieldData(specFields, inputFields);
    if (!lookupFieldData) {
      // Reject when a lookup field cannot be determined...
      if (debug) console.log('[JOINT] [action:updateItem] Action did not define or provide a "lookup field"');
      return reject(StatusErrors.generateLookupFieldNotProvidedError());
    }

    // Get item to perform the update action...
    const getItemOpts = { require: true };
    if (trx) getItemOpts.transacting = trx;
    return model.where(lookupFieldData).fetch(getItemOpts)
      .then((resource) => {
        // Respect auth...
        if (authBundle) {
          const combinedFields = Object.assign({}, resource.attributes, inputFields);
          const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields);
          if (!AuthHandler.isAllowed(authBundle, ownerCreds)) {
            return reject(StatusErrors.generateNotAuthorizedError());
          }
        } // end-if (authBundle)

        // Prepare update action options...
        const actionOpts = { patch: true };
        if (trx) actionOpts.transacting = trx;

        // Build update package...
        const updates = {};
        if (inputFields && specFields) {
          specFields.forEach((fieldSpec) => {
            const fieldName = fieldSpec.name;
            const isLookupField = objectUtils.get(fieldSpec, 'lookupField', false);
            const hasInput = objectUtils.has(inputFields, fieldName);

            if (hasInput && !isLookupField) {
              updates[fieldName] = inputFields[fieldName];
            }
          }); // end-specFields.forEach
        } // end-if (inputFields && specFields)

        // Debug executing logic...
        if (debug) console.log(`[JOINT] [action:updateItem] EXECUTING => UPDATE ${modelName} WITH`, updates);

        // Update item...
        return resource.save(updates, actionOpts)
          .then((data) => {
            return resolve(data);
          })
          .catch((error) => {
            if (debug) console.log('[JOINT] [action:updateItem] Action encountered an error =>', error);
            return reject(StatusErrors.generateThirdPartyError(error));
          });
      })
      .catch((error) => {
        // (404)
        if (error.message && error.message === 'EmptyResponse') {
          return reject(StatusErrors.generateResourceNotFoundError(modelName));
        }
        // (500)
        if (debug) console.log('[JOINT] [action:updateItem] Action encountered an error =>', error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - performUpdateItem
