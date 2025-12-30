// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
}, {
  files: ['**/nuxt.config.ts'],
  rules: {
    'perfectionist/sort-objects': 'off',
    '@stylistic/sort-keys': 'off',
    'sort-keys': 'off',
    'vue/sort-keys': 'off'
  }
})
