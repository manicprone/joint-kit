import objectUtils from '../../utils/object-utils';
import * as CoreUtils from '../core-utils';

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
      /* eslint-disable func-names */
      if (associations) {
        Object.keys(associations).forEach((assocName) => {
          const assocDef = associations[assocName];
          const assocType = assocDef.type;
          const assocPath = assocDef.path;
          if (debug) console.log(`[JOINT] [registerModel] defining association: ${assocName} =>`, assocDef);

          // Parse path string...
          const info = CoreUtils.parseAssociationPath(assocPath);
          if (info) {
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
              const assocMethod = 'hasMany';
              // Handle through path...
              if (info.through) {
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.through.toField, info.targetField)
                    .through(info.through.modelName, info.sourceField, info.through.fromField, info.through.toField);
                };
              }
            } // end-if (assocType === 'toMany')
          } // end-if (info)
        });
      } // end-if (associations)
      /* eslint-enable func-names */

      // Define model...
      const modelObject = bookshelf.Model.extend({
        tableName,
        idAttribute,
        hasTimestamps,
        ...assocHooks,
      });

      // Add to bookshelf registry...
      registryEntry = bookshelf.model(modelName, modelObject);
    }
  } // end-if (bookshelf.Model)

  return registryEntry;
} // END - registerModel

/*
if (assocName === 'profile') {
  const info = {
    sourceField: 'profile_id',
    targetModelName: 'Profile',
    targetField: 'id',
  };

  assocHooks[assocName] = function () {
    return this[assocMethod](info.targetModelName, info.sourceField, info.targetField);
  };
}

if (assocName === 'user') {
  const info = {
    sourceField: 'profile_id',
    through: { modelName: 'Profile', fromField: 'id', toField: 'user_id' },
    targetModelName: 'User',
    targetField: 'id',
  };

  assocHooks[assocName] = function () {
    return this[assocMethod](info.targetModelName, info.through.toField, info.targetField)
      .through(info.through.modelName, info.sourceField, null, info.through.fromField);
  };
}

if (assocName === 'codingLanguageTags') {
  const info = {
    sourceField: 'id',
    through: { modelName: 'ProjectCodingLanguageTag', fromField: 'project_id', toField: 'coding_language_tag_id' },
    targetModelName: 'CodingLanguageTag',
    targetField: 'id',
  };

  assocHooks[assocName] = function () {
    return this[assocMethod](info.targetModelName, info.through.toField, info.targetField)
      .through(info.through.modelName, info.sourceField, info.through.fromField, info.through.toField);
  };
}
*/
