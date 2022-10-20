module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'import', 'prettier', '@typescript-eslint'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    'plugin:cypress/recommended'
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
    'import/no-cycle': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before'
          },
          {
            pattern: '@components/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@dto/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@library/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@api/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@constants/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@utils/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@styles/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@types/**',
            group: 'internal',
            position: 'before'
          }
        ],
        alphabetize: {
          order: 'desc',
          caseInsensitive: true
        },
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always'
      }
    ],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true
      }
    ],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': ['error', { ignore: ['swiper/*'] }],
    'no-console': ['error'],
    'react-hooks/exhaustive-deps': ['error'],
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unused-prop-types': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '_' }]
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  env: {
    jest: true
  },
  overrides: [
    {
      files: ['next.config.js'],
      parserOptions: {
        ecmaVersion: 2020
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'no-param-reassign': 'off'
      }
    },
    {
      files: ['pages/_app.tsx'],
      parserOptions: {
        ecmaVersion: 2020
      },
      rules: {
        'no-underscore-dangle': 'off'
      }
    }
  ]
};
