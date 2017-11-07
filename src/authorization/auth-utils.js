import objectUtils from '../utils/object-utils';
// import { authorizedApps as authorizedAppConfig } from '../config/server-config';

// TODO: Fix the "owner / delegateRole" protection logic !!!
//       -----------------------------------------------------------------------
//       Remove delegateRole, extend "owner" to support more string values:
//       e.g.
//       ----------------------
//       owner: ['me', 'admin']
//       ----------------------
//       "me" =>    (existing logic)
//       "admin" => (will look for this value in the roles of the context)
//
//       The context property for "roles" is configurable via settings.
//       The order of the values specifies the order of the check.
//       -----------------------------------------------------------------------

// TODO: Add support for "rolesAll" !!!
// TODO: Add CSRF check to rules & logic !!!
// TODO: Populate request_uri based upon server implementation !!!

const debugCheck = false;

// -----------------------------------------------------------------------------
// Generates an authBundle to handle authorization on a Joint Action request.
// -----------------------------------------------------------------------------
// (1) Use this function to generate an "authBundle" that describes the
//     authorization rules for a Joint Action request.
//
// (2) Then, use the "isAllowed" function to determine if the user request
//     is authorized (against the generated "authBundle" and the user input).
// -----------------------------------------------------------------------------
// Supported rules (in order of processing logic):
//
// owner: <String>         => Restricts the usage of the request to
//                            the designated ownership of the data.
//                            That is, if the request is to update a Post,
//                            only the user specified can carry out the action.
//
//                            The most common value is the special string: "me".
//                            This value ensures that the data being requested
//                            is data that is "owned" by the requesting user.
//                            (Currently, "me" is the only value supported.)
//
// delegateRole: <String>  => This rule is only relevant if there is an "owner"
//                            rule in place. If provided, a requesting user with
//                            this role can perform the action, even if they are
//                            not the owner of the data. This rule effectively
//                            grants ownership "delegation" to the provided role.
//
// rolesAny: <Array>       => The requesting user must have at least
//                            one of the roles provided in the array (OR).
//                            If an owner rule is provided, both rules must pass.
//
// rolesAll: <Array>       => The requesting user must have all of
//                            the roles provided in the array (AND).
//                            If an owner rule is provided, both rules must pass.
//
// authorizedApps: <Array> => Restricts the usage of the request to authorized
//                            apps. The value is an array of app idendifiers
//                            that have registered with the system. The request
//                            must contain the proprietary header and secret
//                            that was shared with the app during registration
//                            to be granted authorization.
//
// denyWhenAny: <Array>    => Restricts the usage of this request when any of
//                            the provided name/value pairs is present in the
//                            session info (OR). Use this rule to ban specific
//                            users or to restrict access on specific status
//                            scenarios, etc.
//
// denyWhenAll: <Array>    => Restricts the usage of this request when all of
//                            the provided name/value pairs are present in the
//                            session info (AND).
// -----------------------------------------------------------------------------
// The returned authBundle package has the shape:
//
// e.g. (with server-side context)
// {
//   user: <user_auth_context>,
//   rules,
// }
//
// e.g. (with HTTP request context)
// {
//   user: <user_auth_context>,
//   request_method: 'POST',
//   request_uri: '/profile/333',
//   request_headers: <request_headers>,
//   rules,
// }
//
// NOTE: When the "isAllowed" function is used, it is technically unnecessary
// to be aware of the contents returned with the "authBundle" package. The
// "isAllowed" logic will follow the orders specified by the "rules".
// -----------------------------------------------------------------------------
export function buildAuthBundle(settings, context, rules = {}) {
  const bundle = {};

  const debugBuild = objectUtils.get(settings, 'auth.debugBuild', false);
  const isHttpRequest = (objectUtils.has(context, 'session'));

  if (debugBuild) {
    if (isHttpRequest) console.log('[JOINT] [AUTH-UTILS] Preparing auth bundle for HTTP request...');
    else console.log('[JOINT] [AUTH-UTILS] Preparing auth bundle for server-side request...');
  }

  // Build bundle...
  bundle.rules = rules;
  if (isHttpRequest) {
    // Load request info...
    bundle.request_method = objectUtils.get(context, 'method', null);
    bundle.request_uri = objectUtils.get(context, 'originalUrl', '');
    bundle.request_headers = objectUtils.get(context, 'headers', null);

    // Load authenticated info from the session...
    const sessionNameForUser = objectUtils.get(settings, 'auth.sessionNameForUser', null);
    bundle.user = objectUtils.get(context, `session.${sessionNameForUser}`, {});

    if (debugBuild) {
      if (bundle.user) {
        console.log(`Authed session info (${sessionNameForUser}):`);
        console.log(bundle.user);
      }
      console.log('Request headers:');
      console.log(bundle.request_headers);
    }
  } else {
    bundle.user = context;
    if (debugBuild && bundle.user) {
      console.log('Authed context info:');
      console.log(bundle.user);
    }
  }

  if (debugBuild) {
    console.log('[JOINT] [AUTH-UTILS] authBundle =>');
    console.log(bundle);
    console.log('-------------------------------------------\n');
  }

  return bundle;
}

// -----------------------------------------------------------------------------
// Use this method to perform the validation of auth rules within an API action.
// Include the authBundle passed to the action, and optionally an "ownerCreds"
// object (described below).
// -----------------------------------------------------------------------------
// In order to support owner-level authorization, an action must call this
// method providing an "ownerCreds" object. Effectively, this object describes
// the owner of the data upon which it is acting.
//
// TODO: Complete description of functionality/usage !!!
//
// -----------------------------------------------------------------------------
export function isAllowed(authBundle = {}, ownerCreds = {}) {
  let result = false;

  const authRules = authBundle.rules || {};
  // const requestHeaders = authBundle.request_headers;
  const userContext = authBundle.user;

  if (debugCheck) {
    console.log(`[JOINT] [AUTH-UTILS] Checking if request is allowed on: ${authBundle.request_method} ${authBundle.request_uri}`);
    console.log('------------------- ownerCreds');
    console.log(ownerCreds);
    console.log('------------------- authRules');
    console.log(authRules);
    console.log('');
  }

  // Parse auth rules...
  const ownerToCheck = authRules.owner;
  const delegateRoleToCheck = authRules.delegateRole;
  const rolesAnyToCheck = authRules.rolesAny;
  // const appsToCheck = authRules.authorizedApps;
  const denyWhenAnyToCheck = authRules.denyWhenAny;

  // Check owner...
  if (ownerToCheck) {
    result = isAllowedOwner(ownerToCheck, ownerCreds, userContext);
  }

  // TODO: This check should be executed inside the "if (ownerToCheck)" clause,
  //       because it is only relevant if ownership auth is declared !!!
  // Check delegate role...
  if (!result && delegateRoleToCheck) {
    result = isAllowedRole(delegateRoleToCheck, userContext);
  }

  // Check roles any...
  if (!result && rolesAnyToCheck) {
    for (let i = 0; i < rolesAnyToCheck.length; i++) {
      result = isAllowedRole(rolesAnyToCheck[i], userContext);
      if (result) break;
    }
  }

  // Check authorized apps...
  // if (!result && appsToCheck) {
  //   result = isAuthorizedApp(appsToCheck, requestHeaders);
  // }

  // Check for explicitly denied scenarios...
  if (result && denyWhenAnyToCheck) {
    const isDenied = isDeniedByAny(denyWhenAnyToCheck, userContext);
    if (isDenied) result = false;
  }

  if (debugCheck) console.log('=========> isAllowed?', result);

  return result;
}

export function isAllowedOwner(ownerToCheck, ownerCreds, userContext) {
  let result = false;

  if (debugCheck) {
    console.log('checking owner =>', ownerToCheck);
    console.log('checking against context info:');
    console.log(userContext);
  }

  if (!userContext) return false; // reject if no auth context is found

  // Handle the special "me" value...
  if (ownerToCheck === 'me') {
    // Access the field data to use for identification...
    const fields = Object.keys(ownerCreds);
    if (fields.length > 0) {
      const credFieldName = fields[0];
      const credFieldValue = ownerCreds[credFieldName];

      // Ensure the userContext matches the ownerCreds...
      if (Array.isArray(userContext[credFieldName])) {
        result = objectUtils.includes(userContext[credFieldName], credFieldValue);
        if (debugCheck) console.log(`Does ${credFieldValue} exist in context[${credFieldName}] ? ${result}`);
      } else {
        result = (userContext[credFieldName] === credFieldValue);
        if (debugCheck) console.log(`Does ${credFieldName}: ${credFieldValue} === context[${credFieldName}]: ${userContext[credFieldName]} ? ${result}`);
      }
    } else if (debugCheck) {
      console.log('The ownerCreds provided is empty, so ownership cannot be verified');
    }
  } // end-if (ownerToCheck === 'me')

  return result;
}

export function isAllowedRole(roleToCheck, userContext) {
  let result = false;

  if (debugCheck) {
    console.log('checking role =>', roleToCheck);
    console.log('checking against context info:');
    console.log(userContext);
  }

  if (!userContext) return false; // reject if no auth context is found

  // Ensure the userContext has the specified role...
  result = objectUtils.includes(userContext.roles, roleToCheck);
  if (debugCheck) console.log(`Does role ${roleToCheck} exist in set [${userContext.roles}] ? ${result}`);

  return result;
}

// export function isAuthorizedApp(appsToCheck, requestHeaders) {
//   let result = false;
//   const authHeaderForAppKey = authorizedAppConfig.headerNameForAppKey.toLowerCase();
//   const authHeaderForToken = authorizedAppConfig.headerNameForToken.toLowerCase();
//   const authAppRegistry = authorizedAppConfig.apps;
//
//   if (debugCheck) {
//     console.log('authorization is restricted to apps =>', appsToCheck);
//     console.log('checking header info:');
//     console.log(requestHeaders);
//   }
//
//   if (appsToCheck && Array.isArray(appsToCheck) && requestHeaders) {
//     const appKey = requestHeaders[authHeaderForAppKey];
//     const appToken = requestHeaders[authHeaderForToken];
//
//     if (debugCheck) console.log('The requesting app has identified itself with key =>', appKey);
//
//     // Ensure app has been authorized...
//     if (!objectUtils.includes(appsToCheck, appKey)) {
//       if (debugCheck) console.log('The requesting app has not been authorized to perform this action');
//       return false;
//     }
//
//     // Ensure credentials are valid...
//     const registeredToken = (authAppRegistry[appKey]) ? authAppRegistry[appKey].secret : null;
//     result = (registeredToken && registeredToken === appToken);
//     if (debugCheck) console.log(`Does the provided token: ${appToken} match the registry: ${registeredToken} ? ${result}`);
//   } // end-if (appsToCheck && Array.isArray(appsToCheck) && requestHeaders)
//
//   return result;
// }

export function isDeniedByAny(denyWhenAnyToCheck, userContext) {
  let result = false;

  if (debugCheck) {
    console.log('checking deny scenarios (any) =>', denyWhenAnyToCheck);
    console.log('checking against context info:');
    console.log(userContext);
  }

  // Check the userContext for matching deny scenarios...
  if (Array.isArray(denyWhenAnyToCheck) && denyWhenAnyToCheck.length > 0) {
    for (let i = 0; i < denyWhenAnyToCheck.length; i++) {
      const denyOn = denyWhenAnyToCheck[i];
      const prop = Object.keys(denyOn)[0];
      const value = denyOn[prop];
      result = (objectUtils.has(userContext, prop) && userContext[prop] === value);
      if (debugCheck) console.log(`Does ${prop}: ${value} exist in user context ? ${result}`);
      if (result) break;
    }
  }

  return result;
}
