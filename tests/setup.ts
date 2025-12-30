// Setup file for tests

// Mock de import.meta pour les tests
if (typeof (globalThis as any).import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        dev: true,
        server: true
      }
    },
    writable: true,
    configurable: true
  })
}

// Mock de process.env pour les tests
process.env.NODE_ENV = 'test'
