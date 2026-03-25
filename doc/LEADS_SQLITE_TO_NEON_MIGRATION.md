# Migration Leads SQLite -> Neon (Postgres)

## Objectif
Migrer les leads stockés localement en SQLite vers la base Postgres (Neon) utilisée en production.

## Prérequis
1. Un fichier SQLite local contenant la table `leads` (souvent `./data/leads.db`).
2. Une base Neon prête, et l’URL de connexion `DATABASE_URL`.
3. Les variables d’env (si vous exécutez aussi l’admin) :
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_AUTH_SECRET`

## Étapes
1. Vérifier le chemin du SQLite local
   - par défaut le projet utilise `data/leads.db`
   - si tu as une variable `DB_PATH`, utilise-la pour pointer vers le bon fichier

2. Export / import vers Neon
   - Exécuter le script :

   ```bash
   DATABASE_URL="postgresql://..." \
   SQLITE_DB_PATH="./data/leads.db" \
   node scripts/migrate-leads-sqlite-to-neon.mjs
   ```

3. Vérifier rapidement le résultat
   - Compter les lignes dans Neon
   - ouvrir l’admin dashboard et vérifier que les leads historiques apparaissent

4. Activer en production (Vercel)
   - dans Vercel, configurer `DATABASE_URL` (et autres variables Neon si utilisées)
   - redeployer

## Notes importantes
- Le script insère en conservant `id` et `access_token`.
- Si tu relances le script, tu peux avoir des conflits (notamment sur `access_token` unique). Pour une migration “une fois”, c’est le comportement attendu.

