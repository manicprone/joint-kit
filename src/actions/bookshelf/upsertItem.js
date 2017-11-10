import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthUtils from '../../authorization/auth-utils';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function upsertItem(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performUpsertItem(bookshelf, spec, input, output);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performUpsertItem(bookshelf, spec, newInput, output);
  });
}

function performUpsertItem(bookshelf, spec = {}, input = {}, output) {
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
      if (debug) console.log(`[JOINT] [action:upsertItem] The model "${modelName}" is not recognized`);
      return reject(StatusErrors.generateModelNotRecognizedError(modelName));
    }

    // Reject when required fields are not provided...
    const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
    if (!requiredFieldCheck.satisfied) {
      if (debug) console.log('[JOINT] [action:upsertItem] Action has missing required fields:', requiredFieldCheck.missing);
      return reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
    }

    // Determine lookup field to fetch item...
    const lookupFieldData = ActionUtils.getLookupFieldData(specFields, inputFields);
    if (!lookupFieldData) {
      // Reject when a lookup field cannot be determined...
      if (debug) console.log('[JOINT] [action:upsertItem] Action did not define or provide a "lookup field"');
      return reject(StatusErrors.generateLookupFieldNotProvidedError());
    }

    // Prepare upsert action options...
    const actionOpts = { require: true };
    if (trx) actionOpts.transacting = trx;

    // Build upsert package...
    const upsertData = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE);
        const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null;
        const hasInput = objectUtils.has(inputFields, fieldName);
        const isLookup = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP, false) || objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP_OR, false);
        const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false);

        if (!isLocked && !isLookup && (hasInput || hasDefault)) {
          upsertData[fieldName] = (hasInput)
              ? inputFields[fieldName]
              : defaultValue;
        } else if (isLocked && !isLookup && hasDefault) {
          upsertData[fieldName] = defaultValue;
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // if (inputFields && specFields) {
    //   specFields.forEach((fieldSpec) => {
    //     const fieldName = fieldSpec.name;
    //     const isLookupField = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP, false) || objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP_OR, false);
    //     const hasDefault = objectUtils.has(fieldSpec, 'defaultValue');
    //     const hasInput = objectUtils.has(inputFields, fieldName);
    //
    //     if ((hasInput || hasDefault) && !isLookupField) {
    //       const fieldValue = (hasInput)
    //           ? inputFields[fieldName]
    //           : fieldSpec.defaultValue;
    //
    //       upsertData[fieldName] = fieldValue;
    //     }
    //   }); // end-specFields.forEach
    // } // end-if (inputFields && specFields)

    // Look for item...
    return model.where(lookupFieldData).fetch(actionOpts)
      .then((resource) => {
        // Respect auth...
        if (authBundle) {
          const combinedFields = Object.assign({}, resource.attributes, inputFields);
          const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields);
          if (!AuthUtils.isAllowed(authBundle, ownerCreds)) {
            return reject(StatusErrors.generateNotAuthorizedError());
          }
        } // end-if (authBundle)

        // Debug executing logic...
        if (debug) console.log(`[JOINT] [action:upsertItem] EXECUTING => UPDATE ${modelName} WITH`, upsertData);

        // ------------------------
        // Perform update action...
        // ------------------------
        return resource.save(upsertData, actionOpts)
          .then((data) => {
            // Return data in requested format...
            switch (output) {
              case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
              default: return resolve(data);
            }
          })
          .catch((error) => {
            if (debug) console.log('[JOINT] [action:upsertItem] Action encountered an error on update =>', error);
            return reject(StatusErrors.generateThirdPartyError(error));
          });
      })
      .catch((error) => {
        if (error.message && error.message === 'EmptyResponse') {
          // Respect auth...
          if (authBundle) {
            const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, inputFields);
            if (!AuthUtils.isAllowed(authBundle, ownerCreds)) {
              return reject(StatusErrors.generateNotAuthorizedError());
            }
          } // end-if (authBundle)

          // Debug executing logic...
          if (debug) console.log(`[JOINT] [action:upsertItem] EXECUTING => CREATE ${modelName} WITH`, upsertData);

          // ------------------------
          // Perform create action...
          // ------------------------
          return model.forge(lookupFieldData).save(upsertData, actionOpts)
            .then((data) => {
              // Return data in requested format...
              switch (output) {
                case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
                default: return resolve(data);
              }
            })
            .catch((createError) => {
              if (debug) console.log('[JOINT] [action:upsertItem] Action encountered an error on create =>', createError);
              return reject(StatusErrors.generateThirdPartyError(createError));
            });
        }

        if (debug) console.log('[JOINT] [action:upsertItem] Action encountered an error =>', error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - performUpsertItem
