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

/** Libellés alignés sur `getAuditChatConfig` (résumé fidèle, pas de faux « service »). */
const AUDIT_SITUATION_SUMMARY: Record<'en' | 'fr', Record<string, string>> = {
  fr: {
    architecture_floue: 'Personne ne comprend vraiment l\'architecture',
    dette_technique: 'La dette technique freine tout',
    scaling: 'On scale et ça commence à craquer',
    regard_externe: 'On veut un regard externe avant de continuer'
  },
  en: {
    architecture_floue: 'Nobody really understands the architecture',
    dette_technique: 'Technical debt is slowing everything down',
    scaling: 'We\'re scaling and things are breaking',
    regard_externe: 'We want an outside perspective before moving forward'
  }
}

const AUDIT_TEAM_SUMMARY: Record<'en' | 'fr', Record<string, string>> = {
  fr: {
    '1-3': '1 à 3 développeurs',
    '4-10': '4 à 10 développeurs',
    '10+': 'Plus de 10 développeurs'
  },
  en: {
    '1-3': '1 to 3 developers',
    '4-10': '4 to 10 developers',
    '10+': 'More than 10 developers'
  }
}

/**
 * Données de traduction pour les questions et options
 */
const translations = {
  en: {
    contextLabels: {
      service: {
        'developpement-vuejs': 'Vue.js / Nuxt Development',
        'architecture-frontend': 'Frontend Architecture',
        'aide-decision-technique': 'Technical Decision Support',
        'ia-pragmatique': 'Pragmatic AI Usage',
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
    },
    questions: {
      service: {
        prompt: 'Which service interests you?',
        options: {
          'developpement-vuejs': 'Vue.js / Nuxt Development',
          'architecture-frontend': 'Frontend Architecture',
          'aide-decision-technique': 'Technical Decision Support',
          'ia-pragmatique': 'Pragmatic AI Usage',
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
    }
  },
  fr: {
    contextLabels: {
      service: {
        'developpement-vuejs': 'Développement Vue.js / Nuxt',
        'architecture-frontend': 'Architecture frontend',
        'aide-decision-technique': 'Conseil & aide à la décision',
        'ia-pragmatique': 'Usage pragmatique de l\'IA',
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
    },
    questions: {
      service: {
        prompt: 'Quel service vous intéresse ?',
        options: {
          'developpement-vuejs': 'Développement Vue.js / Nuxt',
          'architecture-frontend': 'Architecture frontend',
          'aide-decision-technique': 'Conseil & aide à la décision',
          'ia-pragmatique': 'Usage pragmatique de l\'IA',
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
      { nextQuestionId: 'goal', value: 'developpement-vuejs' },
      { nextQuestionId: 'goal', value: 'architecture-frontend' },
      { nextQuestionId: 'goal', value: 'aide-decision-technique' },
      { nextQuestionId: 'goal', value: 'ia-pragmatique' },
      { nextQuestionId: 'goal', value: 'autre' }
    ]
  },
  {
    id: 'goal',
    options: [
      { nextQuestionId: 'stack', value: 'moderniser' },
      { nextQuestionId: 'stack', value: 'performances' },
      { nextQuestionId: 'stack', value: 'reduire-couts' },
      { nextQuestionId: 'stack', value: 'accelerer' },
      { nextQuestionId: 'stack', value: 'autre-objectif' }
    ]
  },
  {
    id: 'stack',
    options: [
      { nextQuestionId: 'teamSize', value: 'vue-nuxt' },
      { nextQuestionId: 'teamSize', value: 'react-next' },
      { nextQuestionId: 'teamSize', value: 'angular' },
      { nextQuestionId: 'teamSize', value: 'autre-framework' },
      { nextQuestionId: 'teamSize', value: 'pas-de-stack' }
    ]
  },
  {
    id: 'teamSize',
    options: [
      { nextQuestionId: 'urgency', value: '1-3' },
      { nextQuestionId: 'urgency', value: '4-10' },
      { nextQuestionId: 'urgency', value: '11-25' },
      { nextQuestionId: 'urgency', value: '25+' }
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
      }),
      text: questionTranslations.prompt
    }
  })

  return {
    questions,
    startQuestionId: 'service'
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
  const loc: 'en' | 'fr' = locale === 'fr' ? 'fr' : 'en'

  if (context.audit_situation || context.audit_team || context.audit_urgency) {
    const parts: string[] = []
    const t = translations[locale].contextLabels

    if (context.audit_situation) {
      const label = AUDIT_SITUATION_SUMMARY[loc][context.audit_situation] || context.audit_situation
      parts.push(loc === 'fr' ? `Situation : ${label}` : `Situation: ${label}`)
    }
    if (context.audit_team) {
      const label = AUDIT_TEAM_SUMMARY[loc][context.audit_team] || context.audit_team
      parts.push(loc === 'fr' ? `Équipe frontend : ${label}` : `Frontend team: ${label}`)
    }
    if (context.audit_urgency) {
      const urgencyLabel = t.urgency[context.audit_urgency as keyof typeof t.urgency] || context.audit_urgency
      parts.push(loc === 'fr' ? `Livraison souhaitée : ${urgencyLabel}` : `Desired delivery: ${urgencyLabel}`)
    }

    return parts.join('\n')
  }

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

export function getAuditChatConfig(locale: 'fr' | 'en'): ChatConfig {
  const questions: ChatQuestion[] = [
    {
      id: 'audit_situation',
      text: locale === 'fr'
        ? 'Quelle est la situation de votre équipe frontend en ce moment ?'
        : 'What\'s the current situation with your frontend team?',
      options: [
        {
          label: locale === 'fr'
            ? 'Personne ne comprend vraiment l\'architecture'
            : 'Nobody really understands the architecture',
          value: 'architecture_floue',
          nextQuestionId: 'audit_team'
        },
        {
          label: locale === 'fr'
            ? 'La dette technique freine tout'
            : 'Technical debt is slowing everything down',
          value: 'dette_technique',
          nextQuestionId: 'audit_team'
        },
        {
          label: locale === 'fr'
            ? 'On scale et ça commence à craquer'
            : 'We\'re scaling and things are breaking',
          value: 'scaling',
          nextQuestionId: 'audit_team'
        },
        {
          label: locale === 'fr'
            ? 'On veut un regard externe avant de continuer'
            : 'We want an outside perspective before moving forward',
          value: 'regard_externe',
          nextQuestionId: 'audit_team'
        }
      ]
    },
    {
      id: 'audit_team',
      text: locale === 'fr'
        ? 'Combien de devs frontend dans votre équipe ?'
        : 'How many frontend developers on your team?',
      options: [
        {
          label: locale === 'fr' ? '1 à 3 développeurs' : '1 to 3 developers',
          value: '1-3',
          nextQuestionId: 'audit_urgency'
        },
        {
          label: locale === 'fr' ? '4 à 10 développeurs' : '4 to 10 developers',
          value: '4-10',
          nextQuestionId: 'audit_urgency'
        },
        {
          label: locale === 'fr' ? 'Plus de 10 développeurs' : 'More than 10 developers',
          value: '10+',
          nextQuestionId: 'audit_urgency'
        }
      ]
    },
    {
      id: 'audit_urgency',
      text: locale === 'fr'
        ? 'Quand souhaitez-vous recevoir votre rapport ?'
        : 'When would you like to receive your report?',
      options: [
        {
          label: locale === 'fr' ? 'Le plus tôt possible' : 'As soon as possible',
          value: 'immediat'
        },
        {
          label: locale === 'fr' ? 'Dans 1 à 2 mois' : 'In 1 to 2 months',
          value: '1-2-mois'
        },
        {
          label: locale === 'fr' ? 'Dans 3 à 6 mois' : 'In 3 to 6 months',
          value: '3-6-mois'
        }
      ]
    }
  ]

  return {
    questions,
    startQuestionId: 'audit_situation'
  }
}
