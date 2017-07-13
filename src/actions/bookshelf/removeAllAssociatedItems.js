import Promise from 'bluebird';
import * as StatusErrors from '../../errors/status-errors';
import ACTION from '../action-constants';
import getItem from './getItem';

const debug = false;

export default function removeAllAssociatedItems(bookshelf, spec = {}, input = {}) {
  const trx = input[ACTION.INPUT_TRANSACTING];

  // Continue on existing transaction...
  if (trx) return performRemoveAllAssociatedItems(bookshelf, spec, input);

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input);
    newInput[ACTION.INPUT_TRANSACTING] = newTrx;
    return performRemoveAllAssociatedItems(bookshelf, spec, newInput);
  });
}

function performRemoveAllAssociatedItems(bookshelf, spec = {}, input = {}) {
  return new Promise((resolve, reject) => {
    const specMain = spec[ACTION.RESOURCE_MAIN];
    const assocName = spec[ACTION.ASSOCIATION_NAME];
    const inputMain = input[ACTION.RESOURCE_MAIN];
    const trx = input[ACTION.INPUT_TRANSACTING];

    // Reject when required properties are not provided...
    const missingProps = [];
    if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`);
    if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`);
    if (!assocName) missingProps.push(`spec.${ACTION.ASSOCIATION_NAME}`);
    if (missingProps.length > 0) {
      if (debug) console.log(`[JOINT] [action:removeAllAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`);
      return reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps));
    }

    // Load trx to main resource...
    inputMain[ACTION.INPUT_TRANSACTING] = trx;

    // Return existing associations of this type...
    inputMain[ACTION.INPUT_RELATIONS] = [assocName];

    // Lookup main resource...
    return getItem(bookshelf, specMain, inputMain)
      .then((main) => {
        // Remove all associations...
        return main.related(assocName).detach(null, { transacting: trx })
          .then(() => {
            return resolve(main);
          });
      })
      .catch((error) => {
        return reject(error);
      });
  });
} // END - performRemoveAllAssociatedItems
