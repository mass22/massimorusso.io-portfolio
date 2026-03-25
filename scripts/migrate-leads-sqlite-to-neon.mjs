import { neon } from '@neondatabase/serverless'
import fs from 'node:fs'
import path from 'node:path'

const getSqliteDbPath = () => {
  const provided = process.env.SQLITE_DB_PATH || process.env.DB_PATH
  if (provided && provided.trim()) return provided.trim()
  return path.join(process.cwd(), 'data', 'leads.db')
}

const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
}

const main = async () => {
  const sqliteDbPath = getSqliteDbPath()
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    throw new Error('DATABASE_URL (ou POSTGRES_URL / POSTGRES_PRISMA_URL) manquant.')
  }

  if (!fs.existsSync(sqliteDbPath)) {
    throw new Error(`SQLite DB introuvable: ${sqliteDbPath}`)
  }

  console.log('[migrate] SQLite:', sqliteDbPath)

  console.log('[migrate] Neon/Postgres:', databaseUrl.replace(/:[^:@]+@/, ':****@'))

  const sqliteModule = await import('better-sqlite3')
  const Database = sqliteModule.default ?? sqliteModule

  const sqliteDb = new Database(sqliteDbPath)

  const rows = sqliteDb
    .prepare(`
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
      ORDER BY id ASC
    `)
    .all()

  console.log(`[migrate] leads trouvés: ${rows.length}`)

  const sql = neon(databaseUrl)

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

  console.log('[migrate] Table vérifiée (ou créée).')

  let inserted = 0
  for (const row of rows) {
    const answers = JSON.parse(row.answers)
    const metadata = row.metadata ? JSON.parse(row.metadata) : null
    const qualification = row.qualification ? JSON.parse(row.qualification) : null

    // Insérer en gardant l'id (utile pour les liens existants)
    await sql`
      INSERT INTO leads (
        id,
        answers,
        completed_at,
        step_count,
        metadata,
        qualification,
        access_token,
        created_at,
        updated_at
      ) VALUES (
        ${row.id},
        ${JSON.stringify(answers)}::jsonb,
        ${row.completedAt}::timestamp,
        ${row.stepCount},
        ${metadata ? JSON.stringify(metadata) : null}::jsonb,
        ${qualification ? JSON.stringify(qualification) : null}::jsonb,
        ${row.accessToken ?? null},
        ${row.createdAt}::timestamp,
        ${row.updatedAt}::timestamp
      )
    `

    inserted += 1
  }

  await sql`
    SELECT setval(
      pg_get_serial_sequence('leads', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM leads)
    )
  `

  console.log(`[migrate] Import terminé. Insertions: ${inserted}`)
}

main().catch((err) => {
  console.error('[migrate] Erreur:', err)
  process.exit(1)
})
