import type { Locale } from './i18n'

export interface ChatQuestion {
  id: string
  text: string
  options: {
    label: string
    value: string
    nextQuestionId?: string
  }[]
}

export interface ChatConfig {
  questions: ChatQuestion[]
  startQuestionId: string
}

export interface LeadContext {
  service?: string
  goal?: string
  stack?: string
  teamSize?: string
  urgency?: string
  [key: string]: string | undefined
}

/**
 * Données de traduction pour les questions et options
 */
const translations = {
  fr: {
    questions: {
      service: {
        prompt: 'Quel service vous intéresse ?',
        options: {
          'architecture-frontend': 'Architecture Frontend',
          'aide-decision-technique': 'Aide à la décision technique',
          'ia-pragmatique': 'IA Pragmatique',
          'autre': 'Autre'
        }
      },
      goal: {
        prompt: 'Quel est votre objectif principal ?',
        options: {
          'moderniser': 'Moderniser notre stack',
          'performances': 'Améliorer les performances',
          'reduire-couts': 'Réduire les coûts',
          'accelerer': 'Accélérer le développement',
          'autre-objectif': 'Autre'
        }
      },
      stack: {
        prompt: 'Quelle est votre stack technique actuelle ?',
        options: {
          'vue-nuxt': 'Vue.js / Nuxt',
          'react-next': 'React / Next.js',
          'angular': 'Angular',
          'autre-framework': 'Autre framework',
          'pas-de-stack': 'Pas encore de stack définie'
        }
      },
      teamSize: {
        prompt: 'Quelle est la taille de votre équipe frontend ?',
        options: {
          '1-3': '1-3 développeurs',
          '4-10': '4-10 développeurs',
          '11-25': '11-25 développeurs',
          '25+': 'Plus de 25 développeurs'
        }
      },
      urgency: {
        prompt: 'Quand souhaitez-vous commencer ?',
        options: {
          'immediat': 'Immédiatement',
          '1-2-mois': 'Dans 1-2 mois',
          '3-6-mois': 'Dans 3-6 mois',
          '6-mois-plus': 'Plus de 6 mois'
        }
      }
    },
    contextLabels: {
      service: {
        'architecture-frontend': 'Architecture Frontend',
        'aide-decision-technique': 'Aide à la décision technique',
        'ia-pragmatique': 'IA Pragmatique',
        'autre': 'Autre service'
      },
      goal: {
        'moderniser': 'Moderniser la stack',
        'performances': 'Améliorer les performances',
        'reduire-couts': 'Réduire les coûts',
        'accelerer': 'Accélérer le développement',
        'autre-objectif': 'Autre objectif'
      },
      stack: {
        'vue-nuxt': 'Vue.js / Nuxt',
        'react-next': 'React / Next.js',
        'angular': 'Angular',
        'autre-framework': 'Autre framework',
        'pas-de-stack': 'Pas encore de stack définie'
      },
      teamSize: 'Équipe : {value} développeurs',
      urgency: {
        'immediat': 'Immédiatement',
        '1-2-mois': 'Dans 1-2 mois',
        '3-6-mois': 'Dans 3-6 mois',
        '6-mois-plus': 'Plus de 6 mois'
      }
    }
  },
  en: {
    questions: {
      service: {
        prompt: 'Which service interests you?',
        options: {
          'architecture-frontend': 'Frontend Architecture',
          'aide-decision-technique': 'Technical Decision Support',
          'ia-pragmatique': 'Pragmatic AI',
          'autre': 'Other'
        }
      },
      goal: {
        prompt: 'What is your main objective?',
        options: {
          'moderniser': 'Modernize our stack',
          'performances': 'Improve performance',
          'reduire-couts': 'Reduce costs',
          'accelerer': 'Accelerate development',
          'autre-objectif': 'Other'
        }
      },
      stack: {
        prompt: 'What is your current technical stack?',
        options: {
          'vue-nuxt': 'Vue.js / Nuxt',
          'react-next': 'React / Next.js',
          'angular': 'Angular',
          'autre-framework': 'Other framework',
          'pas-de-stack': 'No stack defined yet'
        }
      },
      teamSize: {
        prompt: 'What is the size of your frontend team?',
        options: {
          '1-3': '1-3 developers',
          '4-10': '4-10 developers',
          '11-25': '11-25 developers',
          '25+': 'More than 25 developers'
        }
      },
      urgency: {
        prompt: 'When would you like to start?',
        options: {
          'immediat': 'Immediately',
          '1-2-mois': 'In 1-2 months',
          '3-6-mois': 'In 3-6 months',
          '6-mois-plus': 'More than 6 months'
        }
      }
    },
    contextLabels: {
      service: {
        'architecture-frontend': 'Frontend Architecture',
        'aide-decision-technique': 'Technical Decision Support',
        'ia-pragmatique': 'Pragmatic AI',
        'autre': 'Other service'
      },
      goal: {
        'moderniser': 'Modernize the stack',
        'performances': 'Improve performance',
        'reduire-couts': 'Reduce costs',
        'accelerer': 'Accelerate development',
        'autre-objectif': 'Other objective'
      },
      stack: {
        'vue-nuxt': 'Vue.js / Nuxt',
        'react-next': 'React / Next.js',
        'angular': 'Angular',
        'autre-framework': 'Other framework',
        'pas-de-stack': 'No stack defined yet'
      },
      teamSize: 'Team: {value} developers',
      urgency: {
        'immediat': 'Immediately',
        '1-2-mois': 'In 1-2 months',
        '3-6-mois': 'In 3-6 months',
        '6-mois-plus': 'More than 6 months'
      }
    }
  }
} as const

/**
 * Structure de définition des questions (valeurs stables)
 * Les valeurs (value) sont invariantes et ne changent pas selon la locale
 */
const questionDefinitions = [
  {
    id: 'service',
    options: [
      { value: 'architecture-frontend', nextQuestionId: 'goal' },
      { value: 'aide-decision-technique', nextQuestionId: 'goal' },
      { value: 'ia-pragmatique', nextQuestionId: 'goal' },
      { value: 'autre', nextQuestionId: 'goal' }
    ]
  },
  {
    id: 'goal',
    options: [
      { value: 'moderniser', nextQuestionId: 'stack' },
      { value: 'performances', nextQuestionId: 'stack' },
      { value: 'reduire-couts', nextQuestionId: 'stack' },
      { value: 'accelerer', nextQuestionId: 'stack' },
      { value: 'autre-objectif', nextQuestionId: 'stack' }
    ]
  },
  {
    id: 'stack',
    options: [
      { value: 'vue-nuxt', nextQuestionId: 'teamSize' },
      { value: 'react-next', nextQuestionId: 'teamSize' },
      { value: 'angular', nextQuestionId: 'teamSize' },
      { value: 'autre-framework', nextQuestionId: 'teamSize' },
      { value: 'pas-de-stack', nextQuestionId: 'teamSize' }
    ]
  },
  {
    id: 'teamSize',
    options: [
      { value: '1-3', nextQuestionId: 'urgency' },
      { value: '4-10', nextQuestionId: 'urgency' },
      { value: '11-25', nextQuestionId: 'urgency' },
      { value: '25+', nextQuestionId: 'urgency' }
    ]
  },
  {
    id: 'urgency',
    options: [
      { value: 'immediat' },
      { value: '1-2-mois' },
      { value: '3-6-mois' },
      { value: '6-mois-plus' }
    ]
  }
] as const

/**
 * Obtient la configuration du chat localisée selon la locale fournie
 *
 * @param locale - La locale à utiliser ("fr" | "en")
 * @returns La configuration du chat avec les prompts et labels localisés
 *
 * Les valeurs internes (value) restent stables et ne changent pas selon la locale.
 * Seuls les prompts et labels sont localisés.
 */
export function getChatConfig(locale: 'fr' | 'en'): ChatConfig {
  const t = translations[locale]
  const questions: ChatQuestion[] = questionDefinitions.map((def) => {
    const questionTranslations = t.questions[def.id as keyof typeof t.questions]
    if (!questionTranslations) {
      throw new Error(`Missing translations for question: ${def.id}`)
    }

    return {
      id: def.id,
      text: questionTranslations.prompt,
      options: def.options.map((opt) => {
        const label = questionTranslations.options[opt.value as keyof typeof questionTranslations.options]
        if (!label) {
          throw new Error(`Missing translation for option ${opt.value} in question ${def.id}`)
        }

        const option: { label: string, value: string, nextQuestionId?: string } = {
          label,
          value: opt.value
        }
        if ('nextQuestionId' in opt && opt.nextQuestionId) {
          option.nextQuestionId = opt.nextQuestionId
        }
        return option
      })
    }
  })

  return {
    startQuestionId: 'service',
    questions
  }
}

/**
 * Formate le contexte en un résumé lisible selon la locale
 *
 * @param context - Le contexte du lead à formater
 * @param locale - La locale à utiliser pour le formatage (défaut: 'fr')
 * @returns Un résumé formaté du contexte
 */
export function formatContextSummary(context: LeadContext, locale: Locale = 'fr'): string {
  const t = translations[locale].contextLabels
  const parts: string[] = []

  if (context.service) {
    const label = t.service[context.service as keyof typeof t.service] || context.service
    parts.push(locale === 'fr' ? `Service : ${label}` : `Service: ${label}`)
  }

  if (context.goal) {
    const label = t.goal[context.goal as keyof typeof t.goal] || context.goal
    parts.push(locale === 'fr' ? `Objectif : ${label}` : `Objective: ${label}`)
  }

  if (context.stack) {
    const label = t.stack[context.stack as keyof typeof t.stack] || context.stack
    parts.push(locale === 'fr' ? `Stack : ${label}` : `Stack: ${label}`)
  }

  if (context.teamSize) {
    const label = t.teamSize.replace('{value}', context.teamSize)
    parts.push(label)
  }

  if (context.urgency) {
    const label = t.urgency[context.urgency as keyof typeof t.urgency] || context.urgency
    parts.push(locale === 'fr' ? `Démarrage : ${label}` : `Start: ${label}`)
  }

  return parts.join('\n')
}
