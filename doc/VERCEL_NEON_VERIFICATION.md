# Vérification de la configuration Neon sur Vercel

## ✅ Neon est déjà intégré !

D'après votre URL, Neon est déjà configuré dans votre projet Vercel. Voici comment vérifier que tout fonctionne :

## 🔍 Étapes de vérification

### 1. Vérifier les variables d'environnement

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `massimorusso-io-portfolio`
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que `DATABASE_URL` est présent avec une valeur qui ressemble à :
   ```
   postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

**Si `DATABASE_URL` n'est pas présent :**
- Allez dans **Storage** → votre base Neon
- Cliquez sur **.env.local** ou **Connection String**
- Copiez la valeur de `DATABASE_URL`
- Ajoutez-la dans **Settings** → **Environment Variables** pour Production, Preview et Development

### 2. Accéder aux guides Neon

Pour accéder aux guides Neon depuis Vercel :

1. Allez dans **Storage** → votre base Neon
2. Cliquez sur **Guides** ou **Documentation**
3. Vous y trouverez :
   - Comment se connecter à la base de données
   - Exemples de requêtes
   - Gestion des migrations
   - Bonnes pratiques

### 3. Vérifier que la base de données est active

1. Allez dans **Storage** → votre base Neon
2. Vérifiez le statut (devrait être "Active" ou "Running")
3. Si ce n'est pas le cas, cliquez sur **Resume** ou **Start**

### 4. Tester la connexion

Pour tester que la connexion fonctionne :

1. Allez dans **Storage** → votre base Neon
2. Cliquez sur **Query** ou **SQL Editor**
3. Exécutez une requête simple :
   ```sql
   SELECT 1;
   ```
4. Si cela fonctionne, la connexion est OK

### 5. Vérifier les logs Vercel

Après un redéploiement, vérifiez les logs :

1. Allez dans **Deployments** → dernier déploiement
2. Cliquez sur **Functions** → `/api/leads`
3. Regardez les logs au démarrage

**Vous devriez voir :**
```
[DB] Connexion Neon initialisée
[DB] Base de données Postgres (Neon) initialisée
```

**Si vous voyez plutôt :**
```
[DB] ⚠️  Postgres requis mais DATABASE_URL non configuré!
```

→ La variable `DATABASE_URL` n'est pas correctement configurée.

## 🔧 Résolution des problèmes courants

### Problème : DATABASE_URL existe mais l'erreur 500 persiste

**Solutions :**
1. Vérifiez que `DATABASE_URL` est disponible pour **Production** (pas seulement Development)
2. Redéployez le projet après avoir ajouté/modifié la variable
3. Vérifiez les logs pour voir l'erreur exacte

### Problème : La table "leads" n'existe pas

**Solution :** C'est normal ! La table sera créée automatiquement lors de la première requête POST vers `/api/leads`. Vérifiez les logs pour confirmer la création.

### Problème : Erreur SSL ou de connexion

**Solutions :**
1. Vérifiez que votre `DATABASE_URL` contient `?sslmode=require`
2. Vérifiez que Neon est actif (pas en pause)
3. Vérifiez que votre projet Vercel a accès à Neon (même compte/organisation)

## 📝 Checklist finale

Avant de tester votre formulaire :

- [ ] Neon est configuré dans Vercel Storage
- [ ] `DATABASE_URL` est présent dans Environment Variables
- [ ] `DATABASE_URL` est disponible pour Production
- [ ] Le projet a été redéployé après configuration
- [ ] Les logs Vercel montrent "Connexion Neon initialisée"
- [ ] La base de données Neon est active (pas en pause)

## 🚀 Test final

Une fois tout configuré :

1. Allez sur votre site déployé
2. Remplissez le formulaire de contact
3. Soumettez le formulaire
4. Vérifiez qu'il n'y a plus d'erreur 500

Si l'erreur persiste, consultez les logs Vercel pour voir l'erreur exacte.

