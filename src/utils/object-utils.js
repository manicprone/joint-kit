import lodashObject from 'lodash/object';
import lodashLang from 'lodash/lang';
import lodashCollection from 'lodash/collection';

export default {
  get: lodashObject.get,
  has: lodashObject.has,
  isEmpty: lodashLang.isEmpty,
  includes: lodashCollection.includes,
};
