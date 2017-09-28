import Promise from 'bluebird';
import * as StatusErrors from '../../errors/status-errors';
import ACTION from '../action-constants';
import getItem from './getItem';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function getAllAssociatedItems(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performGetAllAssociatedItems(bookshelf, spec, input, output);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performGetAllAssociatedItems(bookshelf, spec, newInput, output);
  });
}

function performGetAllAssociatedItems(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const specMain = spec[ACTION.RESOURCE_MAIN];
    const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null;
    const assocName = spec[ACTION.ASSOCIATION_NAME];
    const inputMain = input[ACTION.RESOURCE_MAIN];
    const trx = input[ACTION.INPUT_TRANSACTING];

    // Reject when required properties are not provided...
    const missingProps = [];
    if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`);
    if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`);
    if (!assocName) missingProps.push(`spec.${ACTION.ASSOCIATION_NAME}`);
    if (missingProps.length > 0) {
      if (debug) console.log(`[JOINT] [action:getAllAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`);
      return reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps));
    }

    // Load trx to main resource...
    inputMain[ACTION.INPUT_TRANSACTING] = trx;

    // Return existing associations of this type...
    inputMain[ACTION.INPUT_RELATIONS] = [assocName];

    // Lookup main resource...
    return getItem(bookshelf, specMain, inputMain)
      .then((main) => {
        // Access all items of the requested association...
        const assocs = main.related(assocName);

        // TODO: Remove "spec.associationName", instead just require
        // the spec.association always exist, and lookup the assocName from the spec.association.modelName !!!

        // Reject with 404 if instances of the requested association were not found...
        // if (assoc.length === 0) {
        //   return reject(StatusErrors.generateResourceNotFoundError(modelNameAssoc));
        // }

        // Otherwise, return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelNameMain, assocs, bookshelf));
          default: return resolve(assocs);
        }
      })
      .catch((error) => {
        return reject(error);
      });
  });
} // END - performGetAllAssociatedItems
