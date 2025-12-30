# Test de connexion Neon

## Endpoint de test créé

Un endpoint de test a été créé pour vérifier la connexion à Neon : `/api/db-version`

Cet endpoint suit le guide officiel Neon : https://neon.tech/docs/guides/nuxt

## Utilisation

### En local

1. Assurez-vous d'avoir `DATABASE_URL` dans votre `.env.local` :
   ```bash
   vercel env pull .env.development.local
   ```

2. Démarrez le serveur :
   ```bash
   npm run dev
   ```

3. Testez l'endpoint :
   ```bash
   curl http://localhost:3000/api/db-version
   ```

   Ou ouvrez dans votre navigateur : http://localhost:3000/api/db-version

### Sur Vercel

1. Déployez votre projet
2. Testez l'endpoint :
   ```bash
   curl https://votre-domaine.vercel.app/api/db-version
   ```

## Réponse attendue

Si la connexion fonctionne :
```json
{
  "version": "PostgreSQL 17.5 on x86_64-pc-linux-gnu...",
  "connected": true,
  "databaseUrl": "postgresql://user:****@host.neon.tech/database",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Si la connexion échoue :
```json
{
  "statusCode": 500,
  "statusMessage": "Database connection failed",
  "data": {
    "message": "Erreur de connexion à la base de données",
    "error": "..."
  }
}
```

## Vérification de votre implémentation

Votre implémentation est conforme au guide Neon :

✅ **Package installé** : `@neondatabase/serverless` (v0.9.5)
✅ **Import correct** : `import { neon } from '@neondatabase/serverless'`
✅ **Connexion** : `sql = neon(process.env.DATABASE_URL!)`
✅ **Routes serveur** : Dans `server/api/` comme recommandé
✅ **Utilisation** : Template tags SQL avec `sql\`SELECT ...\``

## Différences avec le guide

Le guide montre un exemple simple, mais votre implémentation est plus robuste :

1. **Gestion d'erreurs** : Gestion complète des erreurs avec messages clairs
2. **Fallback SQLite** : Support de SQLite pour le développement local
3. **Initialisation automatique** : Création automatique des tables
4. **Réinitialisation** : Réinitialisation de la connexion si nécessaire

## Prochaines étapes

1. Testez l'endpoint `/api/db-version` pour vérifier la connexion
2. Si cela fonctionne, votre endpoint `/api/leads` devrait aussi fonctionner
3. Vérifiez les logs Vercel pour confirmer l'initialisation

