import type { LeadContext } from './chatConfig'
import type { Locale } from './i18n'

export type QualificationResult = {
  score: number
  level: 'high' | 'medium' | 'low'
  reasons: string[] // Codes de raison (ex: "goal_performance", "team_4_10")
  recommendedOffer: 'audit' | 'coaching' | 'mission' | 'unknown'
}

/**
 * Qualifie un lead en fonction de son contexte (agnostique de la langue)
 */
export function qualifyLead(context: LeadContext): QualificationResult {
  let score = 0
  const reasons: string[] = []

  // Règle 1: Service (+2 points)
  const highValueServices = ['architecture-frontend', 'developpement-vuejs', 'vue-nuxt', 'ai-orchestration']
  // Mapper les valeurs réelles aux valeurs attendues
  // "ia-pragmatique" -> "ai-orchestration"
  // Vérifier aussi si stack contient "vue-nuxt" comme service
  let serviceValue = context.service === 'ia-pragmatique' ? 'ai-orchestration' : context.service
  // Si stack est "vue-nuxt", considérer comme service aussi
  if (!serviceValue && context.stack === 'vue-nuxt') {
    serviceValue = 'vue-nuxt'
  }
  if (serviceValue && highValueServices.includes(serviceValue)) {
    score += 2
    // Utiliser des codes de raison
    if (serviceValue === 'architecture-frontend') {
      reasons.push('service_architecture_frontend')
    } else if (serviceValue === 'developpement-vuejs' || serviceValue === 'vue-nuxt') {
      reasons.push('service_vue_nuxt')
    } else if (serviceValue === 'ai-orchestration') {
      reasons.push('service_ai_orchestration')
    }
  }

  // Règle 2: Goal (+1 point)
  if (context.goal) {
    score += 1
    // Mapper les valeurs aux codes de raison
    const goalCodeMap: Record<string, string> = {
      'accelerer': 'goal_accelerate',
      'autre-objectif': 'goal_other',
      'moderniser': 'goal_modernize',
      'performances': 'goal_performance',
      'reduire-couts': 'goal_reduce_costs'
    }
    const goalCode = goalCodeMap[context.goal] || `goal_${context.goal}`
    reasons.push(goalCode)
  }

  // Règle 3: TeamSize (+2 points pour équipes non-solo: "4-10" ou "10+")
  const teamSizeValue = context.teamSize
  // Mapper "11-25" et "25+" à "10+" pour la logique
  const isNonSolo = teamSizeValue && teamSizeValue !== '1-3'
  if (isNonSolo) {
    score += 2
    if (teamSizeValue === '4-10') {
      reasons.push('team_4_10')
    } else if (teamSizeValue === '11-25' || teamSizeValue === '25+') {
      reasons.push('team_10_plus')
    } else {
      reasons.push(`team_${teamSizeValue}`)
    }
  }

  // Règle 4: Urgency (+1 point pour urgences)
  const urgencyValue = context.urgency
  // Mapper les valeurs réelles aux valeurs attendues
  const mappedUrgency = urgencyValue === 'immediat'
    ? 'urgent'
    : urgencyValue === '1-2-mois'
      ? '1_month'
      : urgencyValue === '3-6-mois' ? '3_months' : urgencyValue

  if (urgencyValue && (mappedUrgency === 'urgent' || mappedUrgency === '1_month' || mappedUrgency === '3_months')) {
    score += 1
    // Utiliser des codes de raison
    if (mappedUrgency === 'urgent') {
      reasons.push('urgency_urgent')
    } else if (mappedUrgency === '1_month') {
      reasons.push('urgency_1_month')
    } else if (mappedUrgency === '3_months') {
      reasons.push('urgency_3_months')
    }
  }

  // Règle 5: Stack (+1 point si Vue/Nuxt)
  if (context.stack) {
    const stackLower = context.stack.toLowerCase()
    if (stackLower.includes('vue') || stackLower.includes('nuxt') || context.stack === 'vue-nuxt') {
      score += 1
      reasons.push('stack_vue_nuxt')
    }
  }

  // Calculer le niveau
  let level: 'high' | 'medium' | 'low'
  if (score >= 6) {
    level = 'high'
  } else if (score >= 4) {
    level = 'medium'
  } else {
    level = 'low'
  }

  // Déterminer l'offre recommandée
  let recommendedOffer: 'audit' | 'coaching' | 'mission' | 'unknown' = 'unknown'

  // Mapper goal "performances" à "performance"
  const goalForOffer = context.goal === 'performances' ? 'performance' : context.goal
  // Mapper urgency
  const urgencyForOffer = urgencyValue === 'immediat'
    ? 'urgent'
    : urgencyValue === '1-2-mois'
      ? '1_month'
      : urgencyValue === '3-6-mois' ? '3_months' : urgencyValue
  // Mapper teamSize "11-25" et "25+" à "10+"
  const teamSizeForOffer = (context.teamSize === '11-25' || context.teamSize === '25+') ? '10+' : context.teamSize

  if (goalForOffer === 'performance' || urgencyForOffer === 'urgent' || urgencyForOffer === '1_month') {
    recommendedOffer = 'audit'
  } else if (context.teamSize === '1-3' && urgencyForOffer !== 'urgent') {
    recommendedOffer = 'coaching'
  } else if (teamSizeForOffer === '10+'
    || (serviceValue === 'ai-orchestration' && (urgencyForOffer === '3_months' || urgencyForOffer === 'urgent'))
    || serviceValue === 'developpement-vuejs') {
    recommendedOffer = 'mission'
  }

  return {
    level,
    reasons,
    recommendedOffer,
    score
  }
}

/**
 * Qualification dédiée au flux landing `/lp/audit` (`getAuditChatConfig`).
 * Alignée sur les offres Clarté / Structure / Transformation de la page.
 *
 * Pondération : douleur forte ou intention d’audit explicite, taille d’équipe, urgence (démarrage ASAP = fort signal).
 * Seuils : high ≥ 7, medium ≥ 4, sinon low.
 *
 * Offres : `mission` (Transformation ~ gros périmètre / crise à l’échelle), `audit` (Structure — cas principal),
 * `coaching` (Clarté / profil léger).
 */
export function qualifyAuditLead(context: LeadContext): QualificationResult {
  let score = 0
  const reasons: string[] = []

  const situation = context.audit_situation
  const team = context.audit_team
  const urgency = context.audit_urgency

  if (
    situation === 'architecture_floue'
    || situation === 'dette_technique'
    || situation === 'scaling'
  ) {
    score += 2
    reasons.push(`audit_situation_${situation}`)
  } else if (situation === 'regard_externe') {
    score += 2
    reasons.push('audit_situation_regard_externe')
  }

  if (team === '1-3') {
    score += 1
    reasons.push('audit_team_1_3')
  } else if (team === '4-10') {
    score += 2
    reasons.push('audit_team_4_10')
  } else if (team === '10+') {
    score += 3
    reasons.push('audit_team_10_plus')
  }

  if (urgency === 'immediat') {
    score += 3
    reasons.push('audit_urgency_immediat')
  } else if (urgency === '1-2-mois') {
    score += 1
    reasons.push('audit_urgency_1_2_mois')
  } else if (urgency === '3-6-mois') {
    reasons.push('audit_urgency_3_6_mois')
  }

  let level: 'high' | 'medium' | 'low'
  if (score >= 7) {
    level = 'high'
  } else if (score >= 4) {
    level = 'medium'
  } else {
    level = 'low'
  }

  let recommendedOffer: QualificationResult['recommendedOffer'] = 'audit'

  const crisisAtScale
    = situation === 'dette_technique'
      || situation === 'scaling'

  if (team === '10+') {
    recommendedOffer = 'mission'
  } else if (crisisAtScale && team === '4-10' && urgency === 'immediat') {
    recommendedOffer = 'mission'
  } else if (score <= 3 && team === '1-3') {
    recommendedOffer = 'coaching'
  } else if (
    team === '1-3'
    && urgency === '3-6-mois'
    && situation === 'regard_externe'
  ) {
    recommendedOffer = 'coaching'
  }

  return {
    level,
    reasons,
    recommendedOffer,
    score
  }
}

/**
 * Dictionnaires de traduction pour les codes de raison
 */
const reasonTranslations: Record<Locale, Record<string, string>> = {
  en: {
    // Audit LP (/lp/audit)
    audit_situation_architecture_floue: 'Unclear architecture',
    audit_situation_dette_technique: 'Technical debt',
    audit_situation_scaling: 'Scaling strain',
    audit_situation_regard_externe: 'Outside perspective',
    audit_team_1_3: 'Team 1–3 devs',
    audit_team_4_10: 'Team 4–10 devs',
    audit_team_10_plus: 'Team 10+ devs',
    audit_urgency_immediat: 'ASAP',
    audit_urgency_1_2_mois: '1–2 months',
    audit_urgency_3_6_mois: '3–6 months',
    // Services
    service_architecture_frontend: 'Frontend Architecture',
    service_vue_nuxt: 'Vue/Nuxt',
    service_ai_orchestration: 'Pragmatic AI',
    // Goals
    goal_modernize: 'Modernization',
    goal_performance: 'Performance',
    goal_reduce_costs: 'Cost reduction',
    goal_accelerate: 'Acceleration',
    goal_other: 'Other objective',
    // Teams
    team_4_10: 'Team of 4-10 developers',
    team_10_plus: 'Team of 10+ developers',
    // Urgency
    urgency_urgent: 'Immediate urgency',
    urgency_1_month: 'Urgency 1-2 months',
    urgency_3_months: 'Urgency 3-6 months',
    // Stack
    stack_vue_nuxt: 'Vue/Nuxt stack'
  },
  fr: {
    // Audit LP (/lp/audit)
    audit_situation_architecture_floue: 'Architecture peu claire',
    audit_situation_dette_technique: 'Dette technique',
    audit_situation_scaling: 'Montée en charge',
    audit_situation_regard_externe: 'Regard externe',
    audit_team_1_3: 'Équipe 1–3 devs',
    audit_team_4_10: 'Équipe 4–10 devs',
    audit_team_10_plus: 'Équipe 10+ devs',
    audit_urgency_immediat: 'Démarrage immédiat',
    audit_urgency_1_2_mois: '1 à 2 mois',
    audit_urgency_3_6_mois: '3 à 6 mois',
    // Services
    service_architecture_frontend: 'Architecture Frontend',
    service_vue_nuxt: 'Vue/Nuxt',
    service_ai_orchestration: 'IA Pragmatique',
    // Goals
    goal_modernize: 'Modernisation',
    goal_performance: 'Performance',
    goal_reduce_costs: 'Réduction des coûts',
    goal_accelerate: 'Accélération',
    goal_other: 'Autre objectif',
    // Teams
    team_4_10: 'Équipe 4-10 développeurs',
    team_10_plus: 'Équipe 10+ développeurs',
    // Urgency
    urgency_urgent: 'Urgence immédiate',
    urgency_1_month: 'Urgence 1-2 mois',
    urgency_3_months: 'Urgence 3-6 mois',
    // Stack
    stack_vue_nuxt: 'Stack Vue/Nuxt'
  }
}

/**
 * Formate les codes de raison en chaînes localisées
 */
export function formatReasons(locale: Locale, reasonCodes: string[]): string[] {
  // Utiliser français si locale est "fr", sinon anglais
  const dict = locale === 'fr' ? reasonTranslations.fr : reasonTranslations.en
  return reasonCodes.map(code => dict[code] || code)
}

/**
 * Messages de qualification localisés
 */
const qualificationMessages: Record<Locale, Record<'high' | 'medium' | 'low', {
  rationale: (reasons: string[]) => string
  cta: string
}>> = {
  en: {
    high: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'Based on what you\'ve told me, I can help you.'
        }
        return `Based on what you've told me (${reasons.slice(0, 2).join(', ')}), I can help you.`
      },
      cta: 'Leave your email and I\'ll reply with a concrete first step.'
    },
    low: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'I\'m probably not the best person for your case.'
        }
        return `I'm probably not the best person for your case. ${reasons.slice(0, 2).join(', ')}.`
      },
      cta: 'If you want, leave your email and I\'ll redirect you to the best option.'
    },
    medium: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'I might be able to help you.'
        }
        return `I might be able to help you. ${reasons.slice(0, 2).join(', ')}.`
      },
      cta: 'Leave your email and I\'ll quickly tell you if it\'s worth an exchange.'
    }
  },
  fr: {
    high: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'D\'après ce que tu m\'as indiqué, je peux t\'aider.'
        }
        return `D'après ce que tu m'as indiqué (${reasons.slice(0, 2).join(', ')}), je peux t'aider.`
      },
      cta: 'Laisse ton email et je te réponds avec une première piste concrète.'
    },
    low: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'Je ne suis probablement pas la meilleure personne pour ton cas.'
        }
        return `Je ne suis probablement pas la meilleure personne pour ton cas. ${reasons.slice(0, 2).join(', ')}.`
      },
      cta: 'Si tu veux, laisse ton email et je te redirige vers la meilleure option.'
    },
    medium: {
      rationale: (reasons) => {
        if (reasons.length === 0) {
          return 'Je peux peut-être t\'aider.'
        }
        return `Je peux peut-être t'aider. ${reasons.slice(0, 2).join(', ')}.`
      },
      cta: 'Laisse ton email et je te dis rapidement si ça vaut un échange.'
    }
  }
}

/**
 * Formate un message de qualification localisé
 *
 * @param locale - La locale à utiliser ("fr" pour français, autre chose pour anglais)
 * @param context - Le contexte du lead (non utilisé dans cette fonction mais conservé pour compatibilité)
 * @param result - Le résultat de la qualification
 * @returns Un message localisé en français si locale === "fr", sinon en anglais
 */
export function formatQualificationMessage(
  locale: Locale,
  context: LeadContext,
  result: QualificationResult
): string {
  const { level, reasons } = result

  // Formater les raisons localisées
  const localizedReasons = formatReasons(locale, reasons)
  const selectedReasons = localizedReasons.slice(0, 2)

  // Utiliser français si locale est "fr", sinon anglais
  const messages = locale === 'fr' ? qualificationMessages.fr : qualificationMessages.en
  const levelMessages = messages[level]

  // Construire le message
  const rationale = levelMessages.rationale(selectedReasons)
  const { cta } = levelMessages

  return `${rationale}\n\n${cta}`
}
