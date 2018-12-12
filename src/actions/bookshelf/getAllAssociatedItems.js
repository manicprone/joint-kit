import * as StatusErrors from '../../core/errors/status-errors'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import getItem from './getItem'
import { handleDataResponse } from './handlers/response-handlers'

const debug = false

export default async function getAllAssociatedItems(joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performGetAllAssociatedItems(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performGetAllAssociatedItems(joint, spec, newInput, output)
  })
}

async function performGetAllAssociatedItems(joint, spec = {}, input = {}, output) {
  const specMain = spec[ACTION.RESOURCE_MAIN]
  const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null
  const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION]
  const assocName = (specAssoc) ? specAssoc[ACTION.SPEC_ASSOCIATION_NAME] : null
  const inputMain = input[ACTION.RESOURCE_MAIN]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Reject when required properties are not provided...
  const missingProps = []
  if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`)
  if (!specAssoc) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}`)
  if (!assocName) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}.${ACTION.SPEC_ASSOCIATION_NAME}`)
  if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`)
  if (missingProps.length > 0) {
    if (debug) console.log(`[JOINT] [action:getAllAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`)
    return Promise.reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps))
  }

  // Lookup model name of association, add to spec if not provided...
  let modelNameAssoc = specAssoc[ACTION.SPEC_MODEL_NAME]
  if (!modelNameAssoc) {
    modelNameAssoc = (joint.modelNameOfAssoc[modelNameMain])
        ? joint.modelNameOfAssoc[modelNameMain][assocName]
        : null
    specAssoc[ACTION.SPEC_MODEL_NAME] = modelNameAssoc
  }

  // Load trx to main resource...
  inputMain[ACTION.INPUT_TRANSACTING] = trx

  // Return existing associations of this type...
  inputMain[ACTION.INPUT_ASSOCIATIONS] = [assocName]

  try {
    // Lookup main resource...
    const main = await getItem(joint, specMain, inputMain)

    // Access all items of the requested association...
    const assoc = main.related(assocName)

    // Reject with 404 if instances of the requested association were not found...
    if (assoc.length === 0) {
      return Promise.reject(StatusErrors.generateAssociatedItemsDoNotExistError(modelNameAssoc))
    }

    // Return data...
    return handleDataResponse(joint, modelNameAssoc, assoc, output)

  } catch (error) {
    if (error.name === 'JointStatusError') throw error
    if (debug) console.error(`[JOINT] [action:getAllAssociatedItems] Action encountered a third-party error: ${error.message} =>`, error)
    throw StatusErrors.generateThirdPartyError(error)
  }
} // END - performGetAllAssociatedItems
