# Guide de dépannage - Erreur 500 sur /api/leads

## Problème : Erreur 500 lors de la soumission du formulaire

Si vous obtenez une erreur 500 lors de la soumission du formulaire de leads, voici les étapes de dépannage :

### 1. Vérifier que Neon est configuré

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que `DATABASE_URL` est présent

### 2. Si DATABASE_URL n'existe pas

1. Allez dans l'onglet **Storage** de votre projet Vercel
2. Cliquez sur **Create Database**
3. Sélectionnez **Neon** (Serverless Postgres)
4. Suivez les instructions pour créer la base de données
5. Vercel configurera automatiquement `DATABASE_URL`

### 3. Vérifier les logs Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **Deployments**
3. Ouvrez le dernier déploiement
4. Cliquez sur **Functions** → `/api/leads`
5. Vérifiez les logs pour voir l'erreur exacte

### 4. Erreurs communes

#### "Connexion Postgres non initialisée"
- **Cause** : `DATABASE_URL` n'est pas configuré
- **Solution** : Configurez Neon dans Vercel Storage (voir étape 2)

#### "relation 'leads' does not exist"
- **Cause** : La table n'a pas été créée
- **Solution** : La table sera créée automatiquement lors de la première requête. Si le problème persiste, vérifiez les logs pour voir l'erreur d'initialisation.

#### Erreur de connexion SSL
- **Cause** : Problème de connexion à Neon
- **Solution** : Vérifiez que votre `DATABASE_URL` est correct et que Neon est actif

### 5. Test en local

Pour tester en local avec Neon :

1. Copiez `DATABASE_URL` depuis Vercel (Settings → Environment Variables)
2. Créez un fichier `.env.local` à la racine du projet :
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```
3. Redémarrez le serveur de développement

### 6. Vérifier la connexion Neon

Vous pouvez tester la connexion directement depuis la console Neon :

1. Allez sur [console.neon.tech](https://console.neon.tech)
2. Connectez-vous avec votre compte Vercel
3. Vérifiez que votre base de données est active
4. Testez une requête SQL simple : `SELECT 1;`

## Support

Si le problème persiste :

1. Vérifiez les logs Vercel pour l'erreur exacte
2. Vérifiez que Neon est bien configuré et actif
3. Vérifiez que `DATABASE_URL` est présent dans les variables d'environnement Vercel

