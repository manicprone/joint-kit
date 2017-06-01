module.exports = {
  'extends': 'airbnb-base',
  'env': {
    'mocha': true,
  },
  'plugins': [
    'import',
  ],
  'rules': {
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-use-before-define': ['error', { 'functions': false, 'classes': false }],
    'import/prefer-default-export': 'off',
    'max-len': 'off',
    'arrow-body-style': 'off',
    'no-console': 'off',
    'default-case': 'off',
    'dot-notation': 'off',
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'off',
    'func-names': 'off',
    'no-unused-expressions': 'off',
  },
};
