import objectUtils from '../../utils/object-utils'
import * as StatusErrors from '../../core/errors/status-errors'
import * as AuthUtils from '../../core/authorization/auth-utils'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import * as ActionUtils from '../action-utils'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function createItem (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performCreateItem(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performCreateItem(joint, spec, newInput, output)
  })
}

async function performCreateItem (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const modelName = spec[ACTION.SPEC_MODEL_NAME]
  const specFields = spec[ACTION.SPEC_FIELDS]
  const specAuth = spec[ACTION.SPEC_AUTH] || {}
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES]
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS])
  const trx = input[ACTION.INPUT_TRANSACTING]
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT]

  // Reject if model does not exist...
  const model = bookshelf.model(modelName)
  if (!model) {
    if (debug) console.log(`[JOINT] [action:createItem] The model "${modelName}" is not recognized`)
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName))
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields)
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:createItem] Action has missing required fields:', requiredFieldCheck.missing)
    return Promise.reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing))
  }

  // Respect auth...
  if (authRules) {
    const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, inputFields)
    if (!AuthUtils.isAllowed(authContext, authRules, ownerCreds)) {
      return Promise.reject(StatusErrors.generateNotAuthorizedError())
    }
  } // end-if (authRules)

  // Prepare action options...
  const actionOpts = {}
  if (trx) actionOpts.transacting = trx

  // Build create package...
  const createData = {}
  if (inputFields && specFields) {
    specFields.forEach((fieldSpec) => {
      const fieldName = fieldSpec.name
      const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE)
      const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null
      const hasInput = objectUtils.has(inputFields, fieldName)
      const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false)

      if (hasInput || hasDefault) {
        const inputValue = !isLocked && hasInput ? inputFields[fieldName].value : defaultValue
        createData[fieldName] = inputValue
      }
    }) // end-specFields.forEach
  } // end-if (inputFields && specFields)

  // Debug executing logic...
  if (debug) console.log(`[JOINT] [action:createItem] EXECUTING => CREATE ${modelName} WITH`, createData)

  try {
    // Create item...
    const data = await model.forge(createData).save(null, actionOpts)
    return handleDataResponse(joint, modelName, data, output)
  } catch (error) {
    return handleErrorResponse(error, 'createItem', modelName)
  }
} // END - performCreateItem
