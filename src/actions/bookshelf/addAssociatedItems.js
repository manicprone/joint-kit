import Promise from 'bluebird';
import * as StatusErrors from '../../errors/status-errors';
import ACTION from '../action-constants';
import getItem from './getItem';
import getItems from './getItems';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function addAssociatedItems(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performAddAssociatedItems(bookshelf, spec, input, output);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performAddAssociatedItems(bookshelf, spec, newInput, output);
  });
}

function performAddAssociatedItems(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const specMain = spec[ACTION.RESOURCE_MAIN];
    const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null;
    const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION];
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
      if (debug) console.log(`[JOINT] [action:addAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`);
      return reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps));
    }

    // Lookup model name of association, add to spec if not provided...
    let modelNameAssoc = specAssoc[ACTION.SPEC_MODEL_NAME];
    if (!modelNameAssoc) {
      modelNameAssoc = (bookshelf.modelNameForAssoc[modelNameMain])
          ? bookshelf.modelNameForAssoc[modelNameMain][assocName]
          : null;
      specAssoc[ACTION.SPEC_MODEL_NAME] = modelNameAssoc;
    }

    // Load trx to both resources...
    inputMain[ACTION.INPUT_TRANSACTING] = trx;
    inputAssoc[ACTION.INPUT_TRANSACTING] = trx;

    // Include existing associations of this type (for return)...
    inputMain[ACTION.INPUT_RELATIONS] = [assocName];

    // Lookup resources...
    return Promise.all([
      getItem(bookshelf, specMain, inputMain),
      getItems(bookshelf, specAssoc, inputAssoc),
    ])
    .then(([main, assoc]) => {
      // Reject with 404 if instances of the requested association were not found...
      if (assoc.length === 0) {
        return reject(StatusErrors.generateAssociatedItemsDoNotExistError(modelNameAssoc));
      }

      // Otherwise, attach associations to main...
      return main.related(assocName).attach(assoc.models, { transacting: trx })
        .then(() => {
          // Return data in requested format...
          switch (output) {
            case 'json-api': return resolve(toJsonApi(modelNameMain, main, bookshelf));
            default: return resolve(main);
          }
        });
    })
    .catch((error) => {
      return reject(error);
    });
  });
} // END - performAddAssociatedItems
