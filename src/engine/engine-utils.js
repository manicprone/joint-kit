import objectUtils from '../lib/utils/object-utils';
import * as JointActions from '../lib/actions/bookshelf'; // TODO: Load from factory (based on service) !!!

const namespace = 'ENGINE';
const debug_registerModels = false;
const debug_registerMethods = false;

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerModels(dataPersistenceService, modelConfig, log = true) {
  const enabledModels = modelConfig.modelsEnabled;
  const modelDefs = modelConfig.models;
  const registry = {};

  if (log) {
    console.log('---------------------------');
    console.log('Registering resource models');
    console.log('---------------------------');
  }

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log) console.log(`${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log(`[${namespace}] [engine-utils:registerModels] model def =>`, modelDef);

      const modelObject = registerBookshelfModel(dataPersistenceService, modelDef, modelName);
      registry[modelName] = modelObject;
    });
  } else if (log) {
    console.log('no models configured');
  }

  if (log) console.log('');

  return registry;
} // END - registerModels

function registerBookshelfModel(bookshelf = {}, modelDef = {}, modelName) {
  let registryEntry = null;

  if (bookshelf.Model) {
    const tableName = objectUtils.get(modelDef, 'tableName', null);
    if (tableName) {
      const registeredModelName = modelName || tableName;
      const idAttribute = objectUtils.get(modelDef, 'idAttribute', 'id');
      const timestamps = objectUtils.get(modelDef, 'timestamps', {});
      const hasTimestamps = [timestamps.created, timestamps.updated];

      // Define model...
      const modelObject = bookshelf.Model.extend({
        tableName,
        idAttribute,
        hasTimestamps,
      });

      // Add to bookshelf registry...
      registryEntry = bookshelf.model(registeredModelName, modelObject);
    }
  } // end-if (bookshelf.Model)

  return registryEntry;
} // END - registerBookshelfModel

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerMethods(methodConfig, log = true) {
  const resources = methodConfig.resources;
  const registry = {};

  if (resources && Array.isArray(resources) && resources.length > 0) {
    resources.forEach((resourceConfig) => {
      const modelNameForResource = resourceConfig.modelName;
      const methods = resourceConfig.methods;

      // Register resource...
      registry[modelNameForResource] = {};

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
          const methodLogic = generateMethod(jointAction, methodSpec);
          if (methodLogic) {
            registry[modelNameForResource][methodName] = methodLogic;
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

  return registry;
} // END - registerMethods

function generateMethod(action, spec) {
  if (!objectUtils.has(JointActions, action)) return null;

  return function (input) { return JointActions[action](spec, input); }; // eslint-disable-line func-names
} // END - generateMethod
