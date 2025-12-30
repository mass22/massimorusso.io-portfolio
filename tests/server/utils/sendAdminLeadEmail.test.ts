import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { LeadContext } from '~/types/content'

// Import après le mock
import { sendAdminLeadEmail } from '~/server/utils/sendAdminLeadEmail'

// Mock de $fetch (auto-import de Nuxt) AVANT l'import du module
const mockFetch = vi.fn()

// Exposer $fetch globalement pour les auto-imports Nuxt
;(globalThis as any).$fetch = mockFetch

describe('sendAdminLeadEmail', () => {
  const originalEnv = process.env
  const originalConsoleLog = console.log
  const originalConsoleError = console.error

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log et console.error pour éviter les logs dans les tests
    console.log = vi.fn()
    console.error = vi.fn()
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      ADMIN_EMAIL: 'admin@example.com',
      FROM_EMAIL: 'noreply@example.com',
      BASE_URL: 'https://example.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  const mockLeadContext: LeadContext = {
    answers: {
      service: 'architecture-frontend',
      urgency: '3-6-mois'
    },
    completedAt: '2024-01-01T00:00:00Z',
    stepCount: 5,
    metadata: {
      source: 'chatbot'
    }
  }

  const mockQualification = {
    score: 85,
    level: 'high',
    reasons: ['service_architecture_frontend', 'goal_performance'],
    recommendedOffer: 'audit'
  }

  it('devrait envoyer un email avec succès', async () => {
    mockFetch.mockResolvedValue({ id: 'email-123' })

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      name: 'Test User',
      context: mockLeadContext,
      qualification: mockQualification,
      locale: 'fr',
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json'
        }),
        body: expect.objectContaining({
          from: 'noreply@example.com',
          to: ['admin@example.com'],
          subject: expect.stringContaining('[Lead]'),
          text: expect.any(String)
        }),
        timeout: 20000
      })
    )
  })

  it('devrait retourner false si RESEND_API_KEY n\'est pas définie', async () => {
    delete process.env.RESEND_API_KEY

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('devrait retourner false si ADMIN_EMAIL n\'est pas définie', async () => {
    delete process.env.ADMIN_EMAIL

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('devrait retourner false si FROM_EMAIL n\'est pas définie', async () => {
    delete process.env.FROM_EMAIL

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('devrait gérer l\'erreur 403 (domaine non vérifié)', async () => {
    const error403 = {
      status: 403,
      statusCode: 403,
      message: 'Domain not verified',
      data: { message: 'Domain not verified' }
    }
    mockFetch.mockRejectedValue(error403)

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('devrait gérer les autres erreurs', async () => {
    const error500 = {
      status: 500,
      statusCode: 500,
      message: 'Internal server error'
    }
    mockFetch.mockRejectedValue(error500)

    const result = await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    expect(result).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('devrait nettoyer le BASE_URL s\'il contient /lead/', async () => {
    process.env.BASE_URL = 'https://example.com/lead/123'
    mockFetch.mockResolvedValue({ id: 'email-123' })

    await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = callArgs[1].body
    expect(body.text).toContain('https://example.com/lead/1?token=test-token')
    expect(body.text).not.toContain('/lead/123')
  })

  it('devrait générer le sujet correctement avec service et urgency', async () => {
    mockFetch.mockResolvedValue({ id: 'email-123' })

    await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = callArgs[1].body
    expect(body.subject).toContain('architecture-frontend')
    expect(body.subject).toContain('3-6-mois')
  })

  it('devrait inclure les informations de qualification dans le corps de l\'email', async () => {
    mockFetch.mockResolvedValue({ id: 'email-123' })

    await sendAdminLeadEmail({
      email: 'test@example.com',
      name: 'Test User',
      context: mockLeadContext,
      qualification: mockQualification,
      locale: 'fr',
      leadId: 1,
      token: 'test-token'
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = callArgs[1].body
    expect(body.text).toContain('Test User')
    expect(body.text).toContain('test@example.com')
    expect(body.text).toContain('QUALIFICATION')
    expect(body.text).toContain('élevé') // Traduction française de "high"
    expect(body.text).toContain('85')
  })

  it('devrait utiliser la locale par défaut (en) si non spécifiée', async () => {
    mockFetch.mockResolvedValue({ id: 'email-123' })

    await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = callArgs[1].body
    expect(body.text).toContain('NEW LEAD')
    expect(body.text).not.toContain('NOUVEAU LEAD')
  })

  it('devrait utiliser BASE_URL par défaut si non défini', async () => {
    delete process.env.BASE_URL
    mockFetch.mockResolvedValue({ id: 'email-123' })

    await sendAdminLeadEmail({
      email: 'test@example.com',
      context: mockLeadContext,
      leadId: 1,
      token: 'test-token'
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = callArgs[1].body
    expect(body.text).toContain('https://massimorusso.io/lead/1')
  })
})
