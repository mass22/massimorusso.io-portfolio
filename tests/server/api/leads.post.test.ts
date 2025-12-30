import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import type { LeadContext } from '~/types/content'

// Import après les mocks
import { insertLead } from '~/server/utils/db'
import { checkRateLimit } from '~/server/utils/rateLimit'
import { sendAdminLeadEmail } from '~/server/utils/sendAdminLeadEmail'

// Mock des dépendances AVANT les imports
vi.mock('~/server/utils/db', () => ({
  insertLead: vi.fn()
}))

vi.mock('~/server/utils/rateLimit', () => ({
  checkRateLimit: vi.fn(() => false),
  getResetTime: vi.fn(() => 0)
}))

vi.mock('~/server/utils/sendAdminLeadEmail', () => ({
  sendAdminLeadEmail: vi.fn(() => Promise.resolve(true))
}))

// Mock de h3 (utilisé par Nuxt pour les auto-imports)
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((options: any) => {
  const error: any = new Error(options.statusMessage || 'Error')
  error.statusCode = options.statusCode || 500
  error.statusMessage = options.statusMessage
  error.data = options.data
  throw error
})
const mockDefineEventHandler = vi.fn((handler: any) => handler)

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    readBody: mockReadBody,
    createError: mockCreateError,
    defineEventHandler: mockDefineEventHandler
  }
})

// Exposer les fonctions globalement pour les auto-imports Nuxt
;(globalThis as any).readBody = mockReadBody
;(globalThis as any).createError = mockCreateError
;(globalThis as any).defineEventHandler = mockDefineEventHandler

// Import dynamique du handler pour éviter les problèmes d'auto-imports
let handler: any

describe('POST /api/leads', () => {
  // Mock console pour éviter les logs dans les tests
  const originalConsoleError = console.error
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeAll(async () => {
    // Supprimer les logs pendant les tests
    console.error = vi.fn()
    console.log = vi.fn()
    console.warn = vi.fn()

    // Charger le handler après que tous les mocks soient en place
    const module = await import('~/server/api/leads.post')
    handler = module.default
  })

  afterAll(() => {
    // Restaurer les logs après les tests
    console.error = originalConsoleError
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock readBody par défaut
    mockReadBody.mockResolvedValue({
      email: 'test@example.com',
      name: 'Test User',
      consent: true,
      context: {
        answers: {
          email: 'test@example.com',
          name: 'Test User'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 5,
        metadata: {
          userAgent: 'Mozilla/5.0',
          referrer: 'https://example.com'
        }
      },
      qualification: {
        score: 5,
        level: 'high',
        reasons: ['service_architecture_frontend']
      },
      locale: 'fr'
    })
  })

  it('doit créer un lead avec succès', async () => {
    vi.mocked(insertLead).mockResolvedValue(1)

    const mockEvent = {
      method: 'POST',
      headers: {
        'x-forwarded-for': '127.0.0.1'
      },
      node: {
        req: {
          socket: {
            remoteAddress: '127.0.0.1'
          }
        }
      }
    }

    const result = await handler(mockEvent)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('token')
    expect(result.id).toBe(1)
    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)
  })

  it('doit valider l\'email', async () => {
    mockReadBody.mockResolvedValue({
      email: 'invalid-email',
      consent: true,
      context: {
        answers: {},
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 1
      }
    })

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit valider le consent', async () => {
    mockReadBody.mockResolvedValue({
      email: 'test@example.com',
      consent: undefined,
      context: {
        answers: {},
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 1
      }
    })

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit rejeter les requêtes avec honeypot rempli', async () => {
    mockReadBody.mockResolvedValue({
      email: 'test@example.com',
      consent: true,
      website: 'spam-bot',
      context: {
        answers: {},
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 1
      }
    })

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit gérer les erreurs de contrainte unique (token dupliqué)', async () => {
    const error: any = new Error('Duplicate token')
    error.code = '23505'

    vi.mocked(insertLead)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(2)

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    const result = await handler(mockEvent)

    expect(insertLead).toHaveBeenCalledTimes(2)
    expect(result).toHaveProperty('id')
    expect(result.id).toBe(2)
  })

  it('doit gérer les erreurs de base de données', async () => {
    const error = new Error('Database error')
    vi.mocked(insertLead).mockRejectedValue(error)

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit envoyer un email si consent est true', async () => {
    vi.mocked(insertLead).mockResolvedValue(1)

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await handler(mockEvent)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(sendAdminLeadEmail).toHaveBeenCalled()
  })

  it('ne doit pas envoyer d\'email si consent est false', async () => {
    vi.mocked(insertLead).mockResolvedValue(1)

    mockReadBody.mockResolvedValue({
      email: 'test@example.com',
      consent: false,
      context: {
        answers: {
          email: 'test@example.com'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 3
      }
    })

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await handler(mockEvent)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(sendAdminLeadEmail).not.toHaveBeenCalled()
  })

  it('doit utiliser le contexte minimal si consent est false', async () => {
    vi.mocked(insertLead).mockResolvedValue(1)

    mockReadBody.mockResolvedValue({
      email: 'test@example.com',
      consent: false,
      context: {
        answers: {
          email: 'test@example.com',
          service: 'architecture-frontend',
          urgency: 'urgent'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 5
      }
    })

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await handler(mockEvent)

    expect(insertLead).toHaveBeenCalled()
    const callArgs = vi.mocked(insertLead).mock.calls[0]
    const context = callArgs[0] as LeadContext

    expect(context.answers).toHaveProperty('email')
    expect(context.answers.email).toBe('test@example.com')
    expect(context.answers).not.toHaveProperty('service')
    expect(context.answers).not.toHaveProperty('urgency')
  })

  it('doit rejeter les requêtes non-POST', async () => {
    const mockEvent = {
      method: 'GET',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit gérer le rate limiting', async () => {
    vi.mocked(checkRateLimit).mockReturnValue(true)

    const mockEvent = {
      method: 'POST',
      headers: {},
      node: { req: { socket: { remoteAddress: '127.0.0.1' } } }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })
})
