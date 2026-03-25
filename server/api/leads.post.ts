import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import { insertLead } from '../utils/db'
import { checkRateLimit, getResetTime } from '../utils/rateLimit'
import { sendAdminLeadEmail } from '../utils/sendAdminLeadEmail'
import { notifyLeadWebhookCreated } from '../utils/notifyLeadWebhook'
import type { LeadContext } from '~/types/content'

/**
 * Notifications email (Resend) désactivées par défaut.
 * Mettre `LEAD_EMAIL_NOTIFICATIONS=true` + variables Resend pour réactiver.
 */
function shouldSendLeadEmailNotification(consent: boolean): boolean {
  return consent && process.env.LEAD_EMAIL_NOTIFICATIONS === 'true'
}

// Schéma de validation pour QualificationResult (validation minimale)
const QualificationResultSchema = z.object({
  level: z.string(),
  reasons: z.array(z.string()).optional(),
  recommendedOffer: z.string().optional(),
  score: z.number()
})

// Schéma de validation pour le LeadContext
const LeadContextSchema = z.object({
  answers: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])),
  completedAt: z.string().datetime(),
  metadata: z.object({
    referrer: z.string().optional(),
    timestamp: z.string().optional(),
    userAgent: z.string().optional()
  }).optional(),
  stepCount: z.number().int().min(1)
})

// Schéma de validation pour la requête complète
const LeadRequestSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().optional(),
  consent: z.boolean(),
  context: LeadContextSchema,
  qualification: QualificationResultSchema.optional(),
  locale: z.enum(['fr', 'en']).optional().default('en'),
  // Honeypot field - doit être vide ou absent
  website: z.string().optional()
})

/**
 * Génère un token d'accès sécurisé
 */
function generateAccessToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Obtient l'adresse IP du client
 */
function getClientIP(event: any): string {
  // Vérifier les headers de proxy (X-Forwarded-For, X-Real-IP)
  const forwardedFor = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For']
  if (forwardedFor) {
    // Prendre la première IP de la chaîne
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
    return ip.split(',')[0].trim()
  }

  const realIP = event.headers['x-real-ip'] || event.headers['X-Real-IP']
  if (realIP) {
    const ip = Array.isArray(realIP) ? realIP[0] : realIP
    return ip.trim()
  }

  // Fallback sur l'adresse de connexion
  return event.node.req.socket?.remoteAddress || 'unknown'
}

export default defineEventHandler(async (event) => {
  // Vérifier que c'est une requête POST
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  // Obtenir l'IP du client
  const clientIP = getClientIP(event)

  // Rate limiting : 5 requêtes par minute par IP
  if (checkRateLimit(clientIP, 5, 60000)) {
    const resetTime = getResetTime(clientIP)

    throw createError({
      data: {
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: resetTime
      },
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }

  // Lire et valider le body
  let body: unknown
  try {
    body = await readBody(event)
  } catch {
    throw createError({
      data: {
        message: 'Le corps de la requête est invalide.'
      },
      statusCode: 400,
      statusMessage: 'Invalid Request Body'
    })
  }

  // Validation avec Zod
  const validationResult = LeadRequestSchema.safeParse(body)

  if (!validationResult.success) {
    throw createError({
      data: {
        errors: validationResult.error.errors,
        message: 'Les données fournies sont invalides.'
      },
      statusCode: 400,
      statusMessage: 'Validation Error'
    })
  }

  const { data } = validationResult

  // Vérification du honeypot
  // Le champ "website" doit être vide ou absent pour les vrais utilisateurs
  // Les bots remplissent souvent tous les champs
  if (data.website && data.website.trim() !== '') {
    // C'est probablement un bot, mais on ne le signalons pas explicitement
    // Pour ne pas leur donner d'indices
    throw createError({
      data: {
        message: 'Requête invalide.'
      },
      statusCode: 400,
      statusMessage: 'Invalid Request'
    })
  }

  // Si consent est false, ne pas stocker le contexte complet
  // On stocke seulement les informations minimales
  let leadContext: LeadContext

  if (!data.consent) {
    // Contexte minimal sans les réponses détaillées
    leadContext = {
      answers: {
        email: data.email,
        ...(data.name && { name: data.name })
      },
      completedAt: data.context.completedAt,
      metadata: data.context.metadata,
      stepCount: data.context.stepCount
    }
  } else {
    // Contexte complet avec toutes les réponses
    leadContext = {
      answers: {
        email: data.email,
        ...(data.name && { name: data.name }),
        ...data.context.answers
      },
      completedAt: data.context.completedAt,
      metadata: data.context.metadata,
      stepCount: data.context.stepCount
    }
  }

  // Générer un token d'accès unique
  const accessToken = generateAccessToken()

  try {
    // Insérer le lead dans la base de données avec la qualification
    const leadId = await insertLead(leadContext, accessToken, data.qualification)

    // Notification email (optionnelle, désactivée par défaut)
    if (shouldSendLeadEmailNotification(data.consent)) {
      console.log('[API] 📧 Tentative d\'envoi d\'email pour le lead:', leadId)
      sendAdminLeadEmail({
        context: leadContext,
        email: data.email,
        leadId,
        locale: data.locale || 'en',
        name: data.name,
        qualification: data.qualification,
        token: accessToken
      })
        .then((success) => {
          if (success) {
            console.log('[API] ✅ Email envoyé avec succès pour le lead:', leadId)
          } else {
            console.error('[API] ❌ Échec de l\'envoi d\'email pour le lead:', leadId)
            console.error('[API] 💡 Vérifiez les logs ci-dessus pour plus de détails')
          }
        })
        .catch((error) => {
          // Logger l'erreur mais continuer
          console.error('[API] ❌ Exception lors de l\'envoi de l\'email (non bloquante):', error)
          console.error('[API]   Message:', error.message)
          console.error('[API]   Stack:', error.stack)
        })
    } else if (data.consent) {
      console.log('[API] ⏭️  Notifications email désactivées (LEAD_EMAIL_NOTIFICATIONS≠true), email non envoyé')
    } else {
      console.log('[API] ⏭️  Consentement non donné, email non envoyé')
    }

    notifyLeadWebhookCreated({
      leadId,
      qualificationScore: data.qualification?.score
    })

    // Retourner l'ID et le token
    return {
      id: leadId,
      token: accessToken
    }
  } catch (error: any) {
    // Gérer les erreurs de base de données
    console.error('[API] Erreur lors de l\'insertion du lead:', error)
    console.error('[API] Message d\'erreur:', error.message)
    console.error('[API] Stack:', error.stack)
    console.error('[API] Code d\'erreur:', error.code)

    // Si c'est une erreur de contrainte unique (token dupliqué, très rare)
    // Code SQLite: SQLITE_CONSTRAINT_UNIQUE, Postgres: 23505
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
      // Réessayer avec un nouveau token
      const newToken = generateAccessToken()
      try {
        const leadId = await insertLead(leadContext, newToken, data.qualification)

        if (shouldSendLeadEmailNotification(data.consent)) {
          sendAdminLeadEmail({
            context: leadContext,
            email: data.email,
            leadId,
            locale: data.locale || 'en',
            name: data.name,
            qualification: data.qualification,
            token: newToken
          }).catch((error) => {
            console.error('[API] Erreur lors de l\'envoi de l\'email (non bloquante):', error)
          })
        }

        notifyLeadWebhookCreated({
          leadId,
          qualificationScore: data.qualification?.score
        })

        return {
          id: leadId,
          token: newToken
        }
      } catch {
        throw createError({
          data: {
            message: 'Une erreur est survenue lors de l\'enregistrement.'
          },
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }

    throw createError({
      data: {
        message: 'Une erreur est survenue lors de l\'enregistrement.'
      },
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
