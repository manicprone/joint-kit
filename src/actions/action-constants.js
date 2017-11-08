// ---------------------
// Join Action Constants
// ---------------------

export default {
  // ------------------------------- Association Options
  // Main Resource Wrapper
  RESOURCE_MAIN: 'main',

  // Association Resource Wrapper
  RESOURCE_ASSOCIATION: 'association',

  // ------------------------------- Spec Options
  // Resources
  SPEC_MODEL_NAME: 'modelName',
  SPEC_ASSOCIATION_NAME: 'name',

  // Field Definitions
  SPEC_FIELDS: 'fields',
  SPEC_FIELDS_OPT_NAME: 'name',
  SPEC_FIELDS_OPT_TYPE: 'type',
  SPEC_FIELDS_OPT_DEFAULT_VALUE: 'defaultValue',
  SPEC_FIELDS_OPT_REQUIRED: 'required',
  SPEC_FIELDS_OPT_REQUIRED_OR: 'requiredOr',
  SPEC_FIELDS_OPT_LOOKUP: 'lookup',
  SPEC_FIELDS_OPT_LOOKUP_OR: 'lookupOr',

  // Fields to Return / Field Set Definitions
  SPEC_FIELDS_TO_RETURN: 'fieldsToReturn',

  // Force Associations
  SPEC_FORCE_ASSOCIATIONS: 'forceAssociations',
  SPEC_FORCE_LOAD_DIRECT: 'forceLoadDirect',

  // Default Sort Order
  SPEC_DEFAULT_ORDER_BY: 'defaultOrderBy',

  // Authorization Specification
  SPEC_AUTH: 'auth',
  SPEC_AUTH_OWNER_CREDS: 'ownerCreds',

  // ------------------------------- Input Options
  // Field Input
  INPUT_FIELDS: 'fields',

  // Field Set
  INPUT_FIELD_SET: 'fieldSet',

  // Sort Order
  INPUT_ORDER_BY: 'orderBy',

  // Associations
  INPUT_ASSOCIATIONS: 'associations',
  INPUT_LOAD_DIRECT: 'loadDirect',

  // Pagination
  INPUT_PAGINATE: 'paginate',
  INPUT_PAGINATE_SKIP: 'skip',
  INPUT_PAGINATE_LIMIT: 'limit',
  DEFAULT_VALUE_PAGINATE_SKIP: 0,
  DEFAULT_VALUE_PAGINATE_LIMIT: 10,

  // Transaction Handling
  INPUT_TRANSACTING: 'trx',

  // Authorization
  INPUT_AUTH_BUNDLE: 'authBundle',
};
