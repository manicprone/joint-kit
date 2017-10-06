import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthHandler from '../../authorization/auth-handler';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';
import * as BookshelfUtils from './bookshelf-utils';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function getItem(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const modelName = spec[ACTION.SPEC_MODEL_NAME];
    const specFields = spec[ACTION.SPEC_FIELDS];
    const specAuth = spec[ACTION.SPEC_AUTH] || {};
    const returnColsDef = spec[ACTION.SPEC_COLUMNS_TO_RETURN];
    const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
    const trx = input[ACTION.INPUT_TRANSACTING];
    const authBundle = input[ACTION.INPUT_AUTH_BUNDLE];

    // Reject if model does not exist...
    const model = bookshelf.model(modelName);
    if (!model) {
      if (debug) console.log(`[JOINT] [action:getItem] The model "${modelName}" is not recognized`);
      return reject(StatusErrors.generateModelNotRecognizedError(modelName));
    }

    // Reject when required fields are not provided...
    const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
    if (!requiredFieldCheck.satisfied) {
      if (debug) console.log('[JOINT] [action:getItem] Action has missing required fields:', requiredFieldCheck.missing);
      return reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
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
      } else if (input.columnSet && objectUtils.has(returnColsDef, input.columnSet)) {
        actionOpts.columns = returnColsDef[input.columnSet];

      // If the input does not declare a set, check for a "default" set...
      } else if (returnColsDef.default && Array.isArray(returnColsDef.default)) {
        actionOpts.columns = returnColsDef.default;
      }
    } // end-if (returnColsDef)

    // Include associations (associations and loadDirect will be combined into a distinct set)...
    let associations = null;
    const loadDirect = ActionUtils.parseLoadDirect(input.loadDirect);
    const inputAssocs = input[ACTION.INPUT_ASSOCIATIONS];
    if (inputAssocs && Array.isArray(inputAssocs)) associations = inputAssocs.slice();
    if (loadDirect.associations && loadDirect.associations.length > 0) {
      if (associations) {
        loadDirect.associations.forEach((assocName) => {
          if (!objectUtils.includes(associations, assocName)) associations.push(assocName);
        });
      } else {
        associations = loadDirect.associations;
      }
    }
    if (associations) actionOpts.withRelated = associations;

    // Build where clause...
    const whereOpts = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasDefault = objectUtils.has(fieldSpec, 'defaultValue');
        const hasInput = objectUtils.has(inputFields, fieldName);

        if (hasInput || hasDefault) {
          const fieldValue = (hasInput)
              ? inputFields[fieldName]
              : fieldSpec.defaultValue;

          whereOpts[fieldName] = fieldValue;
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Debug executing logic...
    if (debug) console.log(`[JOINT] [action:getItem] EXECUTING => GET ${modelName} WHERE`, whereOpts);

    // Get item...
    return model.where(whereOpts).fetch(actionOpts)
      .then((data) => {
        // Respect auth...
        if (authBundle) {
          const combinedFields = Object.assign({}, data.attributes, inputFields);
          const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields);
          if (!AuthHandler.isAllowed(authBundle, ownerCreds)) {
            return reject(StatusErrors.generateNotAuthorizedError());
          }
        } // end-if (authBundle)

        // Handle loadDirect requests...
        if (loadDirect.associations) BookshelfUtils.loadRelationsToItemBase(data, loadDirect, input.associations);

        // Return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
          default: return resolve(data);
        }
      })
      .catch((error) => {
        // (404)
        if (error.message && error.message === 'EmptyResponse') {
          return reject(StatusErrors.generateResourceNotFoundError(modelName));
        }
        // (500)
        if (debug) console.log('[JOINT] [action:getItem] Action encountered an error =>', error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - getItem
