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
  fr: {
    newLead: 'NOUVEAU LEAD',
    contactInfo: '📧 INFORMATIONS DE CONTACT',
    name: 'Nom',
    email: 'Email',
    qualification: 'QUALIFICATION',
    match: 'Match',
    recommendation: 'Recommandation',
    reasons: 'Raisons',
    summary: 'RÉSUMÉ',
    fullContext: 'CONTEXTE COMPLET (JSON)',
    viewLead: 'LIEN POUR VOIR LE LEAD'
  },
  en: {
    newLead: 'NEW LEAD',
    contactInfo: '📧 CONTACT INFORMATION',
    name: 'Name',
    email: 'Email',
    qualification: 'QUALIFICATION',
    match: 'Match',
    recommendation: 'Recommendation',
    reasons: 'Reasons',
    summary: 'SUMMARY',
    fullContext: 'FULL CONTEXT (JSON)',
    viewLead: 'LINK TO VIEW LEAD'
  }
}

/**
 * Traductions pour les codes de raison
 */
const reasonTranslations: Record<Locale, Record<string, string>> = {
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
  },
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
  }
}

/**
 * Traductions pour les niveaux de qualification
 */
const levelTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    high: 'élevé',
    medium: 'moyen',
    low: 'faible'
  },
  en: {
    high: 'high',
    medium: 'medium',
    low: 'low'
  }
}

/**
 * Traductions pour les offres recommandées
 */
const offerTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    audit: 'Audit',
    coaching: 'Coaching',
    mission: 'Mission'
  },
  en: {
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

  // Vérification de sécurité : s'assurer que l'URL contient bien /lead/
  if (!leadUrl.includes('/lead/')) {
    console.error('[Email] ⚠️  ERREUR: L\'URL générée ne contient pas "/lead/":', leadUrl)
    console.error('[Email] ⚠️  baseUrl:', baseUrl)
    console.error('[Email] ⚠️  leadPath:', leadPath)
  }

  // Log pour déboguer dans le corps de l'email aussi
  lines.push(`DEBUG - baseUrl: ${baseUrl}`)
  lines.push(`DEBUG - leadPath: ${leadPath}`)
  lines.push(`DEBUG - URL complète: ${leadUrl}`)
  lines.push('')
  lines.push(leadUrl)
  lines.push('')
  // Ajouter aussi l'URL sur une ligne séparée pour faciliter le copier-coller
  lines.push(`(Copier-coller: ${leadUrl})`)
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

  // Validation des variables d'environnement avec logs détaillés
  console.log('[Email] 🔍 Vérification des variables d'environnement...')

  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY n\'est pas définie')
    return false
  }

  if (!adminEmail) {
    console.error('[Email] ADMIN_EMAIL n\'est pas définie')
    return false
  }

  if (!fromEmail) {
    console.error('[Email] FROM_EMAIL n\'est pas définie')
    return false
  }

  // Extraire les informations pour le sujet
  const { service, urgency } = extractSubjectInfo(context)
  const subject = generateSubject(service, urgency, locale)

  // Nettoyer le baseUrl pour éviter les problèmes de formatage
  // Enlever les trailing slashes et s'assurer qu'il n'y a pas de chemin déjà présent
  let cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '')

  // Log du BASE_URL original pour déboguer
  console.log('[Email] 🔍 BASE_URL original:', baseUrl)

  // S'assurer que le BASE_URL ne contient pas déjà /lead/
  if (cleanBaseUrl.includes('/lead')) {
    console.warn('[Email] ⚠️  BASE_URL contient déjà "/lead/". Nettoyage en cours...')
    const beforeClean = cleanBaseUrl
    cleanBaseUrl = cleanBaseUrl.replace(/\/lead\/?.*$/, '')
    console.log('[Email] 🔍 BASE_URL avant nettoyage:', beforeClean)
    console.log('[Email] 🔍 BASE_URL après nettoyage:', cleanBaseUrl)
  }

  console.log('[Email] 🔍 BASE_URL final utilisé:', cleanBaseUrl)

  // Générer le corps de l'email
  const body = generateEmailBody(email, name, context, qualification, locale, leadId, token, cleanBaseUrl)

  // Log pour déboguer (toujours afficher pour vérifier)
  const debugUrl = `${cleanBaseUrl}/lead/${leadId}?token=${encodeURIComponent(token)}`
  console.log('[Email] 📧 URL générée pour le lead:', debugUrl)
  console.log('[Email] 📧 BASE_URL utilisé:', cleanBaseUrl)

  // Log avant l'appel API
  console.log('[Email] 🚀 Préparation de l\'appel à l\'API Resend...')
  console.log('[Email]   Subject:', subject)
  console.log('[Email]   Body length:', body.length, 'caractères')

  try {
    // Appel à l'API Resend
    console.log('[Email] 📡 Envoi de la requête à Resend...')
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject,
        text: body
      })
    })

    console.log('[Email] 📥 Réponse reçue de Resend, status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorText = await response.text().catch(() => '')

      // Gestion spécifique de l'erreur 403 (domaine non vérifié)
      if (response.status === 403) {
        const errorMessage = errorData?.message || errorText || 'Domaine non vérifié'
        console.error('[Email] ⚠️  Erreur 403 - Domaine non vérifié dans Resend')
        console.error('[Email] Message:', errorMessage)
        console.error('[Email] 💡 Solutions:')
        console.error('[Email]   1. Pour les tests: Utilisez "onboarding@resend.dev" comme FROM_EMAIL')
        console.error('[Email]   2. Pour la production: Vérifiez un domaine sur https://resend.com/domains')
        console.error('[Email]      et utilisez une adresse FROM avec ce domaine (ex: noreply@votredomaine.com)')
        console.error('[Email] 📧 FROM_EMAIL actuel:', fromEmail)
        console.error('[Email] 📧 ADMIN_EMAIL actuel:', adminEmail)
        return false
      }

      console.error('[Email] ❌ Erreur lors de l\'envoi de l\'email:')
      console.error('[Email]   Status:', response.status, response.statusText)
      console.error('[Email]   Erreur:', errorData || errorText)
      console.error('[Email]   FROM_EMAIL:', fromEmail)
      console.error('[Email]   ADMIN_EMAIL:', adminEmail)
      return false
    }

    const result = await response.json()
    console.log('[Email] ✅ Email envoyé avec succès!')
    console.log('[Email]   ID Resend:', result.id)
    console.log('[Email]   À:', adminEmail)
    console.log('[Email]   Depuis:', fromEmail)
    console.log('[Email]   Vérifiez sur: https://resend.com/emails')
    return true
  } catch (error: any) {
    console.error('[Email] ❌ Exception lors de l\'envoi de l\'email:')
    console.error('[Email]   Erreur:', error.message || error)
    if (error.stack) {
      console.error('[Email]   Stack:', error.stack)
    }
    console.error('[Email]   FROM_EMAIL:', fromEmail)
    console.error('[Email]   ADMIN_EMAIL:', adminEmail)
    console.error('[Email]   RESEND_API_KEY configurée:', !!apiKey)
    return false
  }
}
