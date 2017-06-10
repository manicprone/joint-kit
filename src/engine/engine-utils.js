import objectUtils from '../utils/object-utils';

const log_cycle = true;
const debug_registerModels = false;
const debug_registerActions = false;

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerModels(dataPersistenceService, modelConfig) {
  const enabledModels = modelConfig.modelsEnabled;
  const modelDefs = modelConfig.models;
  const registry = {};

  if (log_cycle) {
    console.log('[JOINT] ----------------------------------------------------');
    console.log('[JOINT] Registering models');
    console.log('[JOINT] ----------------------------------------------------');
  }

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log_cycle) console.log(`[JOINT] ${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log('[JOINT] [engine-utils:registerModels] model def =>', modelDef);

      const modelObject = registerBookshelfModel(dataPersistenceService, modelDef, modelName);
      registry[modelName] = modelObject;
    });
  } else if (log_cycle) {
    console.log('[JOINT] no models configured');
  }

  if (log_cycle) console.log('[JOINT] ----------------------------------------------------');

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
export function registerActions(actionConfig) {
  const enabledModules = actionConfig.modulesEnabled;
  const modules = actionConfig.modules;
  const registry = {};

  // Loop through all modules, and register all valid resource.methods...
  if (enabledModules && Array.isArray(enabledModules) && enabledModules.length > 0) {
    enabledModules.forEach((moduleKey) => {
      if (log_cycle) {
        console.log('[JOINT] Registering actions for module:', moduleKey);
        console.log('[JOINT] ----------------------------------------------------');
      }

      const moduleConfig = modules[moduleKey];
      if (moduleConfig) {
        // Register module...
        registry[moduleKey] = {};

        const resources = moduleConfig.resources;
        if (resources && Array.isArray(resources) && resources.length > 0) {
          resources.forEach((methodConfig) => {
            const modelNameForResource = methodConfig.modelName;
            const methods = methodConfig.methods;
            if (debug_registerActions) console.log('[JOINT] [engine-utils:registerActions] method config =>', methodConfig);

            if (methods && Array.isArray(methods) && methods.length > 0) {
              // Register resource/model...
              registry[moduleKey][modelNameForResource] = {};

              methods.forEach((methodDef) => {
                const methodName = methodDef.name;
                const jointAction = methodDef.action;
                const methodSpec = methodDef.spec;

                // Add method/action to registry...
                registry[moduleKey][modelNameForResource][methodName] = {
                  action: jointAction,
                  spec: methodSpec,
                };

                if (log_cycle) console.log(`[JOINT] ${modelNameForResource}.${methodName}`);
              });
            } else if (log_cycle) {
              console.log('[JOINT] no actions configured');
            }
          });
        }
      } else if (log_cycle) {
        console.warning(`[JOINT-WARN] A module config was not found for ${moduleKey}. The module will not be loaded.`);
      }

      if (log_cycle) {
        console.log('[JOINT] ----------------------------------------------------');
      }
    }); // end-enabledModules.forEach
  }

  if (log_cycle) console.log('');

  return registry;
}
