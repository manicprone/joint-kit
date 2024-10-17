import lodashObject from 'lodash/object'
import lodashLang from 'lodash/lang'
import lodashArray from 'lodash/array'
import lodashCollection from 'lodash/collection'

export default {
  get: lodashObject.get,
  has: lodashObject.has,
  isEmpty: lodashLang.isEmpty,
  cloneDeep: lodashLang.cloneDeep,
  union: lodashArray.union,
  includes: lodashCollection.includes
}
