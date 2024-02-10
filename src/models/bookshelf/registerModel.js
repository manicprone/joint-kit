import objectUtils from '../../utils/object-utils'
// import MODEL from '../../core/constants/model-config-constants';
import * as CoreUtils from '../../core/core-utils'

const namespace = 'JOINT'

export default function registerModel(joint, modelDef = {}, modelName, debug = false) {
  const bookshelf = joint.service
  let registryEntry = null
  let assocMap = {}

  // If already registered on the service, just return it...
  if (bookshelf.model(modelName)) {
    registryEntry = bookshelf.model(modelName)
    if (bookshelf.modelNameOfAssoc) assocMap = bookshelf.modelNameOfAssoc[modelName]

  // Otherwise, register the model...
  } else if (bookshelf.Model) {
    const tableName = objectUtils.get(modelDef, 'tableName', null)
    if (tableName) {
      const idAttribute = objectUtils.get(modelDef, 'idAttribute', 'id')
      const timestamps = objectUtils.get(modelDef, 'timestamps', {})
      const hasTimestamps = [timestamps.created, timestamps.updated]
      const associations = objectUtils.get(modelDef, 'associations', null)

      // Define associations...
      const assocHooks = {}
      if (associations) {
        Object.keys(associations).forEach((assocName) => {
          const assocDef = associations[assocName]
          const assocType = assocDef.type
          const assocPath = assocDef.path
          if (debug) {
            console.log(`[${namespace}] Bookshelf:registerModel defining association => (${assocName})`)
            console.log(assocDef)
            console.log('')
          }

          // Parse path string...
          const info = CoreUtils.parseAssociationPath(assocPath)
          if (debug) {
            console.log(`[${namespace}] Bookshelf:registerModel parsed association path:`)
            console.log(info)
            console.log('')
          }

          if (info) {
            // Build mapping of association name to its underlying model
            assocMap[assocName] = info.targetModelName
            if (!bookshelf.modelNameOfAssoc) bookshelf.modelNameOfAssoc = {}
            bookshelf.modelNameOfAssoc[modelName] = assocMap

            // -----------------------------
            // Handle "toOne" association...
            // -----------------------------
            if (assocType === 'toOne') {
              const assocMethod = 'belongsTo'
              // Handle through path...
              if (info.through) {
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.through.toField, info.targetField)
                    .through(info.through.modelName, info.sourceField, null, info.through.fromField)
                }

              // Handle direct path...
              } else {
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.sourceField, info.targetField)
                }
              }
            } // end-if (assocType === 'toOne')

            // ------------------------------
            // Handle "toMany" association...
            // ------------------------------
            if (assocType === 'toMany') {
              // Handle through path...
              if (info.through) {
                const assocMethod = 'belongsToMany'

                // TODO: Throw error if through Model is not defined !!!
                const throughModel = bookshelf.model(info.through.modelName)
                const throughTableName = throughModel.prototype.tableName
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, throughTableName, info.through.fromField, info.through.toField, info.sourceField, info.targetField)
                }

                // assocHooks[assocName] = function () {
                //   return this[assocMethod](info.targetModelName)
                //     .through(info.through.modelName, info.through.fromField, info.through.toField);
                // };

              // Handle direct path...
              } else {
                const assocMethod = 'hasMany'
                assocHooks[assocName] = function () {
                  return this[assocMethod](info.targetModelName, info.targetField, info.sourceField)
                }
              }
            } // end-if (assocType === 'toMany')
          } // end-if (info)
        }) // END - associations.forEach
      } // end-if (associations)

      // Define model...
      const modelObject = bookshelf.Model.extend({
        tableName,
        idAttribute,
        hasTimestamps,
        ...assocHooks,
      })

      // Add to bookshelf registry...
      registryEntry = bookshelf.model(modelName, modelObject)
    } // end-if (tableName)
  } // end-if-else-if (bookshelf.Model)

  return { modelObject: registryEntry, assocMap }
} // END - registerModel
