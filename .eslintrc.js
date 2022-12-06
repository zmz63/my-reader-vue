/* eslint sort-keys: "error" */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['prettier', '@typescript-eslint', 'vue'],
  root: true,
  rules: {
    /**
     * Eslint config
     */

    // eslint-disable-next-line sort-keys
    'camelcase': 'warn',
    'consistent-this': 'warn',
    'line-comment-position': 'warn',
    'no-inline-comments': 'warn',
    'no-useless-constructor': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',

    /* Automatically fixable */
    // eslint-disable-next-line sort-keys
    'arrow-body-style': 'warn',
    'eqeqeq': 'warn',
    'lines-between-class-members': 'warn',
    'no-lonely-if': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-rename': 'warn',
    'no-var': 'warn',
    'object-shorthand': 'warn',
    'operator-assignment': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
    'prefer-numeric-literals': 'warn',
    'prefer-object-spread': 'warn',
    'prefer-template': 'warn',
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    'spaced-comment': 'warn',

    /**
     * Typescript-eslint config
     */

    // eslint-disable-next-line sort-keys
    '@typescript-eslint/no-var-requires': 'warn',

    /* Automatically fixable */
    // eslint-disable-next-line sort-keys
    '@typescript-eslint/array-type': 'warn',

    /**
     * Vue config
     */

    /* Automatically fixable */
    // eslint-disable-next-line sort-keys
    'vue/component-tags-order': [
      'warn',
      {
        order: ['script', 'template', 'style']
      }
    ],
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          component: 'always',
          normal: 'always',
          void: 'always'
        },
        math: 'always',
        svg: 'always'
      }
    ],
    'vue/max-attributes-per-line': 'off',

    // eslint-disable-next-line sort-keys
    'vue/multi-word-component-names': 'off',

    /**
     * Prettier config
     */

    // eslint-disable-next-line sort-keys
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'avoid',
        jsxBracketSameLine: false,
        printWidth: 100,
        quoteProps: 'consistent',
        semi: false,
        singleQuote: true,
        trailingComma: 'none',
        useTabs: false
      }
    ]
  }
}
