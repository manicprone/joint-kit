import toJsonApi from '../serializers/json-api'

export function handleDataResponse(joint, modelName, data, output) {
  // Return data in requested format...
  switch (output) {
    case 'json-api': return toJsonApi(modelName, data, joint)
    default: return data
  }
}
