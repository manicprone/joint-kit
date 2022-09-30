/* eslint-disable no-empty */
import objectUtils from '../../utils/object-utils'
import * as StatusErrors from '../../core/errors/status-errors'
import ACTION from '../../core/constants/action-constants'
import getItem from './getItem'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function hasAssociatedItem(joint, spec = {}, input = {}, output) {
  const specMain = spec[ACTION.RESOURCE_MAIN]
  const modelNameMain = (specMain) ? specMain[ACTION.SPEC_MODEL_NAME] : null
  const specAssoc = spec[ACTION.RESOURCE_ASSOCIATION]
  const assocName = (specAssoc) ? specAssoc[ACTION.SPEC_ASSOCIATION_NAME] : null
  const inputMain = input[ACTION.RESOURCE_MAIN]
  const inputAssoc = input[ACTION.RESOURCE_ASSOCIATION]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Reject when required properties are not provided...
  const missingProps = []
  if (!specMain) missingProps.push(`spec.${ACTION.RESOURCE_MAIN}`)
  if (!specAssoc) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}`)
  if (!assocName) missingProps.push(`spec.${ACTION.RESOURCE_ASSOCIATION}.${ACTION.SPEC_ASSOCIATION_NAME}`)
  if (!inputMain) missingProps.push(`input.${ACTION.RESOURCE_MAIN}`)
  if (!inputAssoc) missingProps.push(`input.${ACTION.RESOURCE_ASSOCIATION}`)
  if (missingProps.length > 0) {
    if (debug) console.log(`[JOINT] [action:hasAssociatedItem] Required properties missing: "${missingProps.join('", "')}"`)
    return Promise.reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps))
  }

  // Lookup model name of association, add to spec if not provided...
  let modelNameAssoc = specAssoc[ACTION.SPEC_MODEL_NAME]
  if (!modelNameAssoc) {
    modelNameAssoc = (joint.modelNameOfAssoc[modelNameMain]) ? joint.modelNameOfAssoc[modelNameMain][assocName] : null
    specAssoc[ACTION.SPEC_MODEL_NAME] = modelNameAssoc
  }

  // Load trx to both resources...
  if (trx) {
    inputMain[ACTION.INPUT_TRANSACTING] = trx
    inputAssoc[ACTION.INPUT_TRANSACTING] = trx
  }

  // Return existing associations of this type...
  inputMain[ACTION.INPUT_ASSOCIATIONS] = [assocName]

  try {
    // Lookup resources...
    const main = await getItem(joint, specMain, inputMain)
    let assoc = {}
    try {
      assoc = await getItem(joint, specAssoc, inputAssoc)
    } catch (err) {}

    // If has associated item, return it...
    const idToCheck = assoc.id
    if (idToCheck && objectUtils.includes(main.related(assocName).pluck('id'), idToCheck)) {
      return handleDataResponse(joint, modelNameAssoc, assoc, output)
    }

    // Otherwise, reject with a 404...
    return Promise.reject(StatusErrors.generateAssociatedItemDoesNotExistError(modelNameAssoc))

  } catch (error) {
    return handleErrorResponse(error, 'hasAssociatedItem', modelNameMain, assocName)
  }
} // END - hasAssociatedItem
