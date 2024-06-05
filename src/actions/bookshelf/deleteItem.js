import objectUtils from '../../utils/object-utils'
import * as StatusErrors from '../../core/errors/status-errors'
import * as AuthUtils from '../../core/authorization/auth-utils'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import * as ActionUtils from '../action-utils'
import * as BookshelfUtils from './utils/bookshelf-utils'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function deleteItem (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const trx = input[ACTION.INPUT_TRANSACTING]

  // Continue on existing transaction...
  if (trx) return performDeleteItem(joint, spec, input, output)

  // Otherwise, start new transaction...
  return bookshelf.transaction((newTrx) => {
    const newInput = Object.assign({}, input)
    newInput[ACTION.INPUT_TRANSACTING] = newTrx
    return performDeleteItem(joint, spec, newInput, output)
  })
}

async function performDeleteItem (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const modelName = spec[ACTION.SPEC_MODEL_NAME]
  const specFields = ActionUtils.normalizeFieldSpec(spec[ACTION.SPEC_FIELDS])
  const specAuth = spec[ACTION.SPEC_AUTH] || {}
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS])
  const trx = input[ACTION.INPUT_TRANSACTING]
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT]

  // Reject if model does not exist...
  const model = bookshelf.model(modelName)
  if (!model) {
    if (debug) console.log(`[JOINT] [action:deleteItem] The model "${modelName}" is not recognized`)
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName))
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields)
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:deleteItem] Action has missing required fields:', requiredFieldCheck.missing)
    return Promise.reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing))
  }

  // Perform lookup of item first, if specified...
  const lookupFieldData = ActionUtils.getLookupFieldData(specFields, inputFields)
  if (lookupFieldData) {
    return doLookupThenAction(joint, lookupFieldData, modelName, specFields, specAuth, inputFields, authContext, trx, output)
  }

  // Otherwise, just perform action...
  return doAction(joint, modelName, specFields, specAuth, null, inputFields, authContext, trx, output)
} // END - performDeleteItem

async function doLookupThenAction (joint, lookupFieldData, modelName, specFields, specAuth, inputFields, authContext, trx, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const getItemOpts = { require: true }
  if (trx) getItemOpts.transacting = trx

  try {
    const resource = await bookshelf.model(modelName).query((queryBuilder) => {
      Object.entries(lookupFieldData)
        .forEach(([fieldName, field]) => {
          BookshelfUtils.appendWhereClause(queryBuilder, fieldName, field.value, field.matchStrategy)
        })
    }).fetch(getItemOpts)

    // Prepare ownerCreds from retrieved data...
    const combinedFields = Object.assign({}, resource.attributes, inputFields)
    const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, combinedFields)

    return doAction(joint, modelName, specFields, specAuth, ownerCreds, inputFields, authContext, trx, output)
  } catch (error) {
    return handleErrorResponse(error, 'deleteItem', modelName)
  }
} // END - doLookupThenAction

async function doAction (joint, modelName, specFields, specAuth, ownerCreds, inputFields, authContext, trx, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]

  // Respect auth...
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES]
  if (authRules) {
    const ownerCredsData = ownerCreds || ActionUtils.parseOwnerCreds(specAuth, inputFields)
    if (!AuthUtils.isAllowed(authContext, authRules, ownerCredsData)) {
      return Promise.reject(StatusErrors.generateNotAuthorizedError())
    }
  } // end-if (authRules)

  // Prepare action options...
  const actionOpts = { require: true }
  if (trx) actionOpts.transacting = trx

  // Build where clause...
  const queryOpts = (queryBuilder) => {
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name
        const hasInput = objectUtils.has(inputFields, fieldName)
        const matchStrategy = objectUtils.get(inputFields,
          `${fieldName}.matchStrategy`,
          ACTION.INPUT_FIELD_MATCHING_STRATEGY_EXACT
        )
        if (hasInput) {
          BookshelfUtils.appendWhereClause(queryBuilder, fieldName, inputFields[fieldName].value, matchStrategy)
        }
      })
    } // end-if (inputFields && specFields)
  }

  // Debug executing logic...
  if (debug) console.log(`[JOINT] [action:deleteItem] EXECUTING => DELETE ${modelName} WHERE`, queryOpts)

  try {
    // Delete item...
    const data = await bookshelf.model(modelName).query(queryOpts).destroy(actionOpts)
    return handleDataResponse(joint, modelName, data, output)
  } catch (error) {
    return handleErrorResponse(error, 'deleteItem', modelName)
  }
} // END - doAction
