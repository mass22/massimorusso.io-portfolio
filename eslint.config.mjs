// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
}, {
  files: ['**/nuxt.config.ts'],
  rules: {
    '@stylistic/sort-keys': 'off',
    'perfectionist/sort-objects': 'off',
    'sort-keys': 'off',
    'vue/sort-keys': 'off'
  }
})
