import objectUtils from '../../../utils/object-utils'
import stringUtils from '../../../utils/string-utils'
import ACTION from '../../../core/constants/action-constants'
import * as StatusErrors from '../../../core/errors/status-errors'
import * as CoreUtils from '../../../core/core-utils'

const debugLoadDirect = false

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
// Append a where clause to an existing query, per the provided input data.
// -----------------------------------------------------------------------------
export function appendWhereClause (joint, queryBuilder, modelName, fieldName, value) {
  const mainTableName = joint.model[modelName].prototype.tableName

  // console.log(`[DEVING] APPEND WHERE CLAUSE -- ${modelName}.${fieldName} = `, value)

  // ---------------------------------------------------------------------------
  // An array value is a "where in" clause
  // ---------------------------------------------------------------------------
  if (Array.isArray(value)) {
    queryBuilder.where(`${mainTableName}.${fieldName}`, 'IN', value)

  // ---------------------------------------------------------------------------
  // An object value is an Advanced Query
  // ---------------------------------------------------------------------------
  } else if (value !== null && typeof value === 'object') {
    console.log(`[DEVING] WHERE CLAUSE with ADVANCED QUERY: ${fieldName}:`, value)

    for (const operator of Object.keys(value)) {
      switch (operator) {
        // TODO - Support an array of multiple values !!!
        // Case insensitive LIKE query
        // Note that case-sensitivity of LIKE differs per DBMS, comparing always
        // with lowercase is potentially slower but more portable.
        case ACTION.INPUT_FIELD_QUERY_CONTAINS: {
          console.log(`[DEVING] Handling "${ACTION.INPUT_FIELD_QUERY_CONTAINS}" action on:`, value[ACTION.INPUT_FIELD_QUERY_CONTAINS])

          const valueForQuery = value[ACTION.INPUT_FIELD_QUERY_CONTAINS].toLowerCase()
          queryBuilder.whereRaw('LOWER( ?? ) LIKE ?', [`${mainTableName}.${fieldName}`, `%${valueForQuery}%`])
          break
        }
        // Excludes (value must be an array)
        case ACTION.INPUT_FIELD_QUERY_EXCLUDES: {
          console.log(`[DEVING] Handling "${ACTION.INPUT_FIELD_QUERY_EXCLUDES}" action on:`, value[ACTION.INPUT_FIELD_QUERY_EXCLUDES])

          if (!Array.isArray(value[ACTION.INPUT_FIELD_QUERY_EXCLUDES])) {
            throw new Error(`The "${ACTION.INPUT_FIELD_QUERY_EXCLUDES}" operator requires an array of strings.`)
          }

          const valueForQuery = value[ACTION.INPUT_FIELD_QUERY_EXCLUDES]
          queryBuilder.whereRaw(`?? NOT IN (${valueForQuery.map(() => '?').join(', ')})`, [`${mainTableName}.${fieldName}`, ...valueForQuery])
          break
        }
        default: {
          console.log(`[DEVING] No action implemented for operator ${operator} on:`, value[ACTION.INPUT_FIELD_QUERY_CONTAINS])
        }
      }
    }
  // ---------------------------------------------------------------------------
  // A primitive type is a direct match
  // ---------------------------------------------------------------------------
  } else {
    // Direct match
    queryBuilder.where(`${mainTableName}.${fieldName}`, '=', value)
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
// This logic supports ordering by columns of associations (via dot
// notation). If the association is not defined on the source model, an error
// is thrown.
//
// NOTES:
// + Only supports a depth of 1 (i.e. <association>.<field>).
// + NULLS are always returned last in both ASC and DESC orders.
// -----------------------------------------------------------------------------
export function appendOrderByClause (joint, queryBuilder, modelName, fieldValue) {
  // Iterate orderBy arguments
  const results = buildOrderBy(fieldValue).map(orderOpt => {
    // Support column from main model
    if (!orderOpt.col.includes('.')) {
      return [true, (_queryBuilder) => _queryBuilder.orderBy(orderOpt.col, orderOpt.order)]

    // Support column from association
    } else {
      const parts = orderOpt.col.split('.')
      const assocName = parts[0]
      const colName = parts[1]
      const assocModelName = (joint.modelNameOfAssoc[modelName]) ? joint.modelNameOfAssoc[modelName][assocName] : null

      // Record error if association name is not recognized
      if (!assocModelName) {
        return [false, `The orderBy argument "${assocName}.${colName}" is invalid as the association "${assocName}" does not exist for model "${modelName}"`]
      }

      // Obtain model config info to build raw query
      const mainTableName = joint.model[modelName].prototype.tableName
      const assocTableName = joint.model[assocModelName].prototype.tableName
      const mainModelConfig = joint.modelConfig.find(it => it.name === modelName)
      const assocConfig = mainModelConfig.associations[assocName]

      // Record error if association is not "toOne" (i.e. it is a "toMany" relationsip)
      if (assocConfig.type !== 'toOne') {
        return [false, `The orderBy argument "${assocName}.${colName}" is invalid because the association "${assocName}" is not of type "toOne".`]
      }

      // Include column from association in select statement and perform join with orderBy clause
      const assocPathInfo = CoreUtils.parseAssociationPath(assocConfig.path)
      return [true, (_queryBuilder) => _queryBuilder
        .leftJoin(assocTableName, `${mainTableName}.${assocPathInfo.sourceField}`, `${assocTableName}.${assocPathInfo.targetField}`)
        .select(`${mainTableName}.*`, `${assocTableName}.${colName}`)
        .orderByRaw(`${assocTableName}.${colName} IS NULL, ${assocTableName}.${colName} ${orderOpt.order}`)
      ]
    }
  })

  // Throw error for any recorded issues
  const failures = results.filter(it => !it[0])
  if (failures.length > 0) {
    throw StatusErrors.generateInvalidOrderByInputError(failures)
  }

  // Apply orderBy logic
  results.forEach(it => it[1](queryBuilder))
}
