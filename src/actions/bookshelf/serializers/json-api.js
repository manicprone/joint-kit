import objectUtils from '../../../utils/object-utils'

const debug = false

export default function serialize(type, data, joint) {
  let json = {}

  if (data) {
    if (debug === true) console.log(`[Serializer] ${type} data =>`, data)

    // Create relation hash, to manage relationship data...
    const relationHash = {}

    // Build data package...
    const packageType = (data.attributes) ? 'item' : 'collection'
    if (packageType === 'item') {
      json = buildItemPackage(type, data, relationHash, joint)
    } else {
      json = buildCollectionPackage(type, data, relationHash, joint)
    }

    // Build included package (for relationship data)...
    if (!objectUtils.isEmpty(relationHash)) {
      json.included = []

      if (debug === true) console.log('[Serializer] relationHash =>', relationHash)

      // Loop through hash, and populate the included array...
      Object.keys(relationHash).forEach((dataType) => {
        Object.keys(relationHash[dataType]).forEach((itemID) => {
          const includedItemData = relationHash[dataType][itemID]
          json.included.push(includedItemData)
        })
      })
    }
  } // end-if (data)

  return json
}

function buildItemPackage(type, data, relationHash, joint) {
  const itemPackage = {}

  itemPackage.data = buildItemData(type, data, relationHash, joint)

  return itemPackage
}

function buildCollectionPackage(type, data, relationHash, joint) {
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

function buildItemData(type, itemData, relationHash, joint) {
  const item = {}

  // Set type...
  item.type = type

  // Set ID and base attributes...
  const attrs = objectUtils.get(itemData, 'attributes', {})
  item.id = (itemData.id) ? itemData.id : null
  item.attributes = attrs
  if (attrs.id) {
    delete item.attributes.id
  }

  // Handle relations...
  const relations = itemData.relations
  if (!objectUtils.isEmpty(relations)) {
    item.relationships = {}

    Object.keys(relations).forEach((relationName) => {
      const relationData = relations[relationName]
      const relationType = relationData.relatedData.type

      if (debug === true) console.log(`[Serializer] handling relation => ${relationName} (${relationType})`)

      // Initiate relationships object...
      item.relationships[relationName] = {}

      if (relationType === 'belongsTo' || relationType === 'hasOne') {
        // --------------------------
        // Handle 1-1 relationship...
        // --------------------------
        const relationDataType = resolveDataTypeFromRelationData(relationData, joint)
        const relationItemData = buildItemData(relationDataType,
                                               relationData,
                                               relationHash,
                                               joint)

        // Set type and ID on base item...
        item.relationships[relationName].data = {}
        item.relationships[relationName].data.type = relationItemData.type
        item.relationships[relationName].data.id = relationItemData.id

        // Add relation item data to hash...
        processRelationItemData(relationItemData, relationHash)
      } else if (relationType === 'hasMany' || relationType === 'belongsToMany') {
        // -----------------------------
        // Handle 1-many relationship...
        // -----------------------------
        item.relationships[relationName].data = []
        if (relationData.models && Array.isArray(relationData.models) && relationData.models.length > 0) {
          relationData.models.forEach((relationItem) => {
            const relationDataType = resolveDataTypeFromRelationData(relationData, joint)
            const relationItemData = buildItemData(relationDataType,
                                                   relationItem,
                                                   relationHash,
                                                   joint)

            // Set type and ID on base item array...
            item.relationships[relationName].data.push({
              type: relationItemData.type,
              id: relationItemData.id,
            })

            // Add relation item data to hash...
            processRelationItemData(relationItemData, relationHash)
          })
        }
      } else {
        throw new Error(`Unrecognized relationship ${relationType}.`)
      } // end-if-else-if (relationType === 'hasMany' && relationType === 'belongsToMany')
    })
  } // end-if (!objectUtils.isEmpty(relations))

  return item
}

function buildPaginationInfo(paginationData) {
  const info = {
    total_items: paginationData.rowCount,
    skip: paginationData.offset,
    limit: paginationData.limit,
  }

  return info
}

function buildFilterInfo(type, filterData, joint) {
  const info = []

  filterData.forEach((filter) => {
    info.push(buildItemData(type, filter, joint))
  })

  return info
}

function processRelationItemData(relationItemData, relationHash) {
  if (!relationHash[relationItemData.type]) {
    relationHash[relationItemData.type] = {} // eslint-disable-line no-param-reassign
  }
  const hashEntry = relationHash[relationItemData.type]
  if (!hashEntry[relationItemData.id]) hashEntry[relationItemData.id] = relationItemData
}

function resolveDataTypeFromRelationData(relationData, joint) {
  let type = 'unknown'

  const tableName = relationData.relatedData.targetTableName
  if (joint.modelNameByTable && joint.modelNameByTable[tableName]) {
    type = joint.modelNameByTable[tableName]
  }

  return type
}
