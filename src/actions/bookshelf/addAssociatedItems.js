import * as StatusErrors from '../../core/errors/status-errors'
import ACTION from '../../core/constants/action-constants'
import getItem from './getItem'
import getItems from './getItems'
import toJsonApi from './serializers/json-api'

const debug = false

export default async function addAssociatedItems(bookshelf, spec = {}, input = {}, output) {
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performAddAssociatedItems(bookshelf, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performAddAssociatedItems(bookshelf, spec, newInput, output)
  })
}

async function performAddAssociatedItems(bookshelf, spec = {}, input = {}, output) {
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
    if (debug) console.log(`[JOINT] [action:addAssociatedItems] Required properties missing: "${missingProps.join('", "')}"`)
    return Promise.reject(StatusErrors.generateInvalidAssociationPropertiesError(missingProps))
  }

  // Lookup model name of association, add to spec if not provided...
  let modelNameAssoc = specAssoc[ACTION.SPEC_MODEL_NAME]
  if (!modelNameAssoc) {
    modelNameAssoc = (bookshelf.modelNameForAssoc[modelNameMain])
        ? bookshelf.modelNameForAssoc[modelNameMain][assocName]
        : null
    specAssoc[ACTION.SPEC_MODEL_NAME] = modelNameAssoc
  }

  // Load trx to both resources...
  inputMain[ACTION.INPUT_TRANSACTING] = trx
  inputAssoc[ACTION.INPUT_TRANSACTING] = trx

  // Include existing associations of this type (for return)...
  inputMain[ACTION.INPUT_ASSOCIATIONS] = [assocName]

  try {
    // Lookup resources...
    const main = await getItem(bookshelf, specMain, inputMain)
    const assoc = await getItems(bookshelf, specAssoc, inputAssoc)

    // Reject with 404 if instances of the requested association were not found...
    if (assoc.length === 0) {
      return Promise.reject(StatusErrors.generateAssociatedItemsDoNotExistError(modelNameAssoc))
    }

    // Otherwise, attach associations to main...
    await main.related(assocName).attach(assoc.models, { transacting: trx })

    // Return data in requested format...
    switch (output) {
      case 'json-api': return toJsonApi(modelNameMain, main, bookshelf)
      default: return main
    }

  } catch (error) {
    if (error.name === 'JointStatusError') throw error
    if (debug) console.error(`[JOINT] [action:addAssociatedItems] Action encountered a third-party error: ${error.message} =>`, error)
    throw StatusErrors.generateThirdPartyError(error)
  }
} // END - performAddAssociatedItems
