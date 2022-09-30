import * as StatusErrors from '../../../core/errors/status-errors'
import toJsonApi from '../serializers/json-api'

export function handleDataResponse(joint, modelName, data, output) {
  // Return data in requested format...
  switch (output) {
    case 'json-api': return toJsonApi(modelName, data, joint)
    default: return data
  }
}

export function handleErrorResponse(error, actionName = '', mainModelName = 'resource', assocs) {
  if (error.name === 'JointStatusError') throw error // throw if already handled by Joint

  let jointError = null

  if (error.message) {
    // 404 scenarios...
    if (error.message === 'EmptyResponse' || error.message === 'No Rows Deleted') {
      jointError = StatusErrors.generateResourceNotFoundError(mainModelName)

    // 400 scenarios...
    } else if (assocs && error.message.includes(assocs)) {
      jointError = StatusErrors.generateAssociationNotRecognizedError(assocs)
    }

  // 500 scenarios...
  } else {
    console.error(`[JOINT] [action:${actionName}] Action encountered a third-party error: ${error.message} =>`, error)
    jointError = StatusErrors.generateThirdPartyError(error)
  }

  throw jointError
}
