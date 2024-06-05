// -----------------------------------------------------------------------------
// Inspects the provided service and attempts to determine the correct
// serviceKey. If a service instance is not provided, or is not recognized, the
// function returns null.
// -----------------------------------------------------------------------------
export function determineServiceKeyFromService (service) {
  let serviceKey = null

  if (service) {
    if (service.knex && typeof service.model === 'function') serviceKey = 'bookshelf'
  }

  return serviceKey
}

// -----------------------------------------------------------------------------
// Inspects the provided server and attempts to determine the correct
// serverKey. If a server instance is not provided, or is not recognized, the
// function returns null.
// -----------------------------------------------------------------------------
export function determineServerKeyFromServer (server) {
  let serverKey = null

  if (server) {
    if (server) serverKey = 'express'
  }

  return serverKey
}

// -----------------------------------------------------------------------------
// Parses the provided path string for an associated resource,
// into a descriptive object for processing.
// -----------------------------------------------------------------------------
// Currently, supports two scenarios: direct and through (1-level nested).
//
// -----------
// Direct Path
// -----------
// e.g.
// 'profile_id => Profile.id'
//
// returns:
// {
//   sourceField: 'profile_id',
//   targetModelName: 'Profile',
//   targetField: 'id',
// }
//
// ------------
// Through Path
// ------------
// e.g.
// 'profile_id => Profile.id => Profile.user_id => User.id'
//
// returns:
// {
//   sourceField: 'profile_id',
//   through: { modelName: 'Profile', fromField: 'id', toField: 'user_id' },
//   targetModelName: 'User',
//   targetField: 'id',
// }
// -----------------------------------------------------------------------------
export function parseAssociationPath (path = '') {
  let info = null

  const pathParts = path.replace(/\s+/g, '').split('=>')
  const source = pathParts[0]
  const sourceParts = source.split('.')
  const sourceField = (sourceParts.length > 1) ? sourceParts[1] : sourceParts[0]

  // Parse through connection...
  if (pathParts.length === 4) {
    const thruFrom = pathParts[1]
    const thruFromParts = thruFrom.split('.')
    const thruTo = pathParts[2]
    const thruToParts = thruTo.split('.')
    const target = pathParts[3]
    const targetParts = target.split('.')

    if (thruFromParts.length > 1 && thruToParts.length > 1 && targetParts.length > 1) {
      const thruFromModel = thruFromParts[0]
      const thruToModel = thruToParts[0]
      if (thruFromModel === thruToModel) {
        info = {
          sourceField,
          through: {
            modelName: thruFromModel, fromField: thruFromParts[1], toField: thruToParts[1]
          },
          targetModelName: targetParts[0],
          targetField: targetParts[1]
        }
      }
    }

  // Parse direct connection...
  } else if (pathParts.length === 2) {
    const target = pathParts[1]
    const targetParts = target.split('.')

    if (targetParts.length > 1) {
      info = {
        sourceField,
        targetModelName: targetParts[0],
        targetField: targetParts[1]
      }
    }
  } // end-if-else (pathParts.length === 4)

  // if (!info) {
  //   const message = `[JOINT] ERROR - The path string provided could not be parsed: ${path}`;
  //   console.error(message);
  // }

  return info
}
