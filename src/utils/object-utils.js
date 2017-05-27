const lodashObject = require('lodash/object');
const lodashLang = require('lodash/lang');
const lodashCollection = require('lodash/collection');

module.exports = {
  get: lodashObject.get,
  has: lodashObject.has,
  isEmpty: lodashLang.isEmpty,
  includes: lodashCollection.includes,
};
