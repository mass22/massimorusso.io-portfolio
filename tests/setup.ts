// Setup file for tests

import { vi } from 'vitest'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// Auto-imports Nuxt/Vue pour les composants (script setup)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watch', watch)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('onUnmounted', onUnmounted)

// Mock de import.meta pour les tests
if (typeof (globalThis as any).import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    configurable: true,
    value: {
      meta: {
        dev: true,
        server: true
      }
    },
    writable: true
  })
}

// Mock de process.env pour les tests
process.env.NODE_ENV = 'test'
