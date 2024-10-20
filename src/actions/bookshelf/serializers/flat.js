import objectUtils from '../../../utils/object-utils'

const debug = false

// -----------------------------------------------------------------------------
// Serializer for "flattened" output format.
//
// NOTE: The resource model type is set as "type".
// -----------------------------------------------------------------------------
export default function serialize (type, data, joint) {
  let json = {}

  if (data) {
    if (debug) console.log(`[Serializer] Serialize ${type} data to flattened format =>`, data)

    // Build data package
    const packageType = (data.attributes) ? 'item' : 'collection'
    if (packageType === 'item') {
      json = buildItemPackage(type, data, joint)
    } else {
      // json = buildCollectionPackage(type, data, joint)
    }
  }

  return json
}

// export default function serialize (type, data, joint) {
//   let json = {}
//
//   if (data) {
//     if (debug === true) console.log(`[Serializer] ${type} data =>`, data)
//
//     // Create relation hash, to manage relationship data...
//     const relationHash = {}
//
//     // Build data package...
//     const packageType = (data.attributes) ? 'item' : 'collection'
//     if (packageType === 'item') {
//       json = buildItemPackage(type, data, relationHash, joint)
//     } else {
//       json = buildCollectionPackage(type, data, relationHash, joint)
//     }
//
//     // Build included package (for relationship data)...
//     if (!objectUtils.isEmpty(relationHash)) {
//       json.included = []
//
//       if (debug === true) console.log('[Serializer] relationHash =>', relationHash)
//
//       // Loop through hash, and populate the included array...
//       Object.keys(relationHash).forEach((dataType) => {
//         Object.keys(relationHash[dataType]).forEach((itemID) => {
//           const includedItemData = relationHash[dataType][itemID]
//           json.included.push(includedItemData)
//         })
//       })
//     }
//   } // end-if (data)
//
//   return json
// }

function buildItemPackage (type, data, joint) {
  const itemPackage = {}

  itemPackage.data = buildItemData(type, data, joint)

  return itemPackage
}

/* TO BE COMPLETED
function buildCollectionPackage (type, data, relationHash, joint) {
  const collectionPackage = {}
  collectionPackage.data = []
  collectionPackage.meta = {}

  // Build each item...
  if (data.models && Array.isArray(data.models) && data.models.length > 0) {
    data.models.forEach((itemData) => {
      collectionPackage.data.push(buildItemData(type, itemData, relationHash, joint))
    })
  }

  // Build pagination info...
  if (data.pagination) {
    const paginationInfo = buildPaginationInfo(data.pagination)
    collectionPackage.meta = Object.assign(collectionPackage.meta, paginationInfo)
  } else {
    collectionPackage.meta = Object.assign(collectionPackage.meta, { total_items: data.length })
  }

  // Build filter info...
  if (data.filters) {
    const filterInfo = buildFilterInfo(data.filters.type, data.filters.data)
    collectionPackage.meta.filters = filterInfo
  }

  return collectionPackage
}
*/

function buildItemData (type, itemData, joint) {
  // Extract attributes and relations
  const { attributes, relations } = itemData

  // Apply base attributes
  const item = {
    type,
    ...attributes
  }

  // Handle relations
  if (!objectUtils.isEmpty(relations)) {
    // console.log('[DEVING] relations =>', relations)

    Object.keys(relations).forEach((relationName) => {
      const relationData = relations[relationName]
      const relationType = relationData.relatedData.type

      // console.log(`[DEVING] Serializing "${relationName}" association =>`, relationData)
      // console.log('')
      // console.log('')

      if (debug) console.log(`[Serializer] handling relation: ${relationName} (${relationType})`)

      if (relationType === 'belongsTo' || relationType === 'hasOne') {
        // -----------------------
        // Handle 1-1 relationship
        // -----------------------
        const relationDataType = resolveDataTypeFromRelationData(relationData, joint)
        const relationItemData = buildItemData(relationDataType, relationData, joint)

        // Add to item
        item[relationName] = relationItemData
      } else if (relationType === 'hasMany' || relationType === 'belongsToMany') {
        // --------------------------
        // Handle 1-many relationship
        // --------------------------
        if (relationData.models && Array.isArray(relationData.models) && relationData.models.length > 0) {
          // Add to item
          item[relationName] = relationData.models.map(relationItem => {
            const relationDataType = resolveDataTypeFromRelationData(relationData, joint)
            return buildItemData(relationDataType, relationItem, joint)
          })
        }
      } else {
        throw new Error(`[Serializer] Unrecognized relationship ${relationType}.`)
      } // end-if-else-if (relationType === 'hasMany' && relationType === 'belongsToMany')
    })
  }

  return item
}

/* TO BE COMPLETED
function buildPaginationInfo (paginationData) {
  const info = {
    total_items: paginationData.rowCount,
    skip: paginationData.offset,
    limit: paginationData.limit
  }

  return info
}

function buildFilterInfo (type, filterData, joint) {
  const info = []

  filterData.forEach((filter) => {
    info.push(buildItemData(type, filter, joint))
  })

  return info
}
*/

/* TO BE COMPLETED
function processRelationItemData (relationItemData, relationHash) {
  if (!relationHash[relationItemData.type]) {
    relationHash[relationItemData.type] = {} // eslint-disable-line no-param-reassign
  }
  const hashEntry = relationHash[relationItemData.type]
  if (!hashEntry[relationItemData.id]) hashEntry[relationItemData.id] = relationItemData
}
*/

function resolveDataTypeFromRelationData (relationData, joint) {
  let type = 'unknown'

  const tableName = relationData.relatedData.targetTableName
  if (joint.modelNameByTable && joint.modelNameByTable[tableName]) {
    type = joint.modelNameByTable[tableName]
  }

  return type
}
