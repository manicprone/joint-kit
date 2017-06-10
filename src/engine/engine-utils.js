import objectUtils from '../utils/object-utils';

const log_cycle = true;
const debug_registerModels = false;

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export function registerModels(dataPersistenceService, modelConfig) {
  const enabledModels = modelConfig.modelsEnabled;
  const modelDefs = modelConfig.models;
  const registry = {};

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log_cycle) console.log('[JOINT] registering model =>', modelName);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log('[JOINT] [engine-utils:registerModels] model def =>', modelDef);

      const modelObject = registerBookshelfModel(dataPersistenceService, modelDef, modelName);
      registry[modelName] = modelObject;
    });
  }

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
  // const modules = actionConfig.modules;
  const registry = {};

  // Loop through all modules, and register all valid resource.actions...
  if (enabledModules && Array.isArray(enabledModules) && enabledModules.length > 0) {
    enabledModules.forEach((moduleKey) => {
      if (log_cycle) console.log('[JOINT] Registering actions for module =>', moduleKey);

      // const moduleConfig = modules[moduleKey];
      // TODO: Loop through resources array, registering all resource.actions !!!
    });
  }

  return registry;
}
