import Promise from 'bluebird';
import objectUtils from '../../utils/object-utils';
import * as AuthUtils from '../../authorization/auth-utils';
import * as StatusErrors from '../../errors/status-errors';
import * as ActionUtils from '../action-utils';
import ACTION from '../action-constants';
import * as BookshelfUtils from './bookshelf-utils';
import toJsonApi from './serializers/json-api';

const debug = false;

export default function getItems(bookshelf, spec = {}, input = {}, output) {
  return new Promise((resolve, reject) => {
    const modelName = spec[ACTION.SPEC_MODEL_NAME];
    const specFields = spec[ACTION.SPEC_FIELDS];
    const specAuth = spec[ACTION.SPEC_AUTH] || {};
    const returnColsDef = spec[ACTION.SPEC_FIELDS_TO_RETURN];
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
      if (!AuthUtils.isAllowed(authBundle, ownerCreds)) {
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
      } else if (input[ACTION.INPUT_FIELD_SET] && objectUtils.has(returnColsDef, input[ACTION.INPUT_FIELD_SET])) {
        actionOpts.columns = returnColsDef[input[ACTION.INPUT_FIELD_SET]];

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

    // -------------------------------------------------------------------------
    // Include associations (associations & loadDirect will be combined)
    // -------------------------------------------------------------------------
    // Handle "loadDirect" option...
    const inputLoadDirectDef = input[ACTION.INPUT_LOAD_DIRECT] || [];
    const loadDirectDef = (spec[ACTION.SPEC_FORCE_LOAD_DIRECT])
        ? spec[ACTION.SPEC_FORCE_LOAD_DIRECT].concat(inputLoadDirectDef)
        : inputLoadDirectDef;
    const loadDirect = ActionUtils.parseLoadDirect(loadDirectDef);
    // Handle "associations" option...
    const inputAssocs = input[ACTION.INPUT_ASSOCIATIONS] || [];
    const assocs = (spec[ACTION.SPEC_FORCE_ASSOCIATIONS])
        ? objectUtils.union(spec[ACTION.SPEC_FORCE_ASSOCIATIONS], inputAssocs)
        : inputAssocs;
    // Combine...
    const allAssociations = (loadDirect.associations && loadDirect.associations.length > 0)
        ? objectUtils.union(assocs, loadDirect.associations)
        : assocs;
    if (allAssociations.length > 0) actionOpts.withRelated = allAssociations;

    // Prepare query...
    const queryOpts = (queryBuilder) => {
      // Build where clause...
      if (inputFields && specFields) {
        specFields.forEach((fieldSpec) => {
          const fieldName = fieldSpec.name;
          const hasInput = objectUtils.has(inputFields, fieldName);
          if (hasInput) {
            const inputValue = inputFields[fieldName];
            if (Array.isArray(inputValue)) queryBuilder.where(fieldName, 'IN', inputValue);
            else queryBuilder.where(fieldName, '=', inputValue);
          }
        });
      } // end-if (inputFields && specFields)

      // Set orderBy options...
      const defaultOrderBy = objectUtils.get(spec, ACTION.SPEC_DEFAULT_ORDER_BY, null);
      const requestedOrderBy = objectUtils.get(input, ACTION.INPUT_ORDER_BY, null);
      const orderByOpts = requestedOrderBy || defaultOrderBy;
      if (orderByOpts) {
        const orderBy = BookshelfUtils.buildOrderBy(orderByOpts);
        orderBy.map((orderOpt) => {
          return queryBuilder.orderBy(orderOpt.col, orderOpt.order);
        });
      }
    };

    // ----------------------------
    // Perform paginated request...
    // ----------------------------
    if (input.paginate) {
      return model.query(queryOpts).fetchPage(actionOpts)
        .then((data) => {
          // Handle loadDirect requests...
          if (loadDirect.associations) {
            data.models.forEach(itemData => BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, input.associations));
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
    return model.query(queryOpts).fetchAll(actionOpts)
      .then((data) => {
        // Handle loadDirect requests...
        if (loadDirect.associations) {
          data.models.forEach(itemData => BookshelfUtils.loadRelationsToItemBase(itemData, loadDirect, input.associations));
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
