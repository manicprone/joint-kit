import lodashString from 'lodash/string';

function toPascalCase(str) {
  return lodashString.startCase(str).replace(/\s/g, '');
}

export default {
  toCamelCase: lodashString.camelCase,
  toKebabCase: lodashString.kebabCase,
  toSnakeCase: lodashString.snakeCase,
  toPascalCase,
};
