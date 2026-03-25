import { z } from 'zod'
import { countLeads, getAllLeads } from '../utils/db'
import { getCookie } from 'h3'
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '../utils/adminSession'

const QuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
})

export default defineEventHandler(async (event) => {
  // Accès admin uniquement : on exige une session cookie signée
  // (sauf pendant les tests unitaires).
  if (process.env.NODE_ENV !== 'test') {
    const token = getCookie(event, ADMIN_SESSION_COOKIE_NAME)
    const ok = verifyAdminSessionToken(token)
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: {
          message: 'Veuillez vous connecter pour accéder au dashboard des leads.'
        }
      })
    }
  }

  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const query = getQuery(event) as Record<string, unknown>
  const parsed = QuerySchema.safeParse(query)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        message: 'Paramètres de requête invalides.'
      }
    })
  }

  const limit = parsed.data.limit ?? 10
  const offset = parsed.data.offset ?? 0

  const [total, items] = await Promise.all([
    countLeads(),
    getAllLeads(limit, offset)
  ])

  return {
    total,
    items: items.map((lead) => {
      const email = (lead.answers as any)?.email
      const name = (lead.answers as any)?.name
      const referrer = lead.metadata?.referrer
      const userAgent = lead.metadata?.userAgent

      return {
        id: lead.id,
        email: typeof email === 'string' ? email : undefined,
        name: typeof name === 'string' ? name : undefined,
        completedAt: lead.completedAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        stepCount: lead.stepCount,
        qualification: lead.qualification,
        metadata: {
          referrer: typeof referrer === 'string' ? referrer : undefined,
          timestamp: lead.metadata?.timestamp,
          userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 160) : undefined
        },
        accessToken: lead.accessToken
      }
    })
  }
})
