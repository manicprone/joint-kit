import objectUtils from '../lib/utils/object-utils';

const namespace = 'ENGINE';
const log_registration = true;
const debug_registerModels = false;
const debug_registerMethods = false;

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerModels(dataPersistenceService, modelConfig) {
  const enabledModels = modelConfig.modelsEnabled;
  const modelDefs = modelConfig.models;
  const registry = {};

  if (log_registration) {
    console.log(`[${namespace}] ----------------------------------------------------`);
    console.log(`[${namespace}] Registering models`);
    console.log(`[${namespace}] ----------------------------------------------------`);
  }

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log_registration) console.log(`[${namespace}] ${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log(`[${namespace}] [engine-utils:registerModels] model def =>`, modelDef);

      const modelObject = registerBookshelfModel(dataPersistenceService, modelDef, modelName);
      registry[modelName] = modelObject;
    });
  } else if (log_registration) {
    console.log(`[${namespace}] no models configured`);
  }

  if (log_registration) console.log(`[${namespace}] ----------------------------------------------------`);

  return registry;
}

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
}

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerMethods(methodConfig) {
  const resources = methodConfig.resources;
  const registry = {};

  if (resources && Array.isArray(resources) && resources.length > 0) {
    resources.forEach((resourceConfig) => {
      const modelNameForResource = resourceConfig.modelName;
      const methods = resourceConfig.methods;

      // Register resource...
      registry[modelNameForResource] = {};

      if (log_registration) {
        console.log(`[${namespace}] Registering methods for resource:`, modelNameForResource);
        console.log(`[${namespace}] ----------------------------------------------------`);
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
          registry[modelNameForResource][methodName] = {
            action: jointAction,
            spec: methodSpec,
          };

          if (log_registration) console.log(`[${namespace}] ${modelNameForResource}.${methodName}`);
        });
      } else if (log_registration) {
        console.log(`[${namespace}] no methods configured`);
      }

      if (log_registration) {
        console.log(`[${namespace}] ----------------------------------------------------`);
      }
    }); // end-resources.forEach
  }

  if (log_registration) console.log('');

  return registry;
}
