import objectUtils from '../utils/object-utils';
import stringUtils from '../utils/string-utils';

const debug_loadDirect = false;

// -----------------------------------------------------------------------------
// Accepts the "orderBy" API field value and returns
// the Bookshelf-compatible specification for an order-by clause.
// -----------------------------------------------------------------------------
// The returned specification is an array in the format:
// [{ col: 'updated_at', order: 'desc' }, { col: 'title', order: 'asc' }]
// -----------------------------------------------------------------------------
export function buildOrderBy(fieldValue) {
  const orderBy = [];

  if (fieldValue) {
    const columns = fieldValue.split(',');
    for (let i = 0; i < columns.length; i++) {
      let col = columns[i].trim();
      let order = 'asc';
      if (col.length > 0) {
        // Interpret a negative value as a descending option...
        if (col.startsWith('-')) {
          col = col.substr(1);
          order = 'desc';
        }
        orderBy.push({ col, order });
      }
    } // end-for
  } // end-if (fieldValue)

  return orderBy;
}

// -----------------------------------------------------------------------------
// Performs the "loadDirect" logic, hoisting relation data to the base
// attributes of the provided Bookshelf data.
// -----------------------------------------------------------------------------
// NOTE: This function mutates the data provided. There is no return value.
// -----------------------------------------------------------------------------
export function loadRelationsToItemBase(itemData, loadDirect = {}, standardRelations = []) {
  if (loadDirect.relations) {
    // Loop through all loadDirect requests, moving the specified col value to the item's base attributes...
    loadDirect.relations.forEach((relationName) => {
      const colName = loadDirect.colMappings[relationName];
      const relationData = (itemData.relations[relationName]) ? itemData.relations[relationName] : null;
      let loadDirectValue = null;

      // Handle collection (many relation)...
      if (relationData && relationData.models) {
        loadDirectValue = [];
        relationData.models.forEach((modelData) => {
          if (objectUtils.has(modelData.attributes, colName)) loadDirectValue.push(modelData.attributes[colName]);
        });
      // Handle item (1-1 relation)...
      } else if (relationData && objectUtils.has(relationData.attributes, colName)) {
        loadDirectValue = relationData.attributes[colName];
      }
      if (debug_loadDirect) console.log(`[JOINT] [bookshelf-utils:loadRelationsToItemBase] load direct: ${relationName}:${colName} => ${loadDirectValue}`);

      // Copy the column value to a base attribute (using the relation name as the property name)...
      if (loadDirectValue) {
        const attrName = stringUtils.toSnakeCase(relationName);
        itemData.attributes[attrName] = loadDirectValue; // eslint-disable-line no-param-reassign
      }

      // If not included in the standard relations, remove the relation data from the item...
      if (!objectUtils.includes(standardRelations, relationName)) {
        delete itemData.relations[relationName]; // eslint-disable-line no-param-reassign
      }
    });
  } // end-if (loadDirect.relations)
}
