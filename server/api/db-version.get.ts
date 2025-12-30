import { neon } from '@neondatabase/serverless'

/**
 * Endpoint de test pour vérifier la connexion à Neon
 * Basé sur le guide officiel Neon : https://neon.tech/docs/guides/nuxt
 */
export default defineEventHandler(async (event) => {
  // Vérifier que c'est une requête GET
  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

  if (!databaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database not configured',
      data: {
        message: 'DATABASE_URL n\'est pas configuré. Vérifiez votre configuration Vercel/Neon.'
      }
    })
  }

  try {
    const sql = neon(databaseUrl)
    const [response] = await sql`SELECT version()`

    return {
      version: response.version,
      connected: true,
      databaseUrl: databaseUrl.replace(/:[^:@]+@/, ':****@'), // Masquer le mot de passe
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('[DB] Erreur lors de la vérification de la version:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed',
      data: {
        message: error.message || 'Erreur de connexion à la base de données',
        error: error.message
      }
    })
  }
})
