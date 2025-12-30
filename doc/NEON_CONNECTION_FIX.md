# Correction de la connexion Neon sur Vercel

## Problème : La base de données n'était pas connectée au projet

Si Neon existe mais n'est pas connecté à votre projet Vercel, voici comment corriger :

## 🔧 Étapes de correction

### 1. Vérifier que Neon est dans votre projet

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `massimorusso-io-portfolio`
3. Allez dans l'onglet **Storage** (menu de gauche)
4. Vérifiez qu'une base de données **Neon** est listée

**Si Neon n'apparaît pas :**
- Cliquez sur **Create Database**
- Sélectionnez **Neon** (Serverless Postgres)
- Suivez les instructions pour créer la base de données

### 2. Vérifier la variable DATABASE_URL

1. Dans votre projet Vercel, allez dans **Settings** → **Environment Variables**
2. Vérifiez que `DATABASE_URL` est présent

**Si `DATABASE_URL` n'existe pas :**

#### Option A : Depuis Storage (méthode recommandée)
1. Allez dans **Storage** → votre base Neon
2. Cliquez sur **.env.local** ou **Connection String**
3. Copiez la valeur de `DATABASE_URL` (elle ressemble à `postgresql://user:password@host.neon.tech/database?sslmode=require`)
4. Allez dans **Settings** → **Environment Variables**
5. Cliquez sur **Add New**
6. Nom : `DATABASE_URL`
7. Valeur : collez la valeur copiée
8. Cochez **Production**, **Preview**, et **Development**
9. Cliquez sur **Save**

#### Option B : Depuis l'intégration Neon
1. Allez dans **Storage** → votre base Neon
2. Cliquez sur **Settings** ou **Configuration**
3. Vérifiez que l'intégration est bien liée à votre projet
4. Si ce n'est pas le cas, cliquez sur **Link to Project** ou **Connect**

### 3. Vérifier que l'intégration est active

1. Allez dans **Settings** → **Integrations**
2. Vérifiez que **Neon** est listé et actif
3. Si ce n'est pas le cas :
   - Cliquez sur **Browse Integrations**
   - Recherchez **Neon**
   - Cliquez sur **Add Integration**
   - Suivez les instructions

### 4. Redéployer le projet

**Important** : Après avoir ajouté/modifié `DATABASE_URL`, vous DEVEZ redéployer :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋮) du dernier déploiement
3. Sélectionnez **Redeploy**
4. ⚠️ **Cochez "Use existing Build Cache"** si vous voulez un redéploiement rapide
5. Cliquez sur **Redeploy**
6. Attendez que le déploiement soit terminé

### 5. Vérifier la connexion

Après le redéploiement, testez l'endpoint de vérification :

```bash
curl https://votre-domaine.vercel.app/api/db-version
```

**Réponse attendue si la connexion fonctionne :**
```json
{
  "version": "PostgreSQL 17.5 on x86_64-pc-linux-gnu...",
  "connected": true,
  "databaseUrl": "postgresql://user:****@host.neon.tech/database",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Si vous obtenez une erreur 500 :**
- Vérifiez les logs Vercel (voir étape 6)

### 6. Vérifier les logs Vercel

Pour voir ce qui se passe exactement :

1. Allez dans **Deployments** → dernier déploiement
2. Cliquez sur **Functions** → `/api/db-version` ou `/api/leads`
3. Regardez les **Logs**

**Vous devriez voir :**
```
[DB] Connexion Neon initialisée
[DB] Base de données Postgres (Neon) initialisée
```

**Si vous voyez plutôt :**
```
[DB] ⚠️  Postgres requis mais DATABASE_URL non configuré!
```

→ La variable `DATABASE_URL` n'est pas correctement injectée dans l'environnement de production.

### 7. Vérifier les environnements

Assurez-vous que `DATABASE_URL` est disponible pour **tous les environnements** :

1. Allez dans **Settings** → **Environment Variables**
2. Trouvez `DATABASE_URL`
3. Vérifiez que les cases suivantes sont cochées :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** (optionnel, pour tester en local)

Si une case n'est pas cochée :
1. Cliquez sur `DATABASE_URL`
2. Cochez les environnements manquants
3. Cliquez sur **Save**
4. **Redéployez** (étape 4)

## 🔍 Diagnostic rapide

### Checklist de vérification

- [ ] Neon est présent dans **Storage**
- [ ] `DATABASE_URL` existe dans **Environment Variables**
- [ ] `DATABASE_URL` est disponible pour **Production**
- [ ] L'intégration Neon est active dans **Integrations**
- [ ] Le projet a été **redéployé** après configuration
- [ ] Les logs montrent "Connexion Neon initialisée"
- [ ] L'endpoint `/api/db-version` fonctionne

### Test en local

Pour tester en local avec la même configuration :

```bash
# Récupérer les variables d'environnement depuis Vercel
vercel env pull .env.development.local

# Vérifier que DATABASE_URL est présent
cat .env.development.local | grep DATABASE_URL

# Démarrer le serveur
npm run dev

# Tester l'endpoint
curl http://localhost:3000/api/db-version
```

## 🆘 Problèmes courants

### Problème : DATABASE_URL existe mais n'est pas injectée

**Solution :**
1. Vérifiez que la variable est disponible pour **Production**
2. Redéployez le projet
3. Vérifiez les logs pour confirmer

### Problème : L'intégration Neon n'est pas liée au projet

**Solution :**
1. Allez dans **Storage** → votre base Neon
2. Vérifiez dans les paramètres que le projet est bien lié
3. Si ce n'est pas le cas, reconnectez l'intégration

### Problème : La base de données est en pause

**Solution :**
1. Allez dans **Storage** → votre base Neon
2. Si le statut est "Paused", cliquez sur **Resume** ou **Start**
3. Attendez que la base soit active

## ✅ Vérification finale

Une fois tout configuré :

1. ✅ `/api/db-version` retourne la version PostgreSQL
2. ✅ `/api/leads` accepte les requêtes POST sans erreur 500
3. ✅ Les logs Vercel montrent "Connexion Neon initialisée"
4. ✅ Le formulaire de contact fonctionne sur votre site

Si tout cela fonctionne, votre base de données est correctement connectée ! 🎉

