import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, existsSync } from 'node:fs'
import type { LeadContext } from '~/types/content'

// Chemin vers la base de données
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'leads.db')

// Instance singleton de la base de données
let db: Database.Database | null = null

/**
 * Initialise la base de données et crée les tables si nécessaire
 */
function initDatabase(): Database.Database {
  if (db) {
    return db
  }

  // Créer le dossier data s'il n'existe pas
  const dataDir = dirname(dbPath)
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  // Ouvrir la connexion à la base de données
  db = new Database(dbPath)

  // Activer les clés étrangères
  db.pragma('foreign_keys = ON')

  // Créer la table leads si elle n'existe pas
  db.exec(`
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

  // Migration : ajouter access_token si la colonne n'existe pas
  try {
    db.exec(`
      ALTER TABLE leads ADD COLUMN access_token TEXT UNIQUE
    `)
  } catch (error: any) {
    // La colonne existe déjà, ignorer l'erreur
    if (!error.message?.includes('duplicate column')) {
      console.warn('[DB] Erreur lors de la migration:', error.message)
    }
  }

  // Migration : ajouter qualification si la colonne n'existe pas
  try {
    db.exec(`
      ALTER TABLE leads ADD COLUMN qualification TEXT
    `)
  } catch (error: any) {
    // La colonne existe déjà, ignorer l'erreur
    if (!error.message?.includes('duplicate column')) {
      console.warn('[DB] Erreur lors de la migration qualification:', error.message)
    }
  }

  // Créer un index sur completed_at pour les requêtes de tri
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_completed_at ON leads(completed_at DESC)
  `)

  // Créer un index sur created_at pour les requêtes de tri
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)
  `)

  // Créer un index sur access_token pour les recherches rapides
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token)
  `)

  console.log(`[DB] Base de données initialisée: ${dbPath}`)

  return db
}

/**
 * Obtient l'instance de la base de données (singleton)
 */
function getDatabase(): Database.Database {
  return initDatabase()
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
export function insertLead(context: LeadContext, accessToken?: string, qualification?: any): number {
  const database = getDatabase()

  const stmt = database.prepare(`
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

/**
 * Récupère un lead par son ID
 * @param id L'ID du lead à récupérer
 * @returns Le lead ou null s'il n'existe pas
 */
export function getLeadById(id: number): Lead | null {
  const database = getDatabase()

  const stmt = database.prepare(`
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
    accessToken: row.accessToken || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

/**
 * Récupère un lead par son ID et son token d'accès
 * @param id L'ID du lead à récupérer
 * @param token Le token d'accès
 * @returns Le lead ou null s'il n'existe pas ou si le token est invalide
 */
export function getLeadByIdAndToken(id: number, token: string): Lead | null {
  const database = getDatabase()

  const stmt = database.prepare(`
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
    accessToken: row.accessToken || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

/**
 * Récupère tous les leads (optionnel, pour debug/admin)
 * @param limit Nombre maximum de leads à récupérer
 * @param offset Offset pour la pagination
 * @returns Liste des leads
 */
export function getAllLeads(limit: number = 100, offset: number = 0): Lead[] {
  const database = getDatabase()

  const stmt = database.prepare(`
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

  return rows.map((row) => ({
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

/**
 * Compte le nombre total de leads
 * @returns Le nombre total de leads
 */
export function countLeads(): number {
  const database = getDatabase()

  const stmt = database.prepare('SELECT COUNT(*) as count FROM leads')
  const result = stmt.get() as { count: number }

  return result.count
}

/**
 * Ferme la connexion à la base de données (utile pour les tests ou l'arrêt propre)
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    console.log('[DB] Connexion fermée')
  }
}

// Initialiser la base de données au chargement du module
if (import.meta.server) {
  initDatabase()
}

