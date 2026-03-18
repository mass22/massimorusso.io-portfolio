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
      data: {
        message: 'L\'ID du lead est requis.'
      },
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  }

  const id = parseInt(idParam, 10)
  if (isNaN(id) || id <= 0) {
    throw createError({
      data: {
        message: 'L\'ID du lead est invalide.'
      },
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  }

  // Récupérer le token depuis les query params
  const query = getQuery(event)
  const token = query.token as string | undefined

  if (!token || typeof token !== 'string' || token.trim() === '') {
    throw createError({
      data: {
        message: 'Le token d\'accès est requis.'
      },
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Récupérer le lead avec vérification du token
  const lead = await getLeadByIdAndToken(id, token.trim())

  if (!lead) {
    throw createError({
      data: {
        message: 'Lead introuvable ou token invalide.'
      },
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }

  // Construire le LeadContext pour le résumé
  const leadContext: LeadContext = {
    answers: lead.answers,
    completedAt: lead.completedAt,
    metadata: lead.metadata,
    stepCount: lead.stepCount
  }

  // Générer le résumé
  const summary = leadSummary(leadContext)

  // Retourner les données
  return {
    context: leadContext,
    createdAt: lead.createdAt,
    id: lead.id,
    qualification: lead.qualification,
    summary,
    updatedAt: lead.updatedAt
  }
})
