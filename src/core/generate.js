import objectUtils from '../utils/object-utils';
import JointError from '../errors/JointError';
import ACTION from '../actions/action-constants';
import registerModelBookshelf from './bookshelf/registerModel';
import buildRouterExpress from './express/buildRouter';

const namespace = 'JOINT';
const debug_registerModels = false;
const debug_registerMethods = false;

// -----------------------------------------------------------------------------
// Register models from model-config...
// -----------------------------------------------------------------------------
export function registerModels(joint, log = true) {
  const modelConfig = joint.modelConfig;
  const serviceKey = joint.serviceKey;
  const service = joint.service;
  const enabledModels = modelConfig.modelsEnabled;
  const modelDefs = modelConfig.models;

  // Register models to base joint object...
  joint.model = {};
  joint.modelByTable = {};
  joint.modelNameByTable = {};

  if (log) {
    console.log('----------------------------------------------------');
    console.log('Registering resource models');
    console.log('----------------------------------------------------');
  }

  // Load the registerModel function for the service implementation...
  let registerModel = null;
  switch (serviceKey) {
    case 'bookshelf': {
      registerModel = registerModelBookshelf;
    }
  }
  if (!registerModel) {
    const message = `[${namespace}] ERROR - Could not find registerModel logic for service: ${serviceKey}`;
    throw new JointError({ message });
  }

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log) console.log(`${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log(`[${namespace}] [generate:registerModels] model def =>`, modelDef);

      const modelObject = registerModel(service, modelDef, modelName, debug_registerModels);
      joint.model[modelName] = modelObject;
      joint.modelByTable[modelDef.tableName] = modelObject;
      joint.modelNameByTable[modelDef.tableName] = modelName;
    });
  } else if (log) {
    console.log('no models configured');
  }

  if (log) console.log('');
} // END - registerModels

// -----------------------------------------------------------------------------
// Register methods from method-config...
//
// TODO: Support auto-injected / overrides for input options (on method config) !!!
//       e.g. Enforce => input.loadDirect: ['roles:key'] on all requests
//       e.g. Support => the markLogin concept (where "now" is injected into input of updateItem action)
// -----------------------------------------------------------------------------
export function registerMethods(joint, log = true) {
  const methodConfig = joint.methodConfig;
  const resources = methodConfig.resources;

  // Register methods to base joint object...
  joint.method = {};
  joint.specByMethod = {};

  if (resources && Array.isArray(resources) && resources.length > 0) {
    resources.forEach((resourceConfig) => {
      const modelNameForResource = resourceConfig.modelName;
      const methods = resourceConfig.methods;

      // TODO: Do not register methods, if the modelName does not exist !!!

      // Register resource...
      joint.method[modelNameForResource] = {};
      joint.specByMethod[modelNameForResource] = {};

      if (log) {
        console.log('----------------------------------------------------');
        console.log('Registering methods for resource:', modelNameForResource);
        console.log('----------------------------------------------------');
      }

      // Load all methods...
      if (methods && Array.isArray(methods) && methods.length > 0) {
        methods.forEach((methodDef) => {
          const methodName = methodDef.name;
          const jointAction = methodDef.action;
          const methodSpec = methodDef.spec;
          methodSpec[ACTION.SPEC_MODEL_NAME] = modelNameForResource;

          if (debug_registerMethods) {
            console.log(`[${namespace}] ============================================ [DEBUG]`);
            console.log(methodDef);
            console.log('=============================================================');
          }

          // Add method spec to registry (for lookup convenience)...
          joint.specByMethod[modelNameForResource][methodName] = methodSpec;

          // Generate method logic and add to registry...
          const methodLogic = generateMethod(joint, jointAction, methodSpec);
          if (methodLogic) {
            joint.method[modelNameForResource][methodName] = methodLogic;
            if (log) console.log(`${modelNameForResource}.${methodName}`);
          } else if (log) {
            console.log(`x  ${modelNameForResource}.${methodName} (unknown action: ${jointAction})`);
          }
        });
      } else if (log) {
        console.log('no methods configured');
      }
    }); // end-resources.forEach
  }

  if (log) console.log('');
} // END - registerMethods

function generateMethod(joint, action, spec) {
  if (!objectUtils.has(joint, action)) return null;

  return function (input) { return joint[action](spec, input); };
} // END - generateMethod

// -----------------------------------------------------------------------------
// Build router from route-config...
// -----------------------------------------------------------------------------
export function buildRouter(joint, log = true) {
  const routeConfig = joint.routeConfig;
  const serverKey = joint.serverKey;
  const server = joint.server;
  const routeDefs = routeConfig.routes;

  if (log) {
    console.log('----------------------------------------------------');
    console.log(`Building API router (${serverKey})`);
    console.log('----------------------------------------------------');
  }

  // Exit if a server instance is not loaded or is not recognized/supported...
  if (!server) {
    const message = `[${namespace}] ERROR - A server must be configured to generate a Joint router.`;
    throw new JointError({ message });
  }
  if (!serverKey) {
    const message = `[${namespace}] ERROR - Could not generate a router. The provided server is either not recognized or not supported by Joint.`;
    throw new JointError({ message });
  }

  // Load the buildRouter function for the server implementation...
  let performBuildRouter = null;
  switch (serverKey) {
    case 'express': {
      performBuildRouter = buildRouterExpress;
    }
  }

  // Build the router, and add to the joint instance...
  if (routeDefs && Array.isArray(routeDefs) && routeDefs.length > 0) {
    joint.router = performBuildRouter(joint, routeDefs, log);
  } else if (log) {
    console.log('no routes configured');
  }

  if (log) console.log('');
} // END - registerModels
