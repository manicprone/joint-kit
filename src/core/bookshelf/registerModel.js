import objectUtils from '../../utils/object-utils';
// import MODEL from '../constants/model-config-constants';
import * as CoreUtils from '../core-utils';

const namespace = 'JOINT';

export default function registerModel(bookshelf = {}, modelDef = {}, modelName, debug = false) {
  let registryEntry = null;

  // If already registered on the service, just return it...
  if (bookshelf.model(modelName)) return bookshelf.model(modelName);

  // Otherwise, register the model...
  if (bookshelf.Model) {
    const tableName = objectUtils.get(modelDef, 'tableName', null);
    if (tableName) {
      const idAttribute = objectUtils.get(modelDef, 'idAttribute', 'id');
      const timestamps = objectUtils.get(modelDef, 'timestamps', {});
      const hasTimestamps = [timestamps.created, timestamps.updated];
      const associations = objectUtils.get(modelDef, 'associations', null);

      // Define associations...
      const assocHooks = {};
      if (associations) {
        Object.keys(associations).forEach((assocName) => {
          const assocDef = associations[assocName];
          const assocType = assocDef.type;
          const assocPath = assocDef.path;
          if (debug) {
            console.log(`[${namespace}] Bookshelf:registerModel defining association => (${assocName})`);
            console.log(assocDef);
            console.log('');
          }

          // Parse path string...
          const info = CoreUtils.parseAssociationPath(assocPath);
          if (debug) {
            console.log(`[${namespace}] Bookshelf:registerModel parsed association path:`);
            console.log(info);
            console.log('');
          }

          if (info) {
            // Add lookup of association modelName to bookshelf...
            if (!bookshelf.modelNameForAssoc) bookshelf.modelNameForAssoc = {};
            if (!bookshelf.modelNameForAssoc[modelName]) bookshelf.modelNameForAssoc[modelName] = {};
            bookshelf.modelNameForAssoc[modelName][assocName] = info.targetModelName;

            // -----------------------------
            // Handle "toOne" association...
            // -----------------------------
            if (assocType === 'toOne') {
              const assocMethod = 'belongsTo';
              // Handle through path...
              if (info.through) {
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.through.toField, info.targetField)
                    .through(info.through.modelName, info.sourceField, null, info.through.fromField);
                };

              // Handle direct path...
              } else {
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.sourceField, info.targetField);
                };
              }
            } // end-if (assocType === 'toOne')

            // ------------------------------
            // Handle "toMany" association...
            // ------------------------------
            if (assocType === 'toMany') {
              // Handle through path...
              if (info.through) {
                const assocMethod = 'belongsToMany';

                // TODO: Throw error if through Model is not defined !!!
                const throughModel = bookshelf.model(info.through.modelName);
                const throughTableName = throughModel.prototype.tableName;
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, throughTableName, info.through.fromField, info.through.toField, info.sourceField, info.targetField);
                };

                // assocHooks[assocName] = function () {
                //   return this[assocMethod](info.targetModelName)
                //     .through(info.through.modelName, info.through.fromField, info.through.toField);
                // };

              // Handle direct path...
              } else {
                const assocMethod = 'hasMany';
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.targetField);
                };
              }
            } // end-if (assocType === 'toMany')
          } // end-if (info)
        }); // END - associations.forEach
      } // end-if (associations)

      // Define model...
      const modelObject = bookshelf.Model.extend({
        tableName,
        idAttribute,
        hasTimestamps,
        ...assocHooks,
      });

      // Add to bookshelf registry...
      registryEntry = bookshelf.model(modelName, modelObject);
      if (!bookshelf.modelByTable) bookshelf.modelByTable = {};
      if (!bookshelf.modelNameByTable) bookshelf.modelNameByTable = {};
      bookshelf.modelByTable[tableName] = registryEntry;
      bookshelf.modelNameByTable[tableName] = modelName;
    } // end-if (tableName)
  } // end-if (bookshelf.Model)

  return registryEntry;
} // END - registerModel
