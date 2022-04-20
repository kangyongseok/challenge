module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'prettier', '@typescript-eslint'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended'
  ],
  rules: {
    quotes: ['error', 'single'],
    'no-use-before-define': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never'
      }
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    '@typescript-eslint/no-var-requires': 'off'
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  }
};
