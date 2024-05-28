import * as StatusErrors from '../../core/errors/status-errors'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import getItem from './getItem'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function removeAllAssociatedItems(joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performRemoveAllAssociatedItems(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performRemoveAllAssociatedItems(joint, spec, newInput, output)
  })
}

async function performRemoveAllAssociatedItems(joint, spec = {}, input = {}, output) {
  const specMain = spec[ACTION.RESOURCE_MAIN]
  const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null
  const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION]
  const assocName = (specAssoc) ? specAssoc[ACTION.SPEC_ASSOCIATION_NAME] : null
  const inputMain = input[ACTION.RESOURCE_MAIN] ? { ...input[ACTION.RESOURCE_MAIN] } : null
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Reject when required properties are not provided...
  const missingProps = []
  if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`)
  if (!specAssoc) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}`)
  if (!assocName) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}.${ACTION.SPEC_ASSOCIATION_NAME}`)
  if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`)
  if (missingProps.length > 0) {
    if (debug) console.log(`[JOINT] [action:removeAllAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`)
    return Promise.reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps))
  }

  // Load trx to main resource...
  inputMain[ACTION.INPUT_TRANSACTING] = trx

  // Return existing associations of this type...
  inputMain[ACTION.INPUT_ASSOCIATIONS] = [assocName]

  try {
    // Lookup main resource...
    const main = await getItem(joint, specMain, inputMain)

    // Remove all associations...
    await main.related(assocName).detach(null, { transacting: trx })

    // Return data...
    return handleDataResponse(joint, modelNameMain, main, output)

  } catch (error) {
    return handleErrorResponse(error, 'removeAllAssociatedItems', modelNameMain, assocName)
  }
} // END - performRemoveAllAssociatedItems
