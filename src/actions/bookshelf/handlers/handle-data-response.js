import toJsonApi from '../serializers/json-api'

export default function handleDataResponse(modelName, data, output, bookshelf) {
  // Return data in requested format...
  switch (output) {
    case 'json-api': return toJsonApi(modelName, data, bookshelf)
    default: return data
  }
}
