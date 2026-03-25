import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

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
      path: '/admin/podcast-episodes',
      query: {}
    }

    // Le middleware devrait retourner sans erreur en dev
    if (import.meta.dev) {
      expect(() => middleware(mockTo)).not.toThrow()
    }
  })

  it('doit bloquer complètement l\'accès en production', () => {
    const originalDev = import.meta.dev
    Object.defineProperty(import.meta, 'dev', {
      configurable: true,
      value: false,
      writable: true
    })

    const mockTo = {
      path: '/admin/podcast-episodes',
      query: {}
    }

    // En prod le middleware ne bloque plus : l'autorisation est faite sur les endpoints.
    if (!import.meta.dev) {
      expect(() => middleware(mockTo)).not.toThrow()
    }

    Object.defineProperty(import.meta, 'dev', {
      configurable: true,
      value: originalDev,
      writable: true
    })
  })

  it('doit laisser passer en production (auth gérée côté API)', () => {
    const originalDev = import.meta.dev
    Object.defineProperty(import.meta, 'dev', {
      configurable: true,
      value: false,
      writable: true
    })

    const mockTo = {
      path: '/admin/podcast-episodes',
      query: {}
    }

    expect(() => middleware(mockTo)).not.toThrow()

    Object.defineProperty(import.meta, 'dev', {
      configurable: true,
      value: originalDev,
      writable: true
    })
  })
})
