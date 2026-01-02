import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'

// Mock de h3
const mockCreateError = vi.fn((options: any) => {
  const error: any = new Error(options.statusMessage)
  error.statusCode = options.statusCode
  throw error
})

const mockDefineNuxtRouteMiddleware = vi.fn((handler: any) => handler)

vi.mock('h3', () => ({
  createError: mockCreateError
}))

vi.mock('#app', () => ({
  defineNuxtRouteMiddleware: mockDefineNuxtRouteMiddleware
}))

// Exposer globalement
;(globalThis as any).createError = mockCreateError
;(globalThis as any).defineNuxtRouteMiddleware = mockDefineNuxtRouteMiddleware

describe('Admin Middleware', () => {
  let middleware: any

  beforeAll(async () => {
    // Charger le middleware après les mocks
    const module = await import('../../app/middleware/admin')
    middleware = module.default
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit permettre l\'accès en développement', () => {
    // En test, process.dev est généralement true
    const mockTo = {
      query: {},
      path: '/admin/podcast-episodes'
    }

    // Le middleware devrait retourner sans erreur en dev
    if (import.meta.dev) {
      expect(() => middleware(mockTo)).not.toThrow()
    }
  })

  it('doit bloquer complètement l\'accès en production', () => {
    // Simuler la production en mockant import.meta.dev
    const originalDev = import.meta.dev

    // Forcer import.meta.dev à false pour ce test
    Object.defineProperty(import.meta, 'dev', {
      value: false,
      writable: true,
      configurable: true
    })

    const mockTo = {
      query: {},
      path: '/admin/podcast-episodes'
    }

    // Le middleware devrait bloquer l'accès en production
    expect(() => middleware(mockTo)).toThrow()

    // Restaurer
    Object.defineProperty(import.meta, 'dev', {
      value: originalDev,
      writable: true,
      configurable: true
    })
  })

  it('doit retourner une erreur 403 en production', () => {
    const originalDev = import.meta.dev
    Object.defineProperty(import.meta, 'dev', {
      value: false,
      writable: true,
      configurable: true
    })

    const mockTo = {
      query: {},
      path: '/admin/podcast-episodes'
    }

    try {
      middleware(mockTo)
      expect.fail('Le middleware devrait avoir levé une erreur')
    } catch (error: any) {
      expect(error.statusCode).toBe(403)
      expect(error.message).toContain('développement')
    }

    // Restaurer
    Object.defineProperty(import.meta, 'dev', {
      value: originalDev,
      writable: true,
      configurable: true
    })
  })
})
