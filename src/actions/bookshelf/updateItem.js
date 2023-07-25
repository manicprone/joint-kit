import objectUtils from '../../utils/object-utils'
import * as StatusErrors from '../../core/errors/status-errors'
import * as AuthUtils from '../../core/authorization/auth-utils'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import * as ActionUtils from '../action-utils'
import * as BookshelfUtils from './utils/bookshelf-utils'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function updateItem(joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performUpdateItem(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performUpdateItem(joint, spec, newInput, output)
  })
}

async function performUpdateItem(joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const modelName = spec[ACTION.SPEC_MODEL_NAME]
  const specFields = ActionUtils.normalizeFieldSpec(spec[ACTION.SPEC_FIELDS])
  const specAuth = spec[ACTION.SPEC_AUTH] || {}
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES]
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS])
  const trx = input[ACTION.INPUT_TRANSACTING]
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT]

  // Reject if model does not exist...
  const model = bookshelf.model(modelName)
  if (!model) {
    if (debug) console.log(`[JOINT] [action:updateItem] The model "${modelName}" is not recognized`)
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName))
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields)
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:updateItem] Action has missing required fields:', requiredFieldCheck.missing)
    return Promise.reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing))
  }

  // Determine lookup field to fetch item...
  const lookupFieldData = ActionUtils.getLookupFieldData(specFields, inputFields)
  if (!lookupFieldData) {
    // Reject when a lookup field cannot be determined...
    if (debug) console.log('[JOINT] [action:updateItem] Action did not define or provide a "lookup field"')
    return Promise.reject(StatusErrors.generateLookupFieldNotProvidedError())
  }

  try {
    // Get item to perform the update action...
    const getItemOpts = { require: true }
    if (trx) getItemOpts.transacting = trx
    const resource = await model.query((queryBuilder) => {
      Object.entries(lookupFieldData).forEach(([key, field]) => {
        BookshelfUtils.appendWhereClause(queryBuilder, key, field.value, field.matchStrategy)
      })
    }).fetch(getItemOpts)

    // Respect auth...
    if (authRules) {
      const combinedFields = Object.assign({}, resource.attributes, inputFields)
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields)

      if (!AuthUtils.isAllowed(authContext, authRules, ownerCreds)) {
        return Promise.reject(StatusErrors.generateNotAuthorizedError())
      }
    } // end-if (authRules)

    // Prepare update action options...
    const actionOpts = { patch: true }
    if (trx) actionOpts.transacting = trx

    // Build update package...
    const updates = {}
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name
        const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE)
        const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null
        const hasInput = objectUtils.has(inputFields, fieldName)
        const isLookup = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP, false) || objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOOKUP_OR, false)
        const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false)

        if (!isLocked && !isLookup && (hasInput || hasDefault)) {
          updates[fieldName] = (hasInput)
              ? inputFields[fieldName].value
              : defaultValue
        } else if (isLocked && !isLookup && hasDefault) {
          updates[fieldName] = defaultValue
        }
      }) // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Debug executing logic...
    if (debug) console.log(`[JOINT] [action:updateItem] EXECUTING => UPDATE ${modelName} WITH`, updates)

    // Update item...
    const data = await resource.save(updates, actionOpts)

    // Return data...
    return handleDataResponse(joint, modelName, data, output)

  } catch (error) {
    return handleErrorResponse(error, 'updateItem', modelName)
  }
} // END - performUpdateItem
