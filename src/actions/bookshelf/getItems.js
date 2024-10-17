import objectUtils from '../../utils/object-utils'
import * as StatusErrors from '../../core/errors/status-errors'
import * as AuthUtils from '../../core/authorization/auth-utils'
import INSTANCE from '../../core/constants/instance-constants'
import ACTION from '../../core/constants/action-constants'
import * as ActionUtils from '../action-utils'
import * as BookshelfUtils from './utils/bookshelf-utils'
import { handleDataResponse, handleErrorResponse } from './handlers/response-handlers'

const debug = false

export default async function getItems (joint, spec = {}, input = {}, output) {
  const bookshelf = joint[INSTANCE.PROP_SERVICE]
  const modelName = spec[ACTION.SPEC_MODEL_NAME]
  const specFields = ActionUtils.normalizeFieldSpec(spec[ACTION.SPEC_FIELDS])
  const specAuth = spec[ACTION.SPEC_AUTH] || {}
  const authRules = specAuth[ACTION.SPEC_AUTH_RULES]
  const returnColsDef = spec[ACTION.SPEC_FIELDS_TO_RETURN]
  const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS])
  const trx = input[ACTION.INPUT_TRANSACTING]
  const authContext = input[ACTION.INPUT_AUTH_CONTEXT]

  // Reject if model does not exist...
  const model = bookshelf.model(modelName)
  if (!model) {
    if (debug) console.log(`[JOINT] [action:getItems] The model "${modelName}" is not recognized`)
    return Promise.reject(StatusErrors.generateModelNotRecognizedError(modelName))
  }

  // Reject when required fields are not provided...
  const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields)
  if (!requiredFieldCheck.satisfied) {
    if (debug) console.log('[JOINT] [action:getItems] Action has missing required fields:', requiredFieldCheck.missing)
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

  // Restrict columns to return with payload...
  if (returnColsDef) {
    // If a single set (array) is defined, honor the setting...
    if (Array.isArray(returnColsDef)) {
      actionOpts.columns = returnColsDef

    // Otherwise, try to honor the set requested by the input...
    } else if (input[ACTION.INPUT_FIELD_SET] && objectUtils.has(returnColsDef, input[ACTION.INPUT_FIELD_SET])) {
      actionOpts.columns = returnColsDef[input[ACTION.INPUT_FIELD_SET]]

    // If the input does not declare a set, check for a "default" set...
    } else if (returnColsDef.default && Array.isArray(returnColsDef.default)) {
      actionOpts.columns = returnColsDef.default
    }
  } // end-if (returnColsDef)

  // Set pagination options, if requested...
  if (input.paginate) {
    const skip = objectUtils.get(input.paginate, ACTION.INPUT_PAGINATE_SKIP, ACTION.DEFAULT_VALUE_PAGINATE_SKIP)
    const limit = objectUtils.get(input.paginate, ACTION.INPUT_PAGINATE_LIMIT, ACTION.DEFAULT_VALUE_PAGINATE_LIMIT)
    actionOpts.offset = skip
    actionOpts.limit = limit
  }

  // -------------------------------------------------------------------------
  // Include associations (associations & loadDirect will be combined)
  // -------------------------------------------------------------------------
  // Handle "loadDirect" option...
  const inputLoadDirectDef = input[ACTION.INPUT_LOAD_DIRECT] || []
  const loadDirectDef = (spec[ACTION.SPEC_FORCE_LOAD_DIRECT])
    ? spec[ACTION.SPEC_FORCE_LOAD_DIRECT].concat(inputLoadDirectDef)
    : inputLoadDirectDef
  const loadDirect = ActionUtils.parseLoadDirect(loadDirectDef)
  // Handle "associations" option...
  const inputAssocs = input[ACTION.INPUT_ASSOCIATIONS] || []
  const assocs = (spec[ACTION.SPEC_FORCE_ASSOCIATIONS])
    ? objectUtils.union(spec[ACTION.SPEC_FORCE_ASSOCIATIONS], inputAssocs)
    : inputAssocs
  // Combine...
  const allAssociations = (loadDirect.associations && loadDirect.associations.length > 0)
    ? objectUtils.union(assocs, loadDirect.associations)
    : assocs
  if (allAssociations.length > 0) actionOpts.withRelated = allAssociations

  // Prepare query...
  const queryOpts = (queryBuilder) => {
    // Build where clause...
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name
        const hasDefault = objectUtils.has(fieldSpec, ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE)
        const defaultValue = (hasDefault) ? ActionUtils.processDefaultValue(inputFields, fieldSpec[ACTION.SPEC_FIELDS_OPT_DEFAULT_VALUE]) : null
        const hasInput = objectUtils.has(inputFields, fieldName)
        const matchStrategy = objectUtils.get(inputFields,
          `${fieldName}.matchStrategy`,
          ACTION.INPUT_FIELD_MATCHING_STRATEGY_EXACT
        )
        const isLocked = objectUtils.get(fieldSpec, ACTION.SPEC_FIELDS_OPT_LOCKED, false)

        if (!isLocked && (hasInput || hasDefault)) {
          const inputValue = (hasInput) ? inputFields[fieldName].value : defaultValue
          BookshelfUtils.appendWhereClause(queryBuilder, fieldName, inputValue, matchStrategy)
        } else if (isLocked && hasDefault) {
          BookshelfUtils.appendWhereClause(queryBuilder, fieldName, defaultValue, matchStrategy)
        }
      }) // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Set orderBy options...
    const defaultOrderBy = objectUtils.get(spec, ACTION.SPEC_DEFAULT_ORDER_BY, null)
    const requestedOrderBy = objectUtils.get(input, ACTION.INPUT_ORDER_BY, null)
    const orderByOpts = requestedOrderBy || defaultOrderBy
    if (orderByOpts) {
      const orderBy = BookshelfUtils.buildOrderBy(orderByOpts)
      orderBy.map(orderOpt => queryBuilder.orderBy(orderOpt.col, orderOpt.order))
    }
  }

  try {
    // Get items...
    const data = (input.paginate)
      ? await model.query(queryOpts).fetchPage(actionOpts) // perform paginated request
      : await model.query(queryOpts).fetchAll(actionOpts) // return all items

    // Handle loadDirect requests...
    if (loadDirect.associations) {
      data.models.forEach(itemData => BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, input.associations))
    }

    // Return data...
    return handleDataResponse(joint, modelName, data, output)
  } catch (error) {
    return handleErrorResponse(error, 'getItems', modelName, inputAssocs)
  }
} // END - getItems
