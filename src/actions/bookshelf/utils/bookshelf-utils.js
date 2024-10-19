/* eslint-disable array-callback-return */
import objectUtils from '../../../utils/object-utils'
import stringUtils from '../../../utils/string-utils'
import ACTION from '../../../core/constants/action-constants'
import * as CoreUtils from '../../../core/core-utils'

const debugLoadDirect = false
const debugOrderBy = false

// -----------------------------------------------------------------------------
// Accepts the "orderBy" API field value and returns
// the Bookshelf-compatible specification for an order-by clause.
// -----------------------------------------------------------------------------
// The returned specification is an array in the format:
// [{ col: 'updated_at', order: 'desc' }, { col: 'title', order: 'asc' }]
// -----------------------------------------------------------------------------
export function buildOrderBy (fieldValue) {
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
export function loadRelationsToItemBase (itemData, loadDirect = {}, keepAsRelations = []) {
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

      if (debugLoadDirect) console.log(`[JOINT] [bookshelf-utils:loadRelationsToItemBase] load direct: ${relationName}:${colNames} => ${loadDirectData}`)

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

// -----------------------------------------------------------------------------
// Append a where query to an existing query builder, respecting the type of
// field value and its matchStrategy.
// -----------------------------------------------------------------------------
export function appendWhereClause (queryBuilder, fieldName, value, matchStrategy) {
  switch (matchStrategy) {
    case ACTION.INPUT_FIELD_MATCHING_STRATEGY_EXACT:
      if (Array.isArray(value)) queryBuilder.where(fieldName, 'IN', value)
      else queryBuilder.where(fieldName, '=', value)
      break
    case ACTION.INPUT_FIELD_MATCHING_STRATEGY_CONTAINS:
      // Case insensitive LIKE query
      // Note that case-sensitivity of LIKE differs per DBMS, comparing always
      // with lowercase is potentially slower but more portable.
      queryBuilder.whereRaw('LOWER( ?? ) LIKE ?', [fieldName, `%${value.toLowerCase()}%`])
      break
    default:
      throw new Error(`Unrecognized match strategy "${matchStrategy}"`)
  }
}

// -----------------------------------------------------------------------------
// Accepts the "orderBy" API field value to apply the appropriate
// "queryBuilder.orderBy" logic.
//
// The function requires including:
// joint        - The joint instance
// queryBuilder - The queryBuilder instance
// modelName    - The model name of the main resource
// -----------------------------------------------------------------------------
// This logic is supports ordering by columns of associations (via dot
// notation). If the association is not defined on the source model, the orderBy
// argument is ignored.
//
// NOTE: NULLS are always returned last in both ASC and DESC orders.
// -----------------------------------------------------------------------------
export function appendOrderByClause (joint, queryBuilder, modelName, fieldValue) {
  const orderBy = buildOrderBy(fieldValue)

  orderBy.map(orderOpt => {
    // Support column from association
    if (orderOpt.col.includes('.')) {
      const parts = orderOpt.col.split('.')
      const assocName = parts[0]
      const colName = parts[1]
      const assocModelName = (joint.modelNameOfAssoc[modelName]) ? joint.modelNameOfAssoc[modelName][assocName] : null

      if (assocModelName) {
        // Obtain model config info to build raw query
        const mainTableName = joint.model[modelName].prototype.tableName
        const assocTableName = joint.model[assocModelName].prototype.tableName
        const mainModelConfig = joint.modelConfig.find(it => it.name === modelName)
        const assocConfig = mainModelConfig.associations[assocName]

        // Include column from association in select statement and perform join with orderBy clause
        if (assocConfig) {
          const assocPathInfo = CoreUtils.parseAssociationPath(assocConfig.path)
          queryBuilder
            .leftJoin(assocTableName, `${mainTableName}.${assocPathInfo.sourceField}`, `${assocTableName}.${assocPathInfo.targetField}`)
            .select(`${mainTableName}.*`, `${assocTableName}.${colName}`)
            .orderByRaw(`${assocTableName}.${colName} IS NULL, ${assocTableName}.${colName} ${orderOpt.order}`)
        }
      } else {
        if (debugOrderBy) console.warn(`[JOINT] The orderBy argument "${assocName}.${colName}" is being ignored because the assoctiation "${assocName}" does not exist for model "${modelName}"`)
      }

    // Support column from main model
    } else {
      queryBuilder.orderBy(orderOpt.col, orderOpt.order)
    }
  })
}
