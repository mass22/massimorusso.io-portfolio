import { describe, it, expect } from 'vitest'
import type { LeadContext } from '~/types/content'
import { leadSummary, leadSummaryHtml } from '~/server/utils/leadSummary'

describe('leadSummary', () => {
  it('devrait formater un contexte minimal en texte', () => {
    const context: LeadContext = {
      answers: {},
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 3
    }

    const result = leadSummary(context)

    expect(result).toContain('RÉSUMÉ DU LEAD')
    expect(result).toContain('Date de complétion:')
    expect(result).toContain('Nombre d\'étapes complétées: 3')
    expect(result).toContain('Aucune réponse enregistrée')
    expect(result).toContain('='.repeat(60))
  })

  it('devrait formater les réponses du formulaire', () => {
    const context: LeadContext = {
      answers: {
        service: 'architecture-frontend',
        goal: 'performances',
        team_size: '4-10'
      },
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 5
    }

    const result = leadSummary(context)

    expect(result).toContain('Service: architecture-frontend')
    expect(result).toContain('Goal: performances')
    expect(result).toContain('Team Size: 4-10')
    expect(result).toContain('Nombre d\'étapes complétées: 5')
  })

  it('devrait gérer les valeurs booléennes', () => {
    const context: LeadContext = {
      answers: {
        has_budget: true,
        urgent: false
      },
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 2
    }

    const result = leadSummary(context)

    expect(result).toContain('Has Budget: Oui')
    expect(result).toContain('Urgent: Non')
  })

  it('devrait gérer les tableaux', () => {
    const context: LeadContext = {
      answers: {
        interests: ['vue', 'nuxt', 'performance']
      },
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 1
    }

    const result = leadSummary(context)

    expect(result).toContain('Interests: vue, nuxt, performance')
  })

  it('devrait afficher "Non renseigné" pour les tableaux vides', () => {
    const context: LeadContext = {
      answers: {
        empty_array: []
      },
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 1
    }

    const result = leadSummary(context)

    expect(result).toContain('Aucune sélection')
  })

  it('devrait formater les métadonnées (referrer, userAgent, timestamp)', () => {
    const context: LeadContext = {
      answers: {},
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 1,
      metadata: {
        timestamp: '2024-01-15T10:30:00.000Z',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0'
      }
    }

    const result = leadSummary(context)

    expect(result).toContain('Référent: https://google.com')
    expect(result).toContain('Timestamp:')
    expect(result).toContain('Navigateur/Système:')
  })

  it('devrait gérer une date invalide', () => {
    const context: LeadContext = {
      answers: {},
      completedAt: 'invalid-date',
      stepCount: 0
    }

    const result = leadSummary(context)

    expect(result).toContain('Date invalide')
  })
})

describe('leadSummaryHtml', () => {
  it('devrait générer du HTML valide', () => {
    const context: LeadContext = {
      answers: {
        service: 'vue-nuxt',
        goal: 'moderniser'
      },
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 4
    }

    const result = leadSummaryHtml(context)

    expect(result).toContain('<div class="lead-summary">')
    expect(result).toContain('<h2>Résumé du Lead</h2>')
    expect(result).toContain('<strong>Service:</strong> vue-nuxt')
    expect(result).toContain('<strong>Goal:</strong> moderniser')
    expect(result).toContain('<strong>Nombre d\'étapes complétées:</strong> 4')
  })

  it('devrait inclure les sections même sans réponses', () => {
    const context: LeadContext = {
      answers: {},
      completedAt: '2024-01-15T10:30:00.000Z',
      stepCount: 0
    }

    const result = leadSummaryHtml(context)

    expect(result).toContain('Informations générales')
    expect(result).toContain('<ul>')
    expect(result).toContain('</div>')
  })
})
