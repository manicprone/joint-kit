// ------------------------
// Joint Instance Constants
// ------------------------

export default {
  // ------------------------------- Configured Properties
  // Persistence Service
  PROP_SERVICE: 'service',
  PROP_SERVICE_KEY: 'serviceKey',

  // Server Framework
  PROP_SERVER: 'server',
  PROP_SERVER_KEY: 'serverKey',

  // Payload Format
  PROP_PAYLOAD_FORMAT: 'output',

  // Instance Settings
  PROP_SETTINGS: 'settings',

  // Configs
  PROP_MODEL_CONFIG: 'modelConfig',
  PROP_METHOD_CONFIG: 'methodConfig',
  PROP_ROUTE_CONFIG: 'routeConfig',

  // ------------------------------- Functions
  FUNC_GENERATE: 'generate',
  FUNC_SET_SERVER: 'setServer',
  FUNC_SET_PAYLOAD_FORMAT: 'setOutput',
  FUNC_UPDATE_SETTINGS: 'updateSettings',
  FUNC_PREPARE_AUTH_CONTEXT: 'prepareAuthContext',
  FUNC_PRINT_INFO: 'info',

  // ------------------------------- Model Registries
  REGISTRY_MODEL: 'model',
  REGISTRY_MODEL_BY_TABLE: 'modelByTable',
  REGISTRY_MODEL_NAME_BY_TABLE: 'modelNameByTable',
  // REGISTRY_MODEL_NAME_OF_ASSOC: 'modelNameOfAssoc', // TODO: Do we mount this here ???

  // ------------------------------- Method Registries
  REGISTRY_METHOD: 'method',
  REGISTRY_SPEC_BY_METHOD: 'specByMethod',

  // ------------------------------- Generated Router
  ROUTER: 'router',
}
