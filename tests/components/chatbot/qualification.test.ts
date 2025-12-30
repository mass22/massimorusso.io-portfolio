import { describe, it, expect } from 'vitest'
import {
  qualifyLead,
  formatReasons,
  formatQualificationMessage,
  type QualificationResult
} from '~/app/components/chatbot/qualification.ts'
import type { LeadContext } from '~/app/components/chatbot/chatConfig'

describe('qualification', () => {
  describe('qualifyLead', () => {
      it('doit attribuer +2 points pour architecture-frontend', () => {
        const context: LeadContext = {
          service: 'architecture-frontend'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('service_architecture_frontend')
      })

      it('doit attribuer +2 points pour vue-nuxt comme service', () => {
        const context: LeadContext = {
          service: 'vue-nuxt'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('service_vue_nuxt')
      })

      it('doit mapper ia-pragmatique à ai-orchestration et attribuer +2 points', () => {
        const context: LeadContext = {
          service: 'ia-pragmatique'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('service_ai_orchestration')
      })

      it('doit utiliser stack vue-nuxt comme service si service est absent', () => {
        const context: LeadContext = {
          stack: 'vue-nuxt'
        }
        const result = qualifyLead(context)

        // vue-nuxt compte comme service (+2) ET comme stack (+1) = 3 points
        expect(result.score).toBe(3)
        expect(result.reasons).toContain('service_vue_nuxt')
        expect(result.reasons).toContain('stack_vue_nuxt')
      })

      it('ne doit pas attribuer de points pour un service non éligible', () => {
        const context: LeadContext = {
          service: 'autre'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('service_architecture_frontend')
      })
    })

    describe('Scoring - Goal', () => {
      it('doit attribuer +1 point pour chaque goal', () => {
        const goals = ['moderniser', 'performances', 'reduire-couts', 'accelerer', 'autre-objectif']

        goals.forEach((goal) => {
          const context: LeadContext = { goal }
          const result = qualifyLead(context)

          expect(result.score).toBe(1)
          expect(result.reasons.length).toBeGreaterThan(0)
        })
      })

      it('doit mapper correctement les codes de raison pour chaque goal', () => {
        const goalMap: Record<string, string> = {
          'moderniser': 'goal_modernize',
          'performances': 'goal_performance',
          'reduire-couts': 'goal_reduce_costs',
          'accelerer': 'goal_accelerate',
          'autre-objectif': 'goal_other'
        }

        Object.entries(goalMap).forEach(([goal, expectedCode]) => {
          const context: LeadContext = { goal }
          const result = qualifyLead(context)

          expect(result.reasons).toContain(expectedCode)
        })
      })

      it('doit créer un code personnalisé pour un goal inconnu', () => {
        const context: LeadContext = {
          goal: 'goal-inconnu'
        }
        const result = qualifyLead(context)

        expect(result.reasons).toContain('goal_goal-inconnu')
      })
    })

    describe('Scoring - TeamSize', () => {
      it('ne doit pas attribuer de points pour équipe solo (1-3)', () => {
        const context: LeadContext = {
          teamSize: '1-3'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('team_4_10')
      })

      it('doit attribuer +2 points pour équipe 4-10', () => {
        const context: LeadContext = {
          teamSize: '4-10'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('team_4_10')
      })

      it('doit attribuer +2 points pour équipe 11-25', () => {
        const context: LeadContext = {
          teamSize: '11-25'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('team_10_plus')
      })

      it('doit attribuer +2 points pour équipe 25+', () => {
        const context: LeadContext = {
          teamSize: '25+'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(2)
        expect(result.reasons).toContain('team_10_plus')
      })
    })

    describe('Scoring - Urgency', () => {
      it('doit attribuer +1 point pour urgence immédiate', () => {
        const context: LeadContext = {
          urgency: 'immediat'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
        expect(result.reasons).toContain('urgency_urgent')
      })

      it('doit attribuer +1 point pour urgence 1-2 mois', () => {
        const context: LeadContext = {
          urgency: '1-2-mois'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
        expect(result.reasons).toContain('urgency_1_month')
      })

      it('doit attribuer +1 point pour urgence 3-6 mois', () => {
        const context: LeadContext = {
          urgency: '3-6-mois'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
        expect(result.reasons).toContain('urgency_3_months')
      })

      it('ne doit pas attribuer de points pour urgence 6+ mois', () => {
        const context: LeadContext = {
          urgency: '6-mois-plus'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('urgency_urgent')
      })
    })

    describe('Scoring - Stack', () => {
      it('doit attribuer +1 point pour stack vue-nuxt', () => {
        const context: LeadContext = {
          stack: 'vue-nuxt'
        }
        const result = qualifyLead(context)

        // vue-nuxt compte comme service (+2) ET comme stack (+1) = 3 points
        expect(result.score).toBe(3)
        expect(result.reasons).toContain('stack_vue_nuxt')
        expect(result.reasons).toContain('service_vue_nuxt')
      })

      it('doit attribuer +1 point pour stack contenant "vue"', () => {
        const context: LeadContext = {
          stack: 'vue.js'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
        expect(result.reasons).toContain('stack_vue_nuxt')
      })

      it('doit attribuer +1 point pour stack contenant "nuxt"', () => {
        const context: LeadContext = {
          stack: 'nuxt3'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
        expect(result.reasons).toContain('stack_vue_nuxt')
      })

      it('ne doit pas attribuer de points pour stack React', () => {
        const context: LeadContext = {
          stack: 'react-next'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('stack_vue_nuxt')
      })

      it('ne doit pas attribuer de points pour stack Angular', () => {
        const context: LeadContext = {
          stack: 'angular'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('stack_vue_nuxt')
      })
    })

    describe('Scoring combiné', () => {
      it('doit calculer le score total correctement', () => {
        const context: LeadContext = {
          service: 'architecture-frontend', // +2
          goal: 'performances', // +1
          teamSize: '4-10', // +2
          urgency: 'immediat', // +1
          stack: 'vue-nuxt' // +1
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(7)
        expect(result.reasons.length).toBe(5)
      })

      it('doit calculer un score minimal correctement', () => {
        const context: LeadContext = {
          goal: 'autre-objectif' // +1 seulement
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(1)
      })
    })

    describe('Niveau de qualification', () => {
      it('doit retourner "high" pour score >= 6', () => {
        const context: LeadContext = {
          service: 'architecture-frontend', // +2
          goal: 'performances', // +1
          teamSize: '4-10', // +2
          urgency: 'immediat' // +1
          // Total: 6
        }
        const result = qualifyLead(context)

        expect(result.level).toBe('high')
      })

      it('doit retourner "medium" pour score >= 4 et < 6', () => {
        const context: LeadContext = {
          service: 'architecture-frontend', // +2
          goal: 'performances', // +1
          teamSize: '4-10' // +2
          // Total: 5
        }
        const result = qualifyLead(context)

        expect(result.level).toBe('medium')
      })

      it('doit retourner "low" pour score < 4', () => {
        const context: LeadContext = {
          goal: 'performances' // +1 seulement
        }
        const result = qualifyLead(context)

        expect(result.level).toBe('low')
      })

      it('doit retourner "low" pour contexte vide', () => {
        const context: LeadContext = {}
        const result = qualifyLead(context)

        expect(result.level).toBe('low')
        expect(result.score).toBe(0)
      })
    })

    describe('Offre recommandée', () => {
      it('doit recommander "audit" pour goal performances', () => {
        const context: LeadContext = {
          goal: 'performances'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('audit')
      })

      it('doit recommander "audit" pour urgence immédiate', () => {
        const context: LeadContext = {
          urgency: 'immediat'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('audit')
      })

      it('doit recommander "audit" pour urgence 1-2 mois', () => {
        const context: LeadContext = {
          urgency: '1-2-mois'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('audit')
      })

      it('doit recommander "coaching" pour équipe solo sans urgence', () => {
        const context: LeadContext = {
          teamSize: '1-3',
          urgency: '3-6-mois'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('coaching')
      })

      it('ne doit pas recommander "coaching" pour équipe solo avec urgence', () => {
        const context: LeadContext = {
          teamSize: '1-3',
          urgency: 'immediat'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).not.toBe('coaching')
      })

      it('doit recommander "mission" pour équipe 11-25', () => {
        const context: LeadContext = {
          teamSize: '11-25'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('mission')
      })

      it('doit recommander "mission" pour équipe 25+', () => {
        const context: LeadContext = {
          teamSize: '25+'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('mission')
      })

      it('doit recommander "mission" pour IA pragmatique avec urgence 3-6 mois', () => {
        const context: LeadContext = {
          service: 'ia-pragmatique',
          urgency: '3-6-mois'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('mission')
      })

      it('doit recommander "audit" pour IA pragmatique avec urgence immédiate (priorité audit)', () => {
        const context: LeadContext = {
          service: 'ia-pragmatique',
          urgency: 'immediat'
        }
        const result = qualifyLead(context)

        // L'urgence immédiate déclenche 'audit' en priorité
        expect(result.recommendedOffer).toBe('audit')
      })

      it('doit recommander "unknown" par défaut', () => {
        const context: LeadContext = {
          goal: 'autre-objectif',
          urgency: '6-mois-plus'
        }
        const result = qualifyLead(context)

        expect(result.recommendedOffer).toBe('unknown')
      })
    })

    describe('Cas limites', () => {
      it('doit gérer un contexte complètement vide', () => {
        const context: LeadContext = {}
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.level).toBe('low')
        expect(result.reasons).toEqual([])
        expect(result.recommendedOffer).toBe('unknown')
      })

      it('doit gérer un contexte avec toutes les valeurs', () => {
        const context: LeadContext = {
          service: 'architecture-frontend',
          goal: 'performances',
          stack: 'vue-nuxt',
          teamSize: '4-10',
          urgency: 'immediat'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(7)
        expect(result.level).toBe('high')
        expect(result.reasons.length).toBe(5)
      })

      it('doit gérer un service inconnu', () => {
        const context: LeadContext = {
          service: 'service-inconnu'
        }
        const result = qualifyLead(context)

        expect(result.score).toBe(0)
        expect(result.reasons).not.toContain('service_architecture_frontend')
      })
    })
  })

  describe('formatReasons', () => {
    it('doit formater les raisons en français', () => {
      const reasonCodes = [
        'service_architecture_frontend',
        'goal_performance',
        'team_4_10'
      ]
      const result = formatReasons('fr', reasonCodes)

      expect(result).toEqual([
        'Architecture Frontend',
        'Performance',
        'Équipe 4-10 développeurs'
      ])
    })

    it('doit formater les raisons en anglais', () => {
      const reasonCodes = [
        'service_architecture_frontend',
        'goal_performance',
        'team_4_10'
      ]
      const result = formatReasons('en', reasonCodes)

      expect(result).toEqual([
        'Frontend Architecture',
        'Performance',
        'Team of 4-10 developers'
      ])
    })

    it('doit retourner le code original si la traduction est absente', () => {
      const reasonCodes = ['code_inconnu']
      const result = formatReasons('fr', reasonCodes)

      expect(result).toEqual(['code_inconnu'])
    })

    it('doit gérer un tableau vide', () => {
      const result = formatReasons('fr', [])

      expect(result).toEqual([])
    })

    it('doit formater tous les codes de service', () => {
      const codes = [
        'service_architecture_frontend',
        'service_vue_nuxt',
        'service_ai_orchestration'
      ]

      const frResult = formatReasons('fr', codes)
      expect(frResult).toContain('Architecture Frontend')
      expect(frResult).toContain('Vue/Nuxt')
      expect(frResult).toContain('IA Pragmatique')

      const enResult = formatReasons('en', codes)
      expect(enResult).toContain('Frontend Architecture')
      expect(enResult).toContain('Vue/Nuxt')
      expect(enResult).toContain('Pragmatic AI')
    })

    it('doit formater tous les codes de goal', () => {
      const codes = [
        'goal_modernize',
        'goal_performance',
        'goal_reduce_costs',
        'goal_accelerate',
        'goal_other'
      ]

      const frResult = formatReasons('fr', codes)
      expect(frResult).toContain('Modernisation')
      expect(frResult).toContain('Performance')
      expect(frResult).toContain('Réduction des coûts')
      expect(frResult).toContain('Accélération')
      expect(frResult).toContain('Autre objectif')
    })

    it('doit formater tous les codes d\'urgence', () => {
      const codes = [
        'urgency_urgent',
        'urgency_1_month',
        'urgency_3_months'
      ]

      const frResult = formatReasons('fr', codes)
      expect(frResult).toContain('Urgence immédiate')
      expect(frResult).toContain('Urgence 1-2 mois')
      expect(frResult).toContain('Urgence 3-6 mois')
    })
  })

  describe('formatQualificationMessage', () => {
    describe('Niveau high', () => {
      it('doit formater un message high en français sans raisons', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: [],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('D\'après ce que tu m\'as indiqué, je peux t\'aider.')
        expect(message).toContain('Laisse ton email et je te réponds avec une première piste concrète.')
      })

      it('doit formater un message high en français avec raisons', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: ['service_architecture_frontend', 'goal_performance'],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('Architecture Frontend')
        expect(message).toContain('Performance')
        expect(message).toContain('je peux t\'aider')
      })

      it('doit formater un message high en anglais sans raisons', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: [],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('en', context, result)

        expect(message).toContain('Based on what you\'ve told me, I can help you.')
        expect(message).toContain('Leave your email and I\'ll reply with a concrete first step.')
      })

      it('doit formater un message high en anglais avec raisons', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: ['service_architecture_frontend', 'goal_performance'],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('en', context, result)

        expect(message).toContain('Frontend Architecture')
        expect(message).toContain('Performance')
        expect(message).toContain('I can help you')
      })

      it('ne doit utiliser que les 2 premières raisons', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: [
            'service_architecture_frontend',
            'goal_performance',
            'team_4_10',
            'urgency_urgent'
          ],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        // Ne doit contenir que les 2 premières raisons
        expect(message).toContain('Architecture Frontend')
        expect(message).toContain('Performance')
        expect(message).not.toContain('Équipe 4-10')
      })
    })

    describe('Niveau medium', () => {
      it('doit formater un message medium en français sans raisons', () => {
        const result: QualificationResult = {
          score: 4,
          level: 'medium',
          reasons: [],
          recommendedOffer: 'coaching'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('Je peux peut-être t\'aider.')
        expect(message).toContain('Laisse ton email et je te dis rapidement si ça vaut un échange.')
      })

      it('doit formater un message medium en français avec raisons', () => {
        const result: QualificationResult = {
          score: 4,
          level: 'medium',
          reasons: ['goal_modernize', 'stack_vue_nuxt'],
          recommendedOffer: 'coaching'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('Je peux peut-être t\'aider.')
        expect(message).toContain('Modernisation')
      })

      it('doit formater un message medium en anglais', () => {
        const result: QualificationResult = {
          score: 4,
          level: 'medium',
          reasons: ['goal_modernize'],
          recommendedOffer: 'coaching'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('en', context, result)

        expect(message).toContain('I might be able to help you.')
        expect(message).toContain('Modernization')
      })
    })

    describe('Niveau low', () => {
      it('doit formater un message low en français sans raisons', () => {
        const result: QualificationResult = {
          score: 1,
          level: 'low',
          reasons: [],
          recommendedOffer: 'unknown'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('Je ne suis probablement pas la meilleure personne pour ton cas.')
        expect(message).toContain('Si tu veux, laisse ton email et je te redirige vers la meilleure option.')
      })

      it('doit formater un message low en français avec raisons', () => {
        const result: QualificationResult = {
          score: 1,
          level: 'low',
          reasons: ['goal_other'],
          recommendedOffer: 'unknown'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)

        expect(message).toContain('Je ne suis probablement pas la meilleure personne pour ton cas.')
        expect(message).toContain('Autre objectif')
      })

      it('doit formater un message low en anglais', () => {
        const result: QualificationResult = {
          score: 1,
          level: 'low',
          reasons: ['goal_other'],
          recommendedOffer: 'unknown'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('en', context, result)

        expect(message).toContain('I\'m probably not the best person for your case.')
        expect(message).toContain('Other objective')
      })
    })

    describe('Format du message', () => {
      it('doit séparer rationale et CTA par deux sauts de ligne', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: [],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {}

        const message = formatQualificationMessage('fr', context, result)
        const parts = message.split('\n\n')

        expect(parts.length).toBe(2)
        expect(parts[0]).toContain('je peux t\'aider')
        expect(parts[1]).toContain('Laisse ton email')
      })

      it('doit fonctionner avec un contexte non utilisé', () => {
        const result: QualificationResult = {
          score: 6,
          level: 'high',
          reasons: ['service_architecture_frontend'],
          recommendedOffer: 'audit'
        }
        const context: LeadContext = {
          service: 'architecture-frontend',
          goal: 'performances'
        }

        // Le contexte est passé mais n'est pas utilisé dans la fonction
        const message = formatQualificationMessage('fr', context, result)

        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })
  })

  describe('Intégration complète', () => {
    it('doit qualifier et formater un lead complet en français', () => {
      const context: LeadContext = {
        service: 'architecture-frontend',
        goal: 'performances',
        stack: 'vue-nuxt',
        teamSize: '4-10',
        urgency: 'immediat'
      }

      const qualification = qualifyLead(context)
      const message = formatQualificationMessage('fr', context, qualification)

      expect(qualification.score).toBe(7)
      expect(qualification.level).toBe('high')
      expect(qualification.recommendedOffer).toBe('audit')
      expect(message).toContain('je peux t\'aider')
      expect(message).toContain('Laisse ton email')
    })

    it('doit qualifier et formater un lead complet en anglais', () => {
      const context: LeadContext = {
        service: 'ia-pragmatique', // +2 (ai-orchestration)
        goal: 'moderniser', // +1
        stack: 'vue-nuxt', // +1
        teamSize: '11-25', // +2
        urgency: '3-6-mois' // +1
        // Total: 7 points
      }

      const qualification = qualifyLead(context)
      const message = formatQualificationMessage('en', context, qualification)

      expect(qualification.score).toBe(7)
      expect(qualification.level).toBe('high')
      expect(qualification.recommendedOffer).toBe('mission')
      expect(message).toContain('I can help you')
      expect(message).toContain('Leave your email')
    })

    it('doit gérer un lead avec score faible', () => {
      const context: LeadContext = {
        goal: 'autre-objectif',
        urgency: '6-mois-plus'
      }

      const qualification = qualifyLead(context)
      const message = formatQualificationMessage('fr', context, qualification)

      expect(qualification.score).toBe(1)
      expect(qualification.level).toBe('low')
      expect(qualification.recommendedOffer).toBe('unknown')
      expect(message).toContain('pas la meilleure personne')
    })
  })
})
