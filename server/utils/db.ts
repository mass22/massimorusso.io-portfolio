import { neon } from '@neondatabase/serverless'
import type { LeadContext } from '~/types/content'

// Détection de l'environnement
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
const usePostgres = isVercel || !!databaseUrl

// Instance de connexion Neon
let sql: ReturnType<typeof neon> | null = null

if (usePostgres && databaseUrl) {
  try {
    sql = neon(databaseUrl)
    console.log('[DB] Connexion Neon initialisée')
  } catch (error: any) {
    console.error('[DB] Erreur lors de l\'initialisation de la connexion Neon:', error)
    console.error('[DB] DATABASE_URL présent:', !!databaseUrl)
  }
} else if (usePostgres && !databaseUrl) {
  console.error('[DB] ⚠️  Postgres requis mais DATABASE_URL non configuré!')
  console.error('[DB] Variables disponibles:', {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL
  })
}

// Fallback vers SQLite en développement local si Postgres n'est pas configuré
let sqliteDb: any = null
let sqliteInitialized = false

/**
 * Initialise SQLite pour le développement local
 */
async function initSQLite(): Promise<void> {
  if (sqliteInitialized || usePostgres) {
    return
  }

  // Permettre l'initialisation en mode test ou dev
  const isDev = import.meta.dev || process.env.NODE_ENV === 'test'
  if (!isDev) {
    return
  }

  try {
    // @ts-expect-error - better-sqlite3 n'a pas de types TypeScript complets
    const Database = (await import('better-sqlite3')).default
    const { fileURLToPath } = await import('node:url')
    const { dirname, join } = await import('node:path')
    const { mkdirSync, existsSync } = await import('node:fs')

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'leads.db')

    const dataDir = dirname(dbPath)
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }

    sqliteDb = new Database(dbPath)
    sqliteDb.pragma('foreign_keys = ON')

    // Créer la table pour SQLite
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        answers TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        step_count INTEGER NOT NULL,
        metadata TEXT,
        qualification TEXT,
        access_token TEXT UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    console.log('[DB] SQLite initialisé pour le développement local:', dbPath)
    sqliteInitialized = true
  } catch (error: any) {
    console.warn('[DB] SQLite non disponible, utilisation de Postgres uniquement:', error.message)
  }
}

/**
 * Initialise la base de données Postgres et crée les tables si nécessaire
 */
async function initPostgresDatabase(): Promise<void> {
  if (!sql) {
    throw new Error('Connexion Postgres non initialisée. Vérifiez DATABASE_URL.')
  }

  try {
    // Créer la table leads si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        answers JSONB NOT NULL,
        completed_at TIMESTAMP NOT NULL,
        step_count INTEGER NOT NULL,
        metadata JSONB,
        qualification JSONB,
        access_token TEXT UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `

    // Créer les index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_leads_completed_at ON leads(completed_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token)
    `

    console.log('[DB] Base de données Postgres (Neon) initialisée')
  } catch (error: any) {
    // Si la table existe déjà, c'est OK
    if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
      console.error('[DB] Erreur lors de l\'initialisation de Postgres:', error)
      throw error
    }
  }
}

// Initialiser Postgres au chargement du module si on utilise Postgres
// Note: L'initialisation se fera à la première requête si elle échoue ici
if (usePostgres && sql && import.meta.server) {
  initPostgresDatabase().catch((error) => {
    console.error('[DB] Erreur lors de l\'initialisation au démarrage:', error)
    console.error('[DB] DATABASE_URL configuré:', !!databaseUrl)
    console.error('[DB] L\'initialisation sera réessayée à la première requête')
  })
}

/**
 * Type pour un lead dans la base de données
 */
export type Lead = {
  id: number
  answers: LeadContext['answers']
  completedAt: string
  stepCount: number
  metadata?: LeadContext['metadata']
  qualification?: {
    score: number
    level: string
    reasons?: string[]
    recommendedOffer?: string
  }
  accessToken?: string
  createdAt: string
  updatedAt: string
}

/**
 * Insère un nouveau lead dans la base de données
 * @param context Le contexte du lead à insérer
 * @param accessToken Le token d'accès à associer au lead
 * @param qualification La qualification du lead (optionnelle)
 * @returns L'ID du lead créé
 */
export async function insertLead(
  context: LeadContext,
  accessToken?: string,
  qualification?: any
): Promise<number> {
  if (usePostgres) {
    // Réinitialiser la connexion si nécessaire (conforme au guide Neon)
    if (!sql && databaseUrl) {
      try {
        sql = neon(databaseUrl)
        console.log('[DB] Connexion Neon réinitialisée')
      } catch (error: any) {
        console.error('[DB] Erreur lors de la réinitialisation:', error)
      }
    }

    if (!sql) {
      const errorMessage = 'Connexion Postgres non initialisée. DATABASE_URL n\'est pas configuré. '
        + 'Vérifiez que vous avez configuré Neon dans Vercel Storage.'
      console.error('[DB]', errorMessage)
      throw new Error(errorMessage)
    }

    // S'assurer que la base de données est initialisée
    try {
      await initPostgresDatabase()
    } catch (initError: any) {
      // Si l'initialisation échoue, logger mais continuer (peut-être que la table existe déjà)
      console.warn('[DB] Erreur lors de l\'initialisation avant insertion:', initError.message)
    }

    try {
      const result = await sql`
        INSERT INTO leads (answers, completed_at, step_count, metadata, qualification, access_token, updated_at)
        VALUES (
          ${JSON.stringify(context.answers)}::jsonb,
          ${context.completedAt}::timestamp,
          ${context.stepCount},
          ${context.metadata ? JSON.stringify(context.metadata) : null}::jsonb,
          ${qualification ? JSON.stringify(qualification) : null}::jsonb,
          ${accessToken || null},
          NOW()
        )
        RETURNING id
      ` as Array<{ id: number }>
      if (!result[0]) {
        throw new Error('Failed to insert lead')
      }
      return result[0].id
    } catch (error: any) {
      console.error('[DB] Erreur lors de l\'insertion:', error)
      console.error('[DB] Message:', error.message)
      console.error('[DB] Code:', error.code)
      console.error('[DB] DATABASE_URL configuré:', !!databaseUrl)
      console.error('[DB] Stack:', error.stack)
      throw error
    }
  } else {
    // Fallback SQLite pour le développement local
    await initSQLite()
    if (!sqliteDb) {
      throw new Error('Aucune base de données configurée. Configurez DATABASE_URL ou utilisez SQLite en développement.')
    }

    const stmt = sqliteDb.prepare(`
      INSERT INTO leads (answers, completed_at, step_count, metadata, qualification, access_token, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    const result = stmt.run(
      JSON.stringify(context.answers),
      context.completedAt,
      context.stepCount,
      context.metadata ? JSON.stringify(context.metadata) : null,
      qualification ? JSON.stringify(qualification) : null,
      accessToken || null
    )

    return result.lastInsertRowid as number
  }
}

/**
 * Récupère un lead par son ID
 * @param id L'ID du lead à récupérer
 * @returns Le lead ou null s'il n'existe pas
 */
export async function getLeadById(id: number): Promise<Lead | null> {
  if (usePostgres && sql) {
    const result = await sql`
      SELECT
        id,
        answers,
        completed_at as "completedAt",
        step_count as "stepCount",
        metadata,
        qualification,
        access_token as "accessToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      WHERE id = ${id}
    ` as Array<{
      id: number
      answers: LeadContext['answers']
      completedAt: string
      stepCount: number
      metadata?: LeadContext['metadata']
      qualification?: Lead['qualification']
      accessToken?: string
      createdAt: string
      updatedAt: string
    }>

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    if (!row) {
      return null
    }
    return {
      id: row.id,
      answers: row.answers as LeadContext['answers'],
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata as LeadContext['metadata'] | undefined,
      qualification: row.qualification as Lead['qualification'] | undefined,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  } else {
    // Fallback SQLite
    await initSQLite()
    if (!sqliteDb) {
      throw new Error('Aucune base de données configurée.')
    }

    const stmt = sqliteDb.prepare(`
      SELECT
        id,
        answers,
        completed_at as completedAt,
        step_count as stepCount,
        metadata,
        qualification,
        access_token as accessToken,
        created_at as createdAt,
        updated_at as updatedAt
      FROM leads
      WHERE id = ?
    `)

    const row = stmt.get(id) as any

    if (!row) {
      return null
    }

    return {
      id: row.id,
      answers: JSON.parse(row.answers),
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      qualification: row.qualification ? JSON.parse(row.qualification) : undefined,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }
}

/**
 * Récupère un lead par son ID et son token d'accès
 * @param id L'ID du lead à récupérer
 * @param token Le token d'accès
 * @returns Le lead ou null s'il n'existe pas ou si le token est invalide
 */
export async function getLeadByIdAndToken(id: number, token: string): Promise<Lead | null> {
  if (usePostgres && sql) {
    const result = await sql`
      SELECT
        id,
        answers,
        completed_at as "completedAt",
        step_count as "stepCount",
        metadata,
        qualification,
        access_token as "accessToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      WHERE id = ${id} AND access_token = ${token}
    ` as Array<{
      id: number
      answers: LeadContext['answers']
      completedAt: string
      stepCount: number
      metadata?: LeadContext['metadata']
      qualification?: Lead['qualification']
      accessToken?: string
      createdAt: string
      updatedAt: string
    }>

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    if (!row) {
      return null
    }
    return {
      id: row.id,
      answers: row.answers as LeadContext['answers'],
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata as LeadContext['metadata'] | undefined,
      qualification: row.qualification as Lead['qualification'] | undefined,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  } else {
    // Fallback SQLite
    await initSQLite()
    if (!sqliteDb) {
      throw new Error('Aucune base de données configurée.')
    }

    const stmt = sqliteDb.prepare(`
      SELECT
        id,
        answers,
        completed_at as completedAt,
        step_count as stepCount,
        metadata,
        qualification,
        access_token as accessToken,
        created_at as createdAt,
        updated_at as updatedAt
      FROM leads
      WHERE id = ? AND access_token = ?
    `)

    const row = stmt.get(id, token) as any

    if (!row) {
      return null
    }

    return {
      id: row.id,
      answers: JSON.parse(row.answers),
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      qualification: row.qualification ? JSON.parse(row.qualification) : undefined,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }
}

/**
 * Récupère tous les leads (optionnel, pour debug/admin)
 * @param limit Nombre maximum de leads à récupérer
 * @param offset Offset pour la pagination
 * @returns Liste des leads
 */
export async function getAllLeads(limit: number = 100, offset: number = 0): Promise<Lead[]> {
  if (usePostgres && sql) {
    const result = await sql`
      SELECT
        id,
        answers,
        completed_at as "completedAt",
        step_count as "stepCount",
        metadata,
        access_token as "accessToken",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as Array<{
      id: number
      answers: LeadContext['answers']
      completedAt: string
      stepCount: number
      metadata?: LeadContext['metadata']
      accessToken?: string
      createdAt: string
      updatedAt: string
    }>

    return result.map(row => ({
      id: row.id,
      answers: row.answers,
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  } else {
    // Fallback SQLite
    await initSQLite()
    if (!sqliteDb) {
      throw new Error('Aucune base de données configurée.')
    }

    const stmt = sqliteDb.prepare(`
      SELECT
        id,
        answers,
        completed_at as completedAt,
        step_count as stepCount,
        metadata,
        access_token as accessToken,
        created_at as createdAt,
        updated_at as updatedAt
      FROM leads
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)

    const rows = stmt.all(limit, offset) as any[]

    return rows.map(row => ({
      id: row.id,
      answers: JSON.parse(row.answers),
      completedAt: row.completedAt,
      stepCount: row.stepCount,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      accessToken: row.accessToken || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  }
}

/**
 * Compte le nombre total de leads
 * @returns Le nombre total de leads
 */
export async function countLeads(): Promise<number> {
  if (usePostgres && sql) {
    const result = await sql`SELECT COUNT(*) as count FROM leads` as Array<{ count: string | number }>
    const count = result[0]?.count
    if (count === undefined) {
      return 0
    }
    return typeof count === 'string' ? parseInt(count, 10) : count
  } else {
    // Fallback SQLite
    await initSQLite()
    if (!sqliteDb) {
      throw new Error('Aucune base de données configurée.')
    }

    const stmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM leads')
    const result = stmt.get() as { count: number }
    return result.count
  }
}

/**
 * Ferme la connexion à la base de données (utile pour les tests ou l'arrêt propre)
 */
export function closeDatabase(): void {
  if (sqliteDb) {
    sqliteDb.close()
    sqliteDb = null
    sqliteInitialized = false
    console.log('[DB] Connexion SQLite fermée')
  }
  // Note: Neon gère automatiquement les connexions, pas besoin de fermer
}
