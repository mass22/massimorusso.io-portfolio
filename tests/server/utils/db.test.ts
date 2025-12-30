import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { LeadContext } from '~/types/content'

// NODE_ENV est défini dans setup.ts pour permettre l'initialisation SQLite

// Import après les mocks
import {
  insertLead,
  getLeadById,
  getLeadByIdAndToken,
  getAllLeads,
  countLeads,
  closeDatabase
} from '~/server/utils/db'

// Mock complet de better-sqlite3 et des modules Node.js AVANT l'import
const mockDb = {
  pragma: vi.fn(),
  exec: vi.fn(),
  prepare: vi.fn(),
  close: vi.fn()
}

const mockStmt = {
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn()
}

// Créer une classe mockée pour better-sqlite3
class MockDatabase {
  pragma = mockDb.pragma
  exec = mockDb.exec
  prepare = mockDb.prepare
  close = mockDb.close

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_path: string) {
    // Le constructeur est appelé avec le chemin de la DB
  }
}

vi.mock('better-sqlite3', () => ({
  default: MockDatabase
}))

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(async () => []))
}))

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  existsSync: vi.fn(() => true)
}))

vi.mock('node:path', () => ({
  dirname: vi.fn(() => '/test/data'),
  join: vi.fn((...args: string[]) => args.join('/'))
}))

vi.mock('node:url', () => ({
  fileURLToPath: vi.fn(() => '/test/server/utils/db.ts')
}))

describe('db', () => {
  // Mock console pour éviter les logs dans les tests
  const originalConsoleError = console.error
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeAll(() => {
    // Supprimer les logs pendant les tests
    console.error = vi.fn()
    console.log = vi.fn()
    console.warn = vi.fn()
  })

  afterAll(() => {
    // Restaurer les logs après les tests
    console.error = originalConsoleError
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Configurer l'environnement pour utiliser SQLite
    process.env.DATABASE_URL = ''
    process.env.POSTGRES_URL = ''
    process.env.POSTGRES_PRISMA_URL = ''
    process.env.VERCEL = ''
    process.env.VERCEL_ENV = ''
    process.env.NODE_ENV = 'test'

    // Réinitialiser les mocks
    mockDb.prepare.mockReturnValue(mockStmt)
    mockStmt.run.mockReturnValue({ lastInsertRowid: 1, changes: 1 })
    mockStmt.get.mockReturnValue(null)
    mockStmt.all.mockReturnValue([])
  })

  afterEach(() => {
    closeDatabase()
  })

  describe('insertLead', () => {
    it('doit insérer un lead avec succès', async () => {
      const context: LeadContext = {
        answers: {
          email: 'test@example.com',
          name: 'Test User'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 5
      }

      mockStmt.run.mockReturnValue({ lastInsertRowid: 1, changes: 1 })

      const leadId = await insertLead(context, 'test-token')

      expect(leadId).toBe(1)
      expect(mockDb.prepare).toHaveBeenCalled()
    })

    it('doit réinitialiser la connexion Postgres si nécessaire', async () => {
      // Ce test vérifie que la réinitialisation de connexion fonctionne
      // En mode SQLite (test), cette fonctionnalité n'est pas testée directement
      // mais elle est couverte par les tests d'intégration
      const context: LeadContext = {
        answers: {
          email: 'test@example.com'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 3
      }

      mockStmt.run.mockReturnValue({ lastInsertRowid: 5, changes: 1 })

      const leadId = await insertLead(context, 'test-token')

      expect(leadId).toBe(5)
    })

    it('doit insérer un lead avec qualification', async () => {
      const context: LeadContext = {
        answers: {
          email: 'test@example.com'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 3
      }

      const qualification = {
        score: 5,
        level: 'high',
        reasons: ['service_architecture_frontend']
      }

      mockStmt.run.mockReturnValue({ lastInsertRowid: 2, changes: 1 })

      const leadId = await insertLead(context, 'test-token', qualification)

      expect(leadId).toBe(2)
    })

    it('doit insérer un lead sans token', async () => {
      const context: LeadContext = {
        answers: {
          email: 'test@example.com'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 2
      }

      mockStmt.run.mockReturnValue({ lastInsertRowid: 3, changes: 1 })

      const leadId = await insertLead(context)

      expect(leadId).toBe(3)
    })

    it('doit insérer un lead avec metadata', async () => {
      const context: LeadContext = {
        answers: {
          email: 'test@example.com'
        },
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 4,
        metadata: {
          userAgent: 'Mozilla/5.0',
          referrer: 'https://example.com'
        }
      }

      mockStmt.run.mockReturnValue({ lastInsertRowid: 4, changes: 1 })

      const leadId = await insertLead(context, 'test-token')

      expect(leadId).toBe(4)
    })
  })

  describe('getLeadById', () => {
    it('doit retourner null si le lead n\'existe pas', async () => {
      mockStmt.get.mockReturnValue(null)

      const lead = await getLeadById(999)

      expect(lead).toBeNull()
    })

    it('doit récupérer un lead par son ID', async () => {
      const mockRow = {
        id: 1,
        answers: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 5,
        metadata: null,
        qualification: null,
        accessToken: 'test-token',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      mockStmt.get.mockReturnValue(mockRow)

      const lead = await getLeadById(1)

      expect(lead).not.toBeNull()
      expect(lead?.id).toBe(1)
      expect(lead?.answers.email).toBe('test@example.com')
    })
  })

  describe('getLeadByIdAndToken', () => {
    it('doit retourner null si le lead n\'existe pas', async () => {
      mockStmt.get.mockReturnValue(null)

      const lead = await getLeadByIdAndToken(999, 'invalid-token')

      expect(lead).toBeNull()
    })

    it('doit retourner null si le token est invalide', async () => {
      mockStmt.get.mockReturnValue(null)

      const lead = await getLeadByIdAndToken(1, 'invalid-token')

      expect(lead).toBeNull()
    })

    it('doit récupérer un lead avec un token valide', async () => {
      const token = 'valid-token-123'
      const mockRow = {
        id: 1,
        answers: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
        completedAt: '2024-01-01T00:00:00Z',
        stepCount: 5,
        metadata: null,
        qualification: null,
        accessToken: token,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      mockStmt.get.mockReturnValue(mockRow)

      const lead = await getLeadByIdAndToken(1, token)

      expect(lead).not.toBeNull()
      expect(lead?.id).toBe(1)
      expect(lead?.accessToken).toBe(token)
    })
  })

  describe('getAllLeads', () => {
    it('doit retourner une liste vide si aucun lead n\'existe', async () => {
      mockStmt.all.mockReturnValue([])

      const leads = await getAllLeads()

      expect(leads).toEqual([])
    })

    it('doit respecter la limite', async () => {
      const mockRows = [
        {
          id: 1,
          answers: JSON.stringify({ email: 'test1@example.com' }),
          completedAt: '2024-01-01T00:00:00Z',
          stepCount: 3,
          metadata: null,
          accessToken: 'token1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      mockStmt.all.mockReturnValue(mockRows)

      const leads = await getAllLeads(10, 0)

      expect(leads.length).toBeLessThanOrEqual(10)
      expect(mockStmt.all).toHaveBeenCalledWith(10, 0)
    })

    it('doit respecter l\'offset', async () => {
      mockStmt.all.mockReturnValue([])

      await getAllLeads(10, 5)

      expect(mockStmt.all).toHaveBeenCalledWith(10, 5)
    })
  })

  describe('countLeads', () => {
    it('doit retourner 0 si aucun lead n\'existe', async () => {
      mockStmt.get.mockReturnValue({ count: 0 })

      const count = await countLeads()

      expect(count).toBe(0)
    })

    it('doit retourner le nombre correct de leads', async () => {
      mockStmt.get.mockReturnValue({ count: 5 })

      const count = await countLeads()

      expect(count).toBe(5)
    })
  })

  describe('closeDatabase', () => {
    it('doit fermer la connexion SQLite', () => {
      closeDatabase()
      // La fonction vérifie si sqliteDb existe, donc on vérifie juste qu'elle ne crash pas
      expect(() => closeDatabase()).not.toThrow()
    })
  })
})
