import objectUtils from '../utils/object-utils';
import JointError from '../errors/JointError';

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

  if (log) {
    console.log('---------------------------');
    console.log('Registering resource models');
    console.log('---------------------------');
  }

  // Load the registerModel function for the service implementation...
  let registerModel = null;
  try {
    registerModel = require(`./${serviceKey}/registerModel`).default; // eslint-disable-line global-require, import/no-dynamic-require
  } catch (err) {
    const message = `[JOINT] ERROR - Could not find registerModel logic for service: ${serviceKey}`;
    throw new JointError({ message });
  }

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log) console.log(`${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log(`[${namespace}] [generate:registerModels] model def =>`, modelDef);

      const modelObject = registerModel(service, modelDef, modelName, debug_registerModels);
      joint.model[modelName] = modelObject;
    });
  } else if (log) {
    console.log('no models configured');
  }

  if (log) console.log('');
} // END - registerModels

// -----------------------------------------------------------------------------
// Register methods from method-config...
// -----------------------------------------------------------------------------
export function registerMethods(joint, log = true) {
  const methodConfig = joint.methodConfig;
  const resources = methodConfig.resources;

  // Register methods within "joint.method" object...
  joint.method = {};

  if (resources && Array.isArray(resources) && resources.length > 0) {
    resources.forEach((resourceConfig) => {
      const modelNameForResource = resourceConfig.modelName;
      const methods = resourceConfig.methods;

      // TODO: Do not register methods, if the modelName does not exist !!!

      // Register resource...
      joint.method[modelNameForResource] = {};

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

          if (debug_registerMethods) {
            console.log(`[${namespace}] ============================================ [DEBUG]`);
            console.log(methodDef);
            console.log('=============================================================');
          }

          // Add method to registry...
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

  return function (input) { return joint[action](spec, input); }; // eslint-disable-line func-names
} // END - generateMethod
