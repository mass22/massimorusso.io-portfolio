import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    alias: {
      '#imports': path.resolve(__dirname, './.nuxt/imports.d.ts'),
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.')
    }
  }
})
