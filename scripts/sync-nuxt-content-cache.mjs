#!/usr/bin/env node
/**
 * Nuxt Content : `nuxt prepare` peut écraser `.nuxt/content/database.compressed.mjs` avec un fichier vide,
 * alors que la base générée (build ou dev précédent) reste dans `node_modules/.cache/nuxt/.nuxt/content/`.
 * Sans dump valide : erreurs "Database integrity check failed", "no such table: _content_blog", etc.
 *
 * Ce script recopie le dossier content du cache vers `.nuxt/content` lorsque la cible est absente,
 * vide ou nettement plus petite que la source (dump tronqué après prepare).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourceDir = path.join(root, 'node_modules/.cache/nuxt/.nuxt/content')
const targetDir = path.join(root, '.nuxt/content')

/** Taille en dessous de laquelle on considère le dump comme invalide. */
const MIN_VALID_BYTES = 512

function size(p) {
  try {
    return fs.statSync(p).size
  } catch {
    return 0
  }
}

const sourceDb = path.join(sourceDir, 'database.compressed.mjs')
const targetDb = path.join(targetDir, 'database.compressed.mjs')

const sourceSize = size(sourceDb)
const targetSize = size(targetDb)

if (sourceSize < MIN_VALID_BYTES) {
  console.warn(
    '[sync-nuxt-content-cache] Aucune base Content valide dans le cache (node_modules/.cache/nuxt/.nuxt/content). '
    + 'Lancez une fois `pnpm build` ou un `pnpm dev` complet pour générer le cache, puis relancez ce script ou `pnpm postinstall`.'
  )
  process.exit(0)
}

const needsCopy = targetSize < MIN_VALID_BYTES || targetSize < sourceSize

if (!needsCopy) {
  process.exit(0)
}

fs.mkdirSync(targetDir, { recursive: true })
for (const name of fs.readdirSync(sourceDir)) {
  fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name))
}
console.log('[sync-nuxt-content-cache] Base Nuxt Content restaurée depuis node_modules/.cache/nuxt/.nuxt/content → .nuxt/content')
