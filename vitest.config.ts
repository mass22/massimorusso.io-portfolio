import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    alias: {
      '#imports': path.resolve(__dirname, './.nuxt/imports.d.ts'),
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.')
    },
    globals: true
  }
})
