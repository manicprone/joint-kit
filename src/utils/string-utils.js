import lodashString from 'lodash/string'

function toPascalCase (str) {
  return lodashString.startCase(str).replace(/\s/g, '')
}

// -----------------------------------------------------------------------------
// Escapes special characters in SQL LIKE patterns
// -----------------------------------------------------------------------------
// Escapes the following characters:
// - % (percent) - matches any sequence of characters
// - _ (underscore) - matches any single character
// - \ (backslash) - escape character
// -----------------------------------------------------------------------------
function escapeSqlLike (str) {
  if (typeof str !== 'string') return str
  return str.replace(/[%_\\]/g, '\\$&')
}

export default {
  toCamelCase: lodashString.camelCase,
  toKebabCase: lodashString.kebabCase,
  toSnakeCase: lodashString.snakeCase,
  toPascalCase,
  escapeSqlLike
}
