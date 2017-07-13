// -----------------------------------------------------------------------------
// Status Errors for the Joint action layer
// -----------------------------------------------------------------------------
import JointStatusError from './JointStatusError';

// ---------------------------------------------------------- Bad Requests (400)

export function generateMissingFieldsError(missingFields = {}) {
  const all = missingFields.all || [];
  const oneOf = missingFields.oneOf || [];
  const hasAllFields = (all.length > 0);
  const hasOneOfFields = (oneOf.length > 0);
  const totalMissing = all.length + oneOf.length;

  let message = (totalMissing > 1)
    ? 'Missing required fields:'
    : 'Missing required field:';
  if (hasAllFields) {
    if (all.length > 1) message += ` all of => ("${all.join('", "')}")`;
    else message += ` "${all[0]}"`;
  }
  if (hasAllFields && hasOneOfFields) message += ' AND';
  if (hasOneOfFields) message += ` at least one of => ("${oneOf.join('", "')}")`;

  return new JointStatusError({
    status: 400,
    message,
  });
}

export function generateInvalidAssociationPropertiesError(missingProperties = []) {
  return new JointStatusError({
    status: 400,
    message: `The association action is invalid due to missing properties: "${missingProperties.join('", "')}"`,
  });
}

export function generateModelNotRecognizedError(modelName = '') {
  return new JointStatusError({
    status: 400,
    message: `The model "${modelName}" is not recognized.`,
  });
}

export function generateLookupFieldNotProvidedError() {
  return new JointStatusError({
    status: 400,
    message: 'A "lookup field" was either not defined or not provided.',
  });
}

// -------------------------------------------------------- Not Authorized (403)

export function generateNotAuthorizedError() {
  return new JointStatusError({
    status: 403,
    message: 'You are not authorized to perform this action.',
  });
}

// ------------------------------------------------------------- Not Found (404)

export function generateResourceNotFoundError(resourceName = '') {
  return new JointStatusError({
    status: 404,
    message: `The requested "${resourceName}" was not found.`,
  });
}

export function generateAssociationDoesNotExistError(resourceName = '') {
  return new JointStatusError({
    status: 404,
    message: `The requested "${resourceName}" association does not exist.`,
  });
}

// -------------------------------------------- General System / 3rd-party (500)

export function generateThirdPartyError(error) {
  return new JointStatusError({
    status: 500,
    message: error.message,
  });
}

// ---------------------------------------------------------------------- Custom

export function generateCustomError(message = '', status = 500) {
  return new JointStatusError({
    status,
    message,
  });
}
