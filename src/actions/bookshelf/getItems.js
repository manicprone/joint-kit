import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthHandler from '../../authorization/auth-handler';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import * as BookshelfUtils from './bookshelf-utils';
import ACTION from '../action-constants';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function getItems(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const modelName = spec[ACTION.SPEC_MODEL_NAME];
    const specFields = spec[ACTION.SPEC_FIELDS];
    const specAuth = spec[ACTION.SPEC_AUTH] || {};
    const returnColsDef = spec[ACTION.SPEC_COLUMNS_TO_RETURN];
    const inputFields = ActionUtils.prepareFieldData(specFields, input[ACTION.INPUT_FIELDS]);
    const trx = input[ACTION.INPUT_TRANSACTING];
    const authBundle = input[ACTION.INPUT_AUTH_BUNDLE];

    // Reject if model does not exist...
    const model = bookshelf.model(modelName);
    if (!model) {
      if (debug) console.log(`[JOINT] [action:getItems] The model "${modelName}" is not recognized`);
      return reject(StatusErrors.generateModelNotRecognizedError(modelName));
    }

    // Reject when required fields are not provided...
    const requiredFieldCheck = ActionUtils.checkRequiredFields(specFields, inputFields);
    if (!requiredFieldCheck.satisfied) {
      if (debug) console.log('[JOINT] [action:getItems] Action has missing required fields:', requiredFieldCheck.missing);
      return reject(StatusErrors.generateMissingFieldsError(requiredFieldCheck.missing));
    }

    // Respect auth...
    if (authBundle) {
      const ownerCreds = ActionUtils.parseOwnerCreds(specAuth, inputFields);
      if (!AuthHandler.isAllowed(authBundle, ownerCreds)) {
        return reject(StatusErrors.generateNotAuthorizedError());
      }
    } // end-if (authBundle)

    // Prepare action options...
    const actionOpts = {};
    if (trx) actionOpts.transacting = trx;

    // Restrict columns to return with payload...
    if (returnColsDef) {
      // If a single set (array) is defined, honor the setting...
      if (Array.isArray(returnColsDef)) {
        actionOpts.columns = returnColsDef;

      // Otherwise, try to honor the set requested by the input...
      } else if (input.columnSet && objectUtils.has(returnColsDef, input.columnSet)) {
        actionOpts.columns = returnColsDef[input.columnSet];

      // If the input does not declare a set, check for a "default" set...
      } else if (returnColsDef.default && Array.isArray(returnColsDef.default)) {
        actionOpts.columns = returnColsDef.default;
      }
    } // end-if (returnColsDef)

    // Set pagination options, if requested...
    if (input.paginate) {
      const skip = objectUtils.get(input.paginate, ACTION.INPUT_PAGINATE_SKIP, ACTION.DEFAULT_VALUE_PAGINATE_SKIP);
      const limit = objectUtils.get(input.paginate, ACTION.INPUT_PAGINATE_LIMIT, ACTION.DEFAULT_VALUE_PAGINATE_LIMIT);
      actionOpts.offset = skip;
      actionOpts.limit = limit;
    }

    // Include relations (relations and loadDirect will be combined into a distinct set)...
    let relations = null;
    const loadDirect = ActionUtils.parseLoadDirect(input.loadDirect);
    if (input.relations && Array.isArray(input.relations)) relations = input.relations.slice();
    if (loadDirect.relations && loadDirect.relations.length > 0) {
      if (relations) {
        loadDirect.relations.forEach((relationName) => {
          if (!objectUtils.includes(relations, relationName)) relations.push(relationName);
        });
      } else {
        relations = loadDirect.relations;
      }
    }
    if (relations) actionOpts.withRelated = relations;

    // Build where clause...
    const whereOpts = {};
    if (inputFields && specFields) {
      specFields.forEach((fieldSpec) => {
        const fieldName = fieldSpec.name;
        const hasInput = objectUtils.has(inputFields, fieldName);

        if (hasInput) {
          whereOpts[fieldName] = inputFields[fieldName];
        }
      }); // end-specFields.forEach
    } // end-if (inputFields && specFields)

    // Set orderBy options...
    let orderByQuery = {};
    const defaultOrderBy = objectUtils.get(spec, ACTION.SPEC_DEFAULT_ORDER_BY, null);
    const requestedOrderBy = objectUtils.get(input, ACTION.INPUT_ORDER_BY, null);
    const orderByOpts = requestedOrderBy || defaultOrderBy;
    if (orderByOpts) {
      const orderBy = BookshelfUtils.buildOrderBy(orderByOpts);
      /* eslint-disable array-callback-return */
      orderByQuery = (queryBuilder) => {
        orderBy.map((orderOpt) => {
          queryBuilder.orderBy(orderOpt.col, orderOpt.order);
        });
      };
      /* eslint-enable array-callback-return */
    }

    // -----------------------------
    // Perform paginated request...
    // -----------------------------
    if (input.paginate) {
      return model.where(whereOpts).query(orderByQuery).fetchPage(actionOpts)
        .then((data) => {
          // Handle loadDirect requests...
          if (loadDirect.relations) {
            data.models.forEach(itemData => BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, input.relations));
          }

          // Return data in requested format...
          switch (output) {
            case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
            default: return resolve(data);
          }
        })
        .catch((error) => {
          if (debug) console.log('[JOINT] [action:getItems] Action encountered an error =>', error);
          return reject(StatusErrors.generateThirdPartyError(error));
        });
    }

    // ------------------------------
    // Otherwise, return all items...
    // ------------------------------
    return model.where(whereOpts).query(orderByQuery).fetchAll(actionOpts)
      .then((data) => {
        // Handle loadDirect requests...
        if (loadDirect.relations) {
          data.models.forEach(itemData => BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, input.relations));
        }

        // Return data in requested format...
        switch (output) {
          case 'json-api': return resolve(toJsonApi(modelName, data, bookshelf));
          default: return resolve(data);
        }
      })
      .catch((error) => {
        if (debug) console.log('[JOINT] [action:getItems] Action encountered an error =>', error);
        return reject(StatusErrors.generateThirdPartyError(error));
      });
  });
} // END - getItems
