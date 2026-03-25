import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Lead } from '~/server/utils/db'

// Import après les mocks
import { countLeads, getAllLeads } from '~/server/utils/db'

// Mock des dépendances AVANT les imports
vi.mock('~/server/utils/db', () => ({
  getAllLeads: vi.fn(),
  countLeads: vi.fn()
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

describe('GET /api/leads', () => {
  let handler: any

  beforeAll(async () => {
    const module = await import('~/server/api/leads.get')
    handler = module.default
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetQuery.mockReturnValue({
      limit: '10',
      offset: '0'
    })
  })

  it('doit retourner total + liste des leads', async () => {
    const mockItems: Lead[] = [
      {
        accessToken: 'token-123',
        answers: {
          email: 'test@example.com',
          name: 'Test User'
        },
        completedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        id: 1,
        metadata: {
          referrer: 'https://example.com',
          timestamp: '2024-01-01T00:00:00Z',
          userAgent: 'Mozilla/5.0 ' + 'a'.repeat(300)
        },
        qualification: {
          level: 'high',
          reasons: ['service_architecture_frontend'],
          recommendedOffer: 'audit',
          score: 8
        },
        stepCount: 5,
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    vi.mocked(getAllLeads).mockResolvedValue(mockItems)
    vi.mocked(countLeads).mockResolvedValue(42)

    const mockEvent = {
      method: 'GET'
    }

    const result = await handler(mockEvent as any)

    expect(result).toHaveProperty('total', 42)
    expect(result).toHaveProperty('items')
    expect(result.items).toHaveLength(1)

    expect(result.items[0]).toMatchObject({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      accessToken: 'token-123'
    })
    expect(result.items[0].metadata.userAgent.length).toBeLessThanOrEqual(160)
  })

  it('doit retourner 405 si la méthode n’est pas GET', async () => {
    const mockEvent = {
      method: 'POST'
    }

    await expect(handler(mockEvent as any)).rejects.toThrow()
  })

  it('doit retourner 400 si les paramètres sont invalides', async () => {
    mockGetQuery.mockReturnValue({
      limit: '-1',
      offset: 'nope'
    })

    const mockEvent = {
      method: 'GET'
    }

    await expect(handler(mockEvent as any)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalled()
  })
})
