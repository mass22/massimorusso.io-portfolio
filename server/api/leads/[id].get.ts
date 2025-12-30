import { getLeadByIdAndToken } from '../../utils/db'
import { leadSummary } from '../../utils/leadSummary'
import type { LeadContext } from '~/types/content'

export default defineEventHandler(async (event) => {
  // Vérifier que c'est une requête GET
  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  // Récupérer l'ID depuis les paramètres de route
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        message: 'L\'ID du lead est requis.'
      }
    })
  }

  const id = parseInt(idParam, 10)
  if (isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        message: 'L\'ID du lead est invalide.'
      }
    })
  }

  // Récupérer le token depuis les query params
  const query = getQuery(event)
  const token = query.token as string | undefined

  if (!token || typeof token !== 'string' || token.trim() === '') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        message: 'Le token d\'accès est requis.'
      }
    })
  }

  // Récupérer le lead avec vérification du token
  const lead = getLeadByIdAndToken(id, token.trim())

  if (!lead) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: {
        message: 'Lead introuvable ou token invalide.'
      }
    })
  }

  // Construire le LeadContext pour le résumé
  const leadContext: LeadContext = {
    answers: lead.answers,
    completedAt: lead.completedAt,
    stepCount: lead.stepCount,
    metadata: lead.metadata
  }

  // Générer le résumé
  const summary = leadSummary(leadContext)

  // Retourner les données
  return {
    id: lead.id,
    summary,
    context: leadContext,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  }
})

