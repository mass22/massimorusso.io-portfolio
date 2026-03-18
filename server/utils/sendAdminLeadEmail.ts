import type { LeadContext } from '~/types/content'
import { leadSummary } from './leadSummary'

type Locale = 'fr' | 'en'

interface QualificationResult {
  score: number
  level: string
  reasons?: string[]
  recommendedOffer?: string
}

interface SendAdminLeadEmailParams {
  email: string
  name?: string
  context: LeadContext
  qualification?: QualificationResult
  locale?: Locale
  leadId: number
  token: string
}

/**
 * Traductions pour les labels de l'email
 */
const emailLabels: Record<Locale, {
  newLead: string
  contactInfo: string
  name: string
  email: string
  qualification: string
  match: string
  recommendation: string
  reasons: string
  summary: string
  fullContext: string
  viewLead: string
}> = {
  en: {
    contactInfo: '📧 CONTACT INFORMATION',
    email: 'Email',
    fullContext: 'FULL CONTEXT (JSON)',
    match: 'Match',
    name: 'Name',
    newLead: 'NEW LEAD',
    qualification: 'QUALIFICATION',
    reasons: 'Reasons',
    recommendation: 'Recommendation',
    summary: 'SUMMARY',
    viewLead: 'LINK TO VIEW LEAD'
  },
  fr: {
    contactInfo: '📧 INFORMATIONS DE CONTACT',
    email: 'Email',
    fullContext: 'CONTEXTE COMPLET (JSON)',
    match: 'Match',
    name: 'Nom',
    newLead: 'NOUVEAU LEAD',
    qualification: 'QUALIFICATION',
    reasons: 'Raisons',
    recommendation: 'Recommandation',
    summary: 'RÉSUMÉ',
    viewLead: 'LIEN POUR VOIR LE LEAD'
  }
}

/**
 * Traductions pour les codes de raison
 */
const reasonTranslations: Record<Locale, Record<string, string>> = {
  en: {
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
 * Traductions pour les niveaux de qualification
 */
const levelTranslations: Record<Locale, Record<string, string>> = {
  en: {
    high: 'high',
    low: 'low',
    medium: 'medium'
  },
  fr: {
    high: 'élevé',
    low: 'faible',
    medium: 'moyen'
  }
}

/**
 * Traductions pour les offres recommandées
 */
const offerTranslations: Record<Locale, Record<string, string>> = {
  en: {
    audit: 'Audit',
    coaching: 'Coaching',
    mission: 'Mission'
  },
  fr: {
    audit: 'Audit',
    coaching: 'Coaching',
    mission: 'Mission'
  }
}

/**
 * Formate les codes de raison en chaînes localisées
 */
function formatReasons(locale: Locale, reasonCodes: string[]): string[] {
  const dict = reasonTranslations[locale] || reasonTranslations.en
  return reasonCodes.map(code => dict[code] || code)
}

/**
 * Extrait le service et l'urgence du contexte pour le sujet de l'email
 */
function extractSubjectInfo(context: LeadContext): { service?: string, urgency?: string } {
  const answers = context.answers || {}

  // Chercher des clés communes pour le service
  const serviceKeys = ['service', 'serviceType', 'type', 'besoin', 'need']
  const urgencyKeys = ['urgency', 'urgence', 'priority', 'priorite', 'timing', 'deadline']

  let service: string | undefined
  let urgency: string | undefined

  for (const key of serviceKeys) {
    if (answers[key]) {
      const value = answers[key]
      service = Array.isArray(value) ? value.join(', ') : String(value)
      break
    }
  }

  for (const key of urgencyKeys) {
    if (answers[key]) {
      const value = answers[key]
      urgency = Array.isArray(value) ? value.join(', ') : String(value)
      break
    }
  }

  return { service, urgency }
}

/**
 * Génère le sujet de l'email
 */
function generateSubject(service?: string, urgency?: string, locale: Locale = 'en'): string {
  const parts: string[] = []

  if (service) {
    parts.push(service)
  }

  if (urgency) {
    parts.push(urgency)
  }

  const newLeadLabel = locale === 'fr' ? 'Nouveau lead' : 'New lead'

  if (parts.length > 0) {
    return `[Lead] ${parts.join(' — ')}`
  }

  return `[Lead] ${newLeadLabel}`
}

/**
 * Génère le corps de l'email en texte brut
 */
function generateEmailBody(
  email: string,
  name: string | undefined,
  context: LeadContext,
  qualification: QualificationResult | undefined,
  locale: Locale,
  leadId: number,
  token: string,
  baseUrl: string
): string {
  const labels = emailLabels[locale]
  const lines: string[] = []

  // En-tête
  lines.push('='.repeat(60))
  lines.push(labels.newLead)
  lines.push('='.repeat(60))
  lines.push('')

  // Informations de contact
  lines.push(labels.contactInfo)
  lines.push('-'.repeat(60))
  if (name) {
    lines.push(`${labels.name}: ${name}`)
  }
  lines.push(`${labels.email}: ${email}`)
  lines.push('')

  // Qualification si disponible
  if (qualification) {
    lines.push('='.repeat(60))
    lines.push(labels.qualification)
    lines.push('='.repeat(60))
    lines.push('')

    // Match avec niveau localisé
    const levelLabel = levelTranslations[locale]?.[qualification.level] || qualification.level
    lines.push(`${labels.match}: ${levelLabel} (score: ${qualification.score})`)

    // Recommandation
    if (qualification.recommendedOffer && qualification.recommendedOffer !== 'unknown') {
      const offerLabel = offerTranslations[locale]?.[qualification.recommendedOffer] || qualification.recommendedOffer
      lines.push(`${labels.recommendation}: ${offerLabel}`)
    }

    // Raisons localisées
    if (qualification.reasons && qualification.reasons.length > 0) {
      lines.push(`${labels.reasons}:`)
      const localizedReasons = formatReasons(locale, qualification.reasons)
      localizedReasons.forEach((reason) => {
        lines.push(`  - ${reason}`)
      })
    }
    lines.push('')
  }

  // Résumé du lead
  const summary = leadSummary(context)
  lines.push(summary)
  lines.push('')

  // Contexte JSON formaté
  lines.push('='.repeat(60))
  lines.push(labels.fullContext)
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(JSON.stringify(context, null, 2))
  lines.push('')

  // Lien pour voir le lead
  lines.push('='.repeat(60))
  lines.push(labels.viewLead)
  lines.push('='.repeat(60))
  lines.push('')
  // Construire l'URL (baseUrl est déjà nettoyé)
  // S'assurer que l'URL est absolue et correctement formatée
  const leadPath = `/lead/${leadId}`
  const leadQuery = `token=${encodeURIComponent(token)}`
  const leadUrl = `${baseUrl}${leadPath}?${leadQuery}`

  lines.push(leadUrl)
  lines.push('')

  return lines.join('\n')
}

/**
 * Envoie un email de notification à l'administrateur pour un nouveau lead
 *
 * @param params Les paramètres du lead et du contexte
 * @returns true si l'email a été envoyé avec succès, false sinon
 */
export async function sendAdminLeadEmail(params: SendAdminLeadEmailParams): Promise<boolean> {
  const { email, name, context, qualification, locale = 'en', leadId, token } = params

  // Récupérer les variables d'environnement
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const fromEmail = process.env.FROM_EMAIL
  const baseUrl = process.env.BASE_URL || 'https://massimorusso.io'

  // Validation des variables d'environnement
  if (!apiKey) {
    console.error('[Email] ❌ RESEND_API_KEY n\'est pas définie')
    return false
  }

  if (!adminEmail) {
    console.error('[Email] ❌ ADMIN_EMAIL n\'est pas définie')
    return false
  }

  if (!fromEmail) {
    console.error('[Email] ❌ FROM_EMAIL n\'est pas définie')
    return false
  }

  // Extraire les informations pour le sujet
  const { service, urgency } = extractSubjectInfo(context)
  const subject = generateSubject(service, urgency, locale)

  // Nettoyer le baseUrl pour éviter les problèmes de formatage
  let cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '')

  // S'assurer que le BASE_URL ne contient pas déjà /lead/
  if (cleanBaseUrl.includes('/lead')) {
    cleanBaseUrl = cleanBaseUrl.replace(/\/lead\/?.*$/, '')
  }

  // Générer le corps de l'email
  const body = generateEmailBody(email, name, context, qualification, locale, leadId, token, cleanBaseUrl)

  try {
    // Appel à l'API Resend avec $fetch de Nuxt (meilleure compatibilité Vercel)
    const requestBody = {
      from: fromEmail,
      subject,
      text: body,
      to: [adminEmail]
    }

    const result = await $fetch<{ id: string }>('https://api.resend.com/emails', {
      body: requestBody,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      timeout: 20000 // 20 secondes de timeout
    })

    console.log('[Email] ✅ Email envoyé avec succès (ID Resend:', result.id, ')')
    return true
  } catch (error: any) {
    // Gestion spécifique de l'erreur 403 (domaine non vérifié)
    if (error.status === 403 || error.statusCode === 403) {
      console.error('[Email] ❌ Erreur 403 - Domaine non vérifié dans Resend')
      console.error('[Email] 💡 Pour les tests: Utilisez "onboarding@resend.dev" comme FROM_EMAIL')
      console.error('[Email] 💡 Pour la production: Vérifiez un domaine sur https://resend.com/domains')
      return false
    }

    console.error('[Email] ❌ Erreur lors de l\'envoi de l\'email:', error.message || error)
    return false
  }
}
