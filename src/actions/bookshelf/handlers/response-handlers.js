import * as StatusErrors from '../../../core/errors/status-errors'
import toJsonApi from '../serializers/json-api'

export function handleDataResponse(joint, modelName, data, output) {
  // Return data in requested format
  switch (output) {
    case 'json-api': return toJsonApi(modelName, data, joint)
    default: return data
  }
}

export function handleErrorResponse(error, actionName = '', mainModelName = 'resource', assocs) {
  if (error.name === 'JointStatusError') throw error // throw if already handled by Joint
  const message = error.message

  let jointError = null

  if (message) {
    // -------------------------------------------------------------------------
    // 404 scenarios
    // -------------------------------------------------------------------------
    if (message === 'EmptyResponse' || message === 'No Rows Deleted') {
      jointError = StatusErrors.generateResourceNotFoundError(mainModelName)

    // -------------------------------------------------------------------------
    // 400 scenarios
    // -------------------------------------------------------------------------
    } else if (assocs && assocs.length > 0 && message.includes(assocs)) {
      // Bad association request or configuration
      jointError = StatusErrors.generateAssociationNotRecognizedError(assocs)

    } else {
      // Bad main request or configuration
      let displayMessage = message
      const matches = message.match(/\S+\s+(\S+)\s+(?=does not exist)/) // try to extract the values causing the issue
      const rootIssueMatch = (matches && matches.length > 0) ? matches[0] : '' // final word is the field value
      const fieldValueMatch = (matches && matches.length > 0) ? matches[matches.length - 1] : null // final word is the field value
      const rootObjectMatch = rootIssueMatch.match(/^([\w-]+)/) // first word of root object match
      const rootIssue = (rootObjectMatch) ? rootObjectMatch[0] : 'config'

      // Detect error
      if (rootIssue === 'role') {
        displayMessage = `DB user ${fieldValueMatch} does not exist`
        jointError = StatusErrors.generateDbConfigError(displayMessage)
      } else if (rootIssue === 'database') {
        displayMessage = `DB ${fieldValueMatch} does not exist`
        jointError = StatusErrors.generateDbConfigError(displayMessage)
      } else if (fieldValueMatch) {
        displayMessage = `${fieldValueMatch} does not exist`
        jointError = StatusErrors.generateModelConfigError(mainModelName, displayMessage)
      } else {
        jointError = StatusErrors.generateModelConfigError(mainModelName, displayMessage)
      }
    }

  // ---------------------------------------------------------------------------
  // 500 scenarios
  // ---------------------------------------------------------------------------
  } else {
    console.error(`[JOINT] [action:${actionName}] Action encountered a third-party error =>`, error)
    jointError = StatusErrors.generateThirdPartyError(error)
  }

  throw jointError
}
