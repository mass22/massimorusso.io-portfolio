# Checklist de configuration Vercel

## ⚠️ Erreur 500 sur /api/leads

Si vous obtenez une erreur 500, suivez cette checklist :

### ✅ Étape 1 : Vérifier que Neon est configuré

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `massimorusso-io-portfolio`
3. Cliquez sur l'onglet **Storage** (dans le menu de gauche)
4. Vérifiez qu'une base de données **Neon** est listée

**Si Neon n'est pas présent :**
- Cliquez sur **Create Database**
- Sélectionnez **Neon** (Serverless Postgres)
- Suivez les instructions pour créer la base de données
- ⚠️ **Important** : Attendez que la création soit terminée (peut prendre 1-2 minutes)

### ✅ Étape 2 : Vérifier les variables d'environnement

1. Dans votre projet Vercel, allez dans **Settings** → **Environment Variables**
2. Vérifiez que `DATABASE_URL` est présent avec une valeur qui commence par `postgresql://`
3. Vérifiez que la variable est disponible pour :
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optionnel)

**Si `DATABASE_URL` n'existe pas :**
- Neon devrait l'avoir créé automatiquement
- Si ce n'est pas le cas, allez dans **Storage** → votre base Neon → **.env.local** et copiez la valeur
- Ajoutez-la manuellement dans **Settings** → **Environment Variables**

### ✅ Étape 3 : Redéployer après configuration

Après avoir configuré Neon ou ajouté `DATABASE_URL` :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez que le déploiement soit terminé

### ✅ Étape 4 : Vérifier les logs

Pour voir l'erreur exacte :

1. Allez dans **Deployments**
2. Ouvrez le dernier déploiement
3. Cliquez sur **Functions** → `/api/leads`
4. Regardez les **Logs** pour voir l'erreur exacte

**Erreurs communes :**

- `Connexion Postgres non initialisée` → `DATABASE_URL` manquant
- `relation "leads" does not exist` → La table sera créée automatiquement à la première requête
- `SSL connection error` → Problème de connexion à Neon, vérifiez que Neon est actif

### ✅ Étape 5 : Tester la connexion

Une fois configuré, testez :

1. Allez sur votre site déployé
2. Remplissez le formulaire de contact
3. Vérifiez que la soumission fonctionne (pas d'erreur 500)

## 🔍 Vérification rapide

Pour vérifier rapidement si tout est configuré :

```bash
# Dans les logs Vercel, vous devriez voir :
[DB] Connexion Neon initialisée
[DB] Base de données Postgres (Neon) initialisée
```

Si vous voyez plutôt :
```
[DB] ⚠️  Postgres requis mais DATABASE_URL non configuré!
```

→ Neon n'est pas configuré ou `DATABASE_URL` est manquant.

## 📝 Notes importantes

- **Neon est gratuit** pour commencer (plan Free)
- La création de la base de données prend généralement 1-2 minutes
- Les tables sont créées automatiquement lors de la première requête
- `DATABASE_URL` est automatiquement injecté par Vercel quand Neon est configuré

## 🆘 Besoin d'aide ?

Si le problème persiste après avoir suivi cette checklist :

1. Vérifiez les logs Vercel pour l'erreur exacte
2. Vérifiez que Neon est actif sur [console.neon.tech](https://console.neon.tech)
3. Vérifiez que `DATABASE_URL` est présent dans les variables d'environnement Vercel

