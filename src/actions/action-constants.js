// -----------------------------------
// Constants for the Join action layer
// -----------------------------------

export default {
  // ------------------------------- Association Options
  // Main Resource Wrapper
  RESOURCE_MAIN: 'main',

  // Association Resource Wrapper
  RESOURCE_ASSOCIATION: 'association',

  // Association Name
  ASSOCIATION_NAME: 'associationName',

  // ------------------------------- Spec Options
  // Resource
  SPEC_MODEL_NAME: 'modelName',

  // Field Definitions
  SPEC_FIELDS: 'fields',

  // Columns to Return
  SPEC_COLUMNS_TO_RETURN: 'columnsToReturn',

  // Default Sort Order
  SPEC_DEFAULT_ORDER_BY: 'defaultOrderBy',

  // Authorization Specification
  SPEC_AUTH: 'auth',
  SPEC_AUTH_OWNER_CREDS: 'ownerCreds',


  // ------------------------------- Input Options
  // Field Input
  INPUT_FIELDS: 'fields',

  // Column Set
  INPUT_COLUMN_SET: 'columnSet',

  // Sort Order
  INPUT_ORDER_BY: 'orderBy',

  // Relations
  INPUT_RELATIONS: 'relations',
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
