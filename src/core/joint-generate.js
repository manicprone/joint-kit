import objectUtils from '../utils/object-utils';

const namespace = 'JOINT';
const debug_registerModels = false;
const debug_registerMethods = false;

// -----------------------------------------------------------------------------
// Register models from model-config...
// -----------------------------------------------------------------------------
export function registerModels(joint, log = true) {
  const modelConfig = joint.modelConfig;
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

  if (enabledModels && Array.isArray(enabledModels) && enabledModels.length > 0) {
    enabledModels.forEach((modelName) => {
      if (log) console.log(`${modelName}`);

      const modelDef = modelDefs[modelName];
      if (debug_registerModels) console.log(`[${namespace}] [generate:registerModels] model def =>`, modelDef);

      const modelObject = registerBookshelfModel(service, modelDef, modelName);
      joint.model[modelName] = modelObject;
    });
  } else if (log) {
    console.log('no models configured');
  }

  if (log) console.log('');
} // END - registerModels

function registerBookshelfModel(bookshelf = {}, modelDef = {}, modelName) {
  let registryEntry = null;

  // If already registered on the servcie, just return it...
  if (bookshelf.model(modelName)) return bookshelf.model(modelName);

  // Otherwise, register the model...
  if (bookshelf.Model) {
    const tableName = objectUtils.get(modelDef, 'tableName', null);
    if (tableName) {
      const idAttribute = objectUtils.get(modelDef, 'idAttribute', 'id');
      const timestamps = objectUtils.get(modelDef, 'timestamps', {});
      const hasTimestamps = [timestamps.created, timestamps.updated];
      const relations = objectUtils.get(modelDef, 'relations', null);

      // Define relations...
      const relationHooks = {};
      if (relations) {
        Object.keys(relations).forEach((relationName) => {
          if (debug_registerModels) console.log(`[${namespace}] [generate:registerModels] defining relation =>`, relationName);
          const relationDef = relations[relationName];
          const assocType = relationDef.assocType;
          const assocModel = relationDef.modelName;
          const fkToAssoc = relationDef.fk;

          relationHooks[relationName] = function () { return this[assocType](assocModel, fkToAssoc); }; // eslint-disable-line func-names
        });
      }

      // Define model...
      const modelObject = bookshelf.Model.extend({
        tableName,
        idAttribute,
        hasTimestamps,
        ...relationHooks,
      });

      // Add to bookshelf registry...
      registryEntry = bookshelf.model(modelName, modelObject);
    }
  } // end-if (bookshelf.Model)

  return registryEntry;
} // END - registerBookshelfModel

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
