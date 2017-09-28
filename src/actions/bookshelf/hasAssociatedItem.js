import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as StatusErrors from '../../errors/status-errors';
import ACTION from '../action-constants';
import getItem from './getItem';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function hasAssociatedItem(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const specMain = spec[ACTION.RESOURCE_MAIN];
    const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION];
    const modelNameAssoc = (specAssoc) ? specAssoc[ACTION.SPEC_MODEL_NAME] : null;
    const assocName = (specAssoc) ? specAssoc[ACTION.SPEC_ASSOCIATION_NAME] : null;
    const inputMain = input[ACTION.RESOURCE_MAIN];
    const inputAssoc = input[ACTION.RESOURCE_ASSOCIATION];
    const trx = input[ACTION.INPUT_TRANSACTING];

    // Reject when required properties are not provided...
    const missingProps = [];
    if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`);
    if (!specAssoc) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}`);
    if (!assocName) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}.${ACTION.SPEC_ASSOCIATION_NAME}`);
    if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`);
    if (!inputAssoc) missingProps.push(`input.${ACTION.RESOURCE_ASSOCIATION}`);
    if (missingProps.length > 0) {
      if (debug) console.log(`[JOINT] [action:hasAssociatedItem] Required properties missing: "${missingProps.join('", "')}"`);
      return reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps));
    }

    // Load trx to both resources...
    if (trx) {
      inputMain[ACTION.INPUT_TRANSACTING] = trx;
      inputAssoc[ACTION.INPUT_TRANSACTING] = trx;
    }

    // Return existing associations of this type...
    inputMain[ACTION.INPUT_RELATIONS] = [assocName];

    // Lookup resources...
    return Promise.all([
      getItem(bookshelf, specMain, inputMain),
      getItem(bookshelf, specAssoc, inputAssoc),
    ])
    .then(([main, assoc]) => {
      // If has association, return it...
      const idToCheck = assoc.id;
      if (objectUtils.includes(main.related(assocName).pluck('id'), idToCheck)) {
        // Return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelNameAssoc, assoc, bookshelf));
          default: return resolve(assoc);
        }
      }

      // Otherwise, reject with a 404...
      return reject(StatusErrors.generateAssociationDoesNotExistError(modelNameAssoc));
    })
    .catch((error) => {
      return reject(error);
    });
  });
} // END - hasAssociatedItem
