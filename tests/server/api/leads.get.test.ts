import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import type { Lead } from '~/server/utils/db'

// Mock des dépendances AVANT les imports
vi.mock('~/server/utils/db', () => ({
  getLeadByIdAndToken: vi.fn()
}))

vi.mock('~/server/utils/leadSummary', () => ({
  leadSummary: vi.fn((context) => `Summary for ${context.answers.email}`)
}))

// Mock de h3 (utilisé par Nuxt pour les auto-imports)
const mockGetQuery = vi.fn()
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
    getQuery: mockGetQuery,
    createError: mockCreateError,
    defineEventHandler: mockDefineEventHandler
  }
})

// Exposer les fonctions globalement pour les auto-imports Nuxt
;(globalThis as any).getQuery = mockGetQuery
;(globalThis as any).createError = mockCreateError
;(globalThis as any).defineEventHandler = mockDefineEventHandler

// Import après les mocks
import { getLeadByIdAndToken } from '~/server/utils/db'
import { leadSummary } from '~/server/utils/leadSummary'

// Import dynamique du handler
let handler: any

describe('GET /api/leads/[id]', () => {
  // Mock console pour éviter les logs dans les tests
  const originalConsoleError = console.error
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeAll(async () => {
    // Supprimer les logs pendant les tests
    console.error = vi.fn()
    console.log = vi.fn()
    console.warn = vi.fn()

    const module = await import('~/server/api/leads/[id].get')
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

    // Mock getQuery par défaut
    mockGetQuery.mockReturnValue({
      token: 'valid-token-123'
    })
  })

  it('doit récupérer un lead avec succès', async () => {
    const mockLead: Lead = {
      id: 1,
      answers: {
        email: 'test@example.com',
        name: 'Test User'
      },
      completedAt: '2024-01-01T00:00:00Z',
      stepCount: 5,
      metadata: {
        userAgent: 'Mozilla/5.0'
      },
      accessToken: 'valid-token-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    vi.mocked(getLeadByIdAndToken).mockResolvedValue(mockLead)

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    const result = await handler(mockEvent)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('summary')
    expect(result).toHaveProperty('context')
    expect(result).toHaveProperty('qualification')
    expect(result.id).toBe(1)
    expect(result.summary).toContain('test@example.com')
  })

  it('doit retourner 404 si le lead n\'existe pas', async () => {
    vi.mocked(getLeadByIdAndToken).mockResolvedValue(null)

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '999'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 401 si le token est manquant', async () => {
    mockGetQuery.mockReturnValue({})

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 401 si le token est vide', async () => {
    mockGetQuery.mockReturnValue({
      token: ''
    })

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 400 si l\'ID est manquant', async () => {
    const mockEvent = {
      method: 'GET',
      context: {
        params: {}
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 400 si l\'ID est invalide', async () => {
    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: 'invalid'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 400 si l\'ID est négatif', async () => {
    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '-1'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner 405 pour les requêtes non-GET', async () => {
    const mockEvent = {
      method: 'POST',
      context: {
        params: {
          id: '1'
        }
      }
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit inclure la qualification dans la réponse', async () => {
    const mockLead: Lead = {
      id: 1,
      answers: {
        email: 'test@example.com'
      },
      completedAt: '2024-01-01T00:00:00Z',
      stepCount: 3,
      qualification: {
        score: 5,
        level: 'high',
        reasons: ['service_architecture_frontend'],
        recommendedOffer: 'audit'
      },
      accessToken: 'valid-token-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    vi.mocked(getLeadByIdAndToken).mockResolvedValue(mockLead)

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    const result = await handler(mockEvent)

    expect(result.qualification).toEqual(mockLead.qualification)
  })

  it('doit générer un résumé avec leadSummary', async () => {
    const mockLead: Lead = {
      id: 1,
      answers: {
        email: 'test@example.com',
        name: 'Test User'
      },
      completedAt: '2024-01-01T00:00:00Z',
      stepCount: 5,
      accessToken: 'valid-token-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    vi.mocked(getLeadByIdAndToken).mockResolvedValue(mockLead)

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    await handler(mockEvent)

    expect(leadSummary).toHaveBeenCalledWith({
      answers: mockLead.answers,
      completedAt: mockLead.completedAt,
      stepCount: mockLead.stepCount,
      metadata: mockLead.metadata
    })
  })

  it('doit trimmer le token', async () => {
    mockGetQuery.mockReturnValue({
      token: '  valid-token-123  '
    })

    const mockLead: Lead = {
      id: 1,
      answers: {
        email: 'test@example.com'
      },
      completedAt: '2024-01-01T00:00:00Z',
      stepCount: 3,
      accessToken: 'valid-token-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    vi.mocked(getLeadByIdAndToken).mockResolvedValue(mockLead)

    const mockEvent = {
      method: 'GET',
      context: {
        params: {
          id: '1'
        }
      }
    }

    await handler(mockEvent)

    expect(getLeadByIdAndToken).toHaveBeenCalledWith(1, 'valid-token-123')
  })
})
