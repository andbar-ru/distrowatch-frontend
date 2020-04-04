module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production'
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // Переопределения правил
    'space-before-function-paren': ['error', 'never'],
    'quotes': 0, // дело вкуса, какие кавычки использовать в строках
    'quote-props': 0, // дело вкуса, окавычивать ли имена свойств в объектах
    'comma-dangle': ['error', 'always-multiline'], // последний элемент в многострочных перечислениях заканчивать запятой
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }]
  }
}
