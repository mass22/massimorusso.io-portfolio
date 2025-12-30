import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'

// Mock de h3 pour les auto-imports
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
    createError: mockCreateError,
    defineEventHandler: mockDefineEventHandler
  }
})

// Mock de @neondatabase/serverless
const mockSql = vi.fn()
const mockNeon = vi.fn(() => mockSql)

vi.mock('@neondatabase/serverless', () => ({
  neon: mockNeon
}))

// Exposer les fonctions globalement pour les auto-imports Nuxt
;(globalThis as any).createError = mockCreateError
;(globalThis as any).defineEventHandler = mockDefineEventHandler

// Import dynamique du handler
let handler: any

describe('GET /api/db-version', () => {
  // Mock console pour éviter les logs dans les tests
  const originalConsoleError = console.error
  const originalConsoleLog = console.log

  beforeAll(async () => {
    // Supprimer les logs pendant les tests
    console.error = vi.fn()
    console.log = vi.fn()

    const module = await import('~/server/api/db-version.get')
    handler = module.default
  })

  afterAll(() => {
    // Restaurer les logs après les tests
    console.error = originalConsoleError
    console.log = originalConsoleLog
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Configuration par défaut
    process.env.DATABASE_URL = 'postgresql://user:password@host.neon.tech/database'
    delete process.env.POSTGRES_URL
    delete process.env.POSTGRES_PRISMA_URL
  })

  it('doit retourner la version de la base de données', async () => {
    const mockVersion = 'PostgreSQL 17.5 on x86_64-pc-linux-gnu'
    mockSql.mockResolvedValue([{ version: mockVersion }])

    const mockEvent = {
      method: 'GET'
    }

    const result = await handler(mockEvent)

    expect(result).toHaveProperty('version')
    expect(result).toHaveProperty('connected')
    expect(result).toHaveProperty('databaseUrl')
    expect(result).toHaveProperty('timestamp')
    expect(result.version).toBe(mockVersion)
    expect(result.connected).toBe(true)
    expect(result.databaseUrl).toContain('****') // Mot de passe masqué
    expect(mockNeon).toHaveBeenCalledWith(process.env.DATABASE_URL)
  })

  it('doit utiliser POSTGRES_URL si DATABASE_URL n\'est pas disponible', async () => {
    delete process.env.DATABASE_URL
    process.env.POSTGRES_URL = 'postgresql://user:password@host.neon.tech/database'

    const mockVersion = 'PostgreSQL 17.5'
    mockSql.mockResolvedValue([{ version: mockVersion }])

    const mockEvent = {
      method: 'GET'
    }

    const result = await handler(mockEvent)

    expect(result.version).toBe(mockVersion)
    expect(mockNeon).toHaveBeenCalledWith(process.env.POSTGRES_URL)
  })

  it('doit utiliser POSTGRES_PRISMA_URL si les autres ne sont pas disponibles', async () => {
    delete process.env.DATABASE_URL
    delete process.env.POSTGRES_URL
    process.env.POSTGRES_PRISMA_URL = 'postgresql://user:password@host.neon.tech/database'

    const mockVersion = 'PostgreSQL 17.5'
    mockSql.mockResolvedValue([{ version: mockVersion }])

    const mockEvent = {
      method: 'GET'
    }

    const result = await handler(mockEvent)

    expect(result.version).toBe(mockVersion)
    expect(mockNeon).toHaveBeenCalledWith(process.env.POSTGRES_PRISMA_URL)
  })

  it('doit retourner une erreur si aucune variable d\'environnement n\'est configurée', async () => {
    delete process.env.DATABASE_URL
    delete process.env.POSTGRES_URL
    delete process.env.POSTGRES_PRISMA_URL

    const mockEvent = {
      method: 'GET'
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit retourner une erreur en cas d\'échec de connexion', async () => {
    const connectionError = new Error('Connection failed')
    mockSql.mockRejectedValue(connectionError)

    const mockEvent = {
      method: 'GET'
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit masquer le mot de passe dans databaseUrl', async () => {
    process.env.DATABASE_URL = 'postgresql://user:secretpassword@host.neon.tech/database'

    const mockVersion = 'PostgreSQL 17.5'
    mockSql.mockResolvedValue([{ version: mockVersion }])

    const mockEvent = {
      method: 'GET'
    }

    const result = await handler(mockEvent)

    expect(result.databaseUrl).toContain('****')
    expect(result.databaseUrl).not.toContain('secretpassword')
  })

  it('doit retourner 405 pour les requêtes non-GET', async () => {
    const mockEvent = {
      method: 'POST'
    }

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit inclure un timestamp dans la réponse', async () => {
    const mockVersion = 'PostgreSQL 17.5'
    mockSql.mockResolvedValue([{ version: mockVersion }])

    const mockEvent = {
      method: 'GET'
    }

    const before = new Date().toISOString()
    const result = await handler(mockEvent)
    const after = new Date().toISOString()

    expect(result.timestamp).toBeDefined()
    expect(result.timestamp >= before).toBe(true)
    expect(result.timestamp <= after).toBe(true)
  })
})
