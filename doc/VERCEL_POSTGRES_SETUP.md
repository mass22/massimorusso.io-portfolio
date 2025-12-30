# Configuration de Neon (Postgres Serverless)

Ce guide explique comment configurer Neon (remplaçant de Vercel Postgres) pour remplacer SQLite dans ce projet.

## Étapes de configuration

### 1. Ajouter Neon à votre projet via Vercel

1. Connectez-vous à votre [tableau de bord Vercel](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database**
5. Sélectionnez **Neon** (Serverless Postgres)
6. Suivez les instructions pour créer la base de données

### 2. Variables d'environnement

Vercel configurera automatiquement la variable d'environnement suivante dans votre projet :

- `DATABASE_URL` - URL de connexion principale (format: `postgresql://user:password@host/database`)

Cette variable est automatiquement injectée dans votre environnement Vercel.

**Note** : Le code accepte aussi `POSTGRES_URL` ou `POSTGRES_PRISMA_URL` pour compatibilité.

### 3. Migration des données (si nécessaire)

Si vous avez des données existantes dans SQLite, vous devrez les migrer manuellement vers Postgres.

### 4. Structure de la base de données

La table `leads` sera automatiquement créée lors de la première utilisation avec la structure suivante :

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  step_count INTEGER NOT NULL,
  metadata JSONB,
  qualification JSONB,
  access_token TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5. Développement local

Pour le développement local, le code utilise automatiquement SQLite si Postgres n'est pas configuré. Pour utiliser Neon en local :

1. Copiez la variable `DATABASE_URL` depuis Vercel (dans les paramètres du projet → Variables d'environnement)
2. Créez un fichier `.env.local` avec :
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

### 6. Différences entre SQLite et Postgres

Le code gère automatiquement les différences :

- **Types de données** : JSONB au lieu de TEXT pour les champs JSON
- **Auto-increment** : SERIAL au lieu de AUTOINCREMENT
- **Dates** : TIMESTAMP au lieu de TEXT avec datetime()
- **Requêtes** : Syntaxe Postgres avec paramètres nommés

## Vérification

Pour vérifier que tout fonctionne :

1. Déployez votre projet sur Vercel
2. Les tables seront créées automatiquement lors de la première requête
3. Vérifiez les logs Vercel pour confirmer l'initialisation

## Support

- [Documentation Neon](https://neon.tech/docs)
- [Documentation @neondatabase/serverless](https://github.com/neondatabase/serverless)
- [Guide de transition Vercel Postgres → Neon](https://neon.com/docs/guides/vercel-postgres-transition-guide)

