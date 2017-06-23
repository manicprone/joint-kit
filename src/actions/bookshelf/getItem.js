import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthHandler from '../../authorization/auth-handler';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import * as BookshelfUtils from './bookshelf-utils';
import ACTION from '../action-constants';

const debug = false;

export default function getItem(bookshelf, spec = {}, input = {}) {
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

    // Include relations (relations and loadDirect will be combined into a distinct set)...
    let relations = null;
    const loadDirect = ActionUtils.parseLoadDirect(input.loadDirect);
    if (input.relations && Array.isArray(input.relations)) relations = input.relations.slice();
    if (loadDirect.relations && loadDirect.relations.length > 0) {
      if (relations) {
        loadDirect.relations.forEach((relationName) => {
          if (!objectUtils.includes(relations, relationName)) relations.push(relationName);
        });
      } else {
        relations = loadDirect.relations;
      }
    }
    if (relations) actionOpts.withRelated = relations;

    // Build where clause...
    const whereOpts = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasInput = objectUtils.has(inputFields, fieldName);

        if (hasInput) {
          whereOpts[fieldName] = inputFields[fieldName];
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

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
        if (loadDirect.relations) BookshelfUtils.loadRelationsToItemBase(data, loadDirect, input.relations);
        return resolve(data);
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
