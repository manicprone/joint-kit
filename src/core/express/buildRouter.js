import objectUtils from '../../utils/object-utils';

const debug = false;
const debugRequest = false;
const supportedMethods = ['get', 'post', 'put', 'patch', 'delete'];

export default function buildRouter(joint, routeDefs = [], log = true) {
  const router = joint.server.Router();

  // Iterate through route definitions...
  routeDefs.forEach((routeDef) => {
    if (debug) console.log('[JOINT] [buildRouter] route def =>', routeDef);
    const uri = routeDef.uri;

    if (uri) {
      // Iterate through supported http methods and add handling to router...
      Object.keys(routeDef).forEach((httpMethod) => {
        if (objectUtils.includes(supportedMethods, httpMethod)) {
          addRoute(joint, router, uri, httpMethod, routeDef[httpMethod], log);
        }
      });
    } // end-if (uri)
  });

  return router;
} // END - buildRouter

function addRoute(joint, router, uri, httpMethod, methodDef, log) {
  if (log) console.log(`${httpMethod.toUpperCase()} ${uri} => ${methodDef.method}`);
  if (debug) console.log('[JOINT] [addRoute] methodDef =>', methodDef);

  switch (httpMethod) {
    case 'get': router.get(uri, generateRouteLogic(joint, methodDef)); break;
    case 'post': router.post(uri, generateRouteLogic(joint, methodDef)); break;
    case 'put': router.put(uri, generateRouteLogic(joint, methodDef)); break;
    case 'patch': router.patch(uri, generateRouteLogic(joint, methodDef)); break;
    case 'delete': router.delete(uri, generateRouteLogic(joint, methodDef)); break;
  } // end-switch
}

/* eslint-disable func-names */
function generateRouteLogic(joint, methodDef) {
  const methodParts = (methodDef.method) ? methodDef.method.split('.') : null;

  if (methodParts.length === 2) {
    const resource = methodParts[0];
    const methodName = methodParts[1];

    const parseBody = objectUtils.get(methodDef, 'body', false);
    const parseQuery = objectUtils.get(methodDef, 'query', true);
    const successStatus = objectUtils.get(methodDef, 'successStatus', 200);
    const jointMethod = objectUtils.get(joint, `method.${resource}.${methodName}`, null);
    const jointMethodSpec = objectUtils.get(joint, `specByMethod.${resource}.${methodName}`, {});
    const inputFields = jointMethodSpec.fields;

    if (debug) console.log('[JOINT] [generateRouteLogic] jointMethodSpec =>', jointMethodSpec);

    if (!jointMethod) return function (req, res) { res.end(); };

    return function (req, res) {
      // Parse input values from request...
      const inputValues = {};
      if (parseBody) Object.assign(inputValues, req.body);
      if (parseQuery) Object.assign(inputValues, req.query);
      Object.assign(inputValues, req.params);

      if (debugRequest) console.log('[JOINT-ROUTER] inputValues =>', inputValues);

      // Build input object for Joint method...
      const input = {};

      // Extract supported input fields...
      if (inputFields && inputFields.length > 0) {
        input.fields = {};
        inputFields.forEach((fieldInfo) => {
          const fieldName = fieldInfo.name;
          if (inputValues[fieldName]) input.fields[fieldName] = inputValues[fieldName];
        });
      }

      // Support "with" field...
      if (inputValues.with) input.relations = inputValues.with.split(',');

      // Support "load" field...
      if (inputValues.load) input.loadDirect = inputValues.load.split(',');

      // Support "skip" and "limit" fields...
      if (objectUtils.has(inputValues, 'skip') || objectUtils.has(inputValues, 'limit')) {
        input.paginate = {};
        if (objectUtils.has(inputValues, 'limit')) input.paginate.skip = inputValues.skip;
        if (objectUtils.has(inputValues, 'limit')) input.paginate.limit = inputValues.limit;
      }

      if (debugRequest) console.log('[JOINT-ROUTER] input =>', input);

      jointMethod(input)
        .then(data => handleDataResponse(data, res, successStatus))
        .catch(error => handleErrorResponse(error, res));
    };
  } // end-if (methodParts.length === 2)

  return function (req, res) {
    res.end();
  };
}
/* eslint-enable func-names */

function handleDataResponse(data, res, status = 200) {
  res.status(status).json(data);
}

function handleErrorResponse(error, res) {
  const status = error.status || 500;
  res.status(status).json(error);
}
