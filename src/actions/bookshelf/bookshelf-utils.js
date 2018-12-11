import objectUtils from '../../utils/object-utils'
import stringUtils from '../../utils/string-utils'

const debug_loadDirect = false

// -----------------------------------------------------------------------------
// Accepts the "orderBy" API field value and returns
// the Bookshelf-compatible specification for an order-by clause.
// -----------------------------------------------------------------------------
// The returned specification is an array in the format:
// [{ col: 'updated_at', order: 'desc' }, { col: 'title', order: 'asc' }]
// -----------------------------------------------------------------------------
export function buildOrderBy(fieldValue) {
  const orderBy = []

  if (fieldValue) {
    const columns = fieldValue.split(',')
    for (let i = 0; i < columns.length; i++) {
      let col = columns[i].trim()
      let order = 'asc'
      if (col.length > 0) {
        // Interpret a negative value as a descending option...
        if (col.startsWith('-')) {
          col = col.substr(1)
          order = 'desc'
        }
        orderBy.push({ col, order })
      }
    } // end-for
  } // end-if (fieldValue)

  return orderBy
}

// -----------------------------------------------------------------------------
// Performs the "loadDirect" logic, hoisting relation data to the base
// attributes of the provided Bookshelf data.
// -----------------------------------------------------------------------------
// NOTE: This function mutates the data provided. There is no return value.
// -----------------------------------------------------------------------------
export function loadRelationsToItemBase(itemData, loadDirect = {}, keepAsRelations = []) {
  if (loadDirect.associations) {
    // Loop through all loadDirect requests, moving the specified column data to the item's base attributes...
    loadDirect.associations.forEach((relationName) => {
      const colNames = loadDirect.colMappings[relationName]
      const relationData = (itemData.relations[relationName]) ? itemData.relations[relationName] : null
      let loadDirectData = null

      if (relationData) {
        // Handle collection (many relation)...
        if (relationData.models) {
          loadDirectData = []
          relationData.models.forEach((modelData) => {
            // Multiple, explicit fields...
            if (Array.isArray(colNames)) {
              const colDataSet = {}
              colNames.forEach((colName) => {
                colDataSet[colName] = modelData.attributes[colName]
              })
              loadDirectData.push(colDataSet)
            // Wildcard fields...
            } else if (colNames === '*') {
              loadDirectData.push(modelData.attributes)
            // Single field...
            } else {
              loadDirectData.push(modelData.attributes[colNames])
            }
          })

        // Handle item (1-1 relation)...
        } else {
          /* eslint-disable no-lonely-if */
          // Multiple, explicit fields...
          if (Array.isArray(colNames)) {
            loadDirectData = {}
            colNames.forEach((colName) => {
              loadDirectData[colName] = relationData.attributes[colName]
            })
          // Wildcard fields...
          } else if (colNames === '*') {
            loadDirectData = relationData.attributes
          // Single field...
          } else {
            loadDirectData = relationData.attributes[colNames]
          }
          /* eslint-enable no-lonely-if */
        }
      } // end-if (relationData)

      if (debug_loadDirect) console.log(`[JOINT] [bookshelf-utils:loadRelationsToItemBase] load direct: ${relationName}:${colNames} => ${loadDirectData}`)

      // Copy the column value to a base attribute (using the relation name as the property name)...
      if (loadDirectData) {
        const attrName = stringUtils.toSnakeCase(relationName)
        itemData.attributes[attrName] = loadDirectData
      }

      // If not included in the standard relations, remove the relation data from the item...
      if (!objectUtils.includes(keepAsRelations, relationName)) {
        delete itemData.relations[relationName]
      }
    })
  } // end-if (loadDirect.associations)
}
