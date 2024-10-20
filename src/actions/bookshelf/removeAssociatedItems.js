import * as StatusErrors from '../../core/errors/status-errors'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import getItem from './getItem'
import getItems from './getItems'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function removeAssociatedItems (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performRemoveAssociatedItems(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performRemoveAssociatedItems(joint, spec, newInput, output)
  })
}

async function performRemoveAssociatedItems (joint, spec = {}, input = {}, output) {
  const specMain = spec[ACTION.RESOURCE_MAIN]
  const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null
  const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION]
  const assocName = (specAssoc) ? specAssoc[ACTION.SPEC_ASSOCIATION_NAME] : null
  const inputMain = input[ACTION.RESOURCE_MAIN] ? { ...input[ACTION.RESOURCE_MAIN] } : null
  const inputAssoc = input[ACTION.RESOURCE_ASSOCIATION] ? { ...input[ACTION.RESOURCE_ASSOCIATION] } : null
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Reject when required properties are not provided...
  const missingProps = []
  if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`)
  if (!specAssoc) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}`)
  if (!assocName) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}.${ACTION.SPEC_ASSOCIATION_NAME}`)
  if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`)
  if (!inputAssoc) missingProps.push(`input.${ACTION.RESOURCE_ASSOCIATION}`)
  if (missingProps.length > 0) {
    if (debug) console.log(`[JOINT] [action:removeAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`)
    return Promise.reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps))
  }

  // Lookup model name of association, add to spec if not provided...
  let modelNameAssoc = specAssoc[ACTION.SPEC_MODEL_NAME]
  if (!modelNameAssoc) {
    modelNameAssoc = (joint.modelNameOfAssoc[modelNameMain]) ? joint.modelNameOfAssoc[modelNameMain][assocName] : null
    specAssoc[ACTION.SPEC_MODEL_NAME] = modelNameAssoc
  }

  // Load trx to both resources...
  inputMain[ACTION.INPUT_TRANSACTING] = trx
  inputAssoc[ACTION.INPUT_TRANSACTING] = trx

  // Include existing associations of this type (for return)...
  inputMain[ACTION.INPUT_ASSOCIATIONS] = [assocName]

  try {
    // Lookup resources...
    const main = await getItem(joint, specMain, inputMain)
    const assoc = await getItems(joint, specAssoc, inputAssoc)

    // Reject with 404 if instances of the requested association were not found...
    if (assoc.length === 0) {
      // TODO: Handle the scenario/message for invalid assoc name !!!
      // console.log('[DEVING] [REMOVE-ASSOC-ITEMS] I might be a 404 due to invalid association name !!!')
      return Promise.reject(StatusErrors.generateAssociatedItemsDoNotExistError(modelNameAssoc))
    }

    // Otherwise, remove associations from main...
    await main.related(assocName).detach(assoc.models, { transacting: trx })

    // Return data...
    return handleDataResponse(joint, modelNameMain, main, output)
  } catch (error) {
    return handleErrorResponse(error, 'removeAssociatedItems', modelNameMain, assocName)
  }
} // END - performRemoveAssociatedItems
