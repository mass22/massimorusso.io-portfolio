# Dépannage : Emails Resend non envoyés

## Problème : 200 OK mais aucun email reçu

Si vous obtenez un 200 OK mais que les emails ne sont pas envoyés, voici comment diagnostiquer :

## 🔍 Diagnostic

### 1. Vérifier les variables d'environnement sur Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que ces variables sont présentes :
   - ✅ `RESEND_API_KEY` - Votre clé API Resend (commence par `re_`)
   - ✅ `ADMIN_EMAIL` - L'adresse email qui recevra les notifications (ex: `votre-email@gmail.com`)
   - ✅ `FROM_EMAIL` - L'adresse email d'envoi (doit être vérifiée dans Resend)
   - ✅ `BASE_URL` - L'URL de base de votre site (ex: `https://massimorusso.io`)

**Important** : Ces variables doivent être disponibles pour **Production** (pas seulement Development)

### 2. Vérifier les logs Vercel

Les erreurs d'email sont loggées mais ne font pas échouer la requête. Pour les voir :

1. Allez dans **Deployments** → dernier déploiement
2. Cliquez sur **Functions** → `/api/leads`
3. Regardez les **Logs** après une soumission de formulaire

**Recherchez ces messages :**

#### Si vous voyez :
```
[Email] RESEND_API_KEY n'est pas définie
```
→ Ajoutez `RESEND_API_KEY` dans les variables d'environnement

#### Si vous voyez :
```
[Email] ADMIN_EMAIL n'est pas définie
```
→ Ajoutez `ADMIN_EMAIL` dans les variables d'environnement

#### Si vous voyez :
```
[Email] FROM_EMAIL n'est pas définie
```
→ Ajoutez `FROM_EMAIL` dans les variables d'environnement

#### Si vous voyez :
```
[Email] ⚠️  Erreur 403 - Domaine non vérifié dans Resend
```
→ Votre domaine n'est pas vérifié dans Resend (voir solution ci-dessous)

#### Si vous voyez :
```
[Email] Erreur lors de l'envoi de l'email: { status: 400, ... }
```
→ Vérifiez le format de l'email FROM (voir solution ci-dessous)

#### Si vous voyez :
```
[Email] Email envoyé avec succès: re_xxxxx
```
→ L'email a été envoyé ! Vérifiez votre boîte de réception et les spams

### 3. Configuration Resend

#### Pour les tests (sans domaine vérifié)

1. Allez sur [resend.com](https://resend.com)
2. Connectez-vous à votre compte
3. Allez dans **API Keys** et créez une clé API
4. Copiez la clé (commence par `re_`)
5. Dans Vercel, ajoutez :
   - `RESEND_API_KEY` = votre clé API
   - `FROM_EMAIL` = `onboarding@resend.dev` (email de test Resend)
   - `ADMIN_EMAIL` = votre email personnel (celui que vous utilisez pour Resend)

**Note** : Avec `onboarding@resend.dev`, vous pouvez envoyer des emails uniquement à votre email Resend (celui avec lequel vous vous êtes inscrit).

#### Pour la production (avec domaine vérifié)

1. Allez sur [resend.com/domains](https://resend.com/domains)
2. Ajoutez votre domaine (ex: `massimorusso.io`)
3. Suivez les instructions pour vérifier le domaine (ajout de records DNS)
4. Une fois vérifié, dans Vercel, configurez :
   - `FROM_EMAIL` = `noreply@massimorusso.io` (ou un autre sous-domaine)
   - `ADMIN_EMAIL` = votre email de réception
   - `RESEND_API_KEY` = votre clé API

### 4. Vérifier dans Resend Dashboard

1. Allez sur [resend.com/emails](https://resend.com/emails)
2. Vérifiez la liste des emails envoyés
3. Si vous voyez des emails avec statut "Failed", cliquez dessus pour voir l'erreur

**Statuts possibles :**
- ✅ **Sent** - Email envoyé avec succès
- ⚠️ **Failed** - Échec (cliquez pour voir l'erreur)
- 🔄 **Pending** - En attente d'envoi

### 5. Test de l'endpoint directement

Pour tester l'envoi d'email directement :

```bash
# Récupérer les variables d'environnement
vercel env pull .env.development.local

# Vérifier que les variables sont présentes
cat .env.development.local | grep RESEND
cat .env.development.local | grep ADMIN_EMAIL
cat .env.development.local | grep FROM_EMAIL

# Tester en local
npm run dev

# Soumettre un formulaire et vérifier les logs du serveur
```

## 🔧 Solutions aux problèmes courants

### Problème : RESEND_API_KEY non configurée

**Solution :**
1. Créez une clé API sur [resend.com/api-keys](https://resend.com/api-keys)
2. Ajoutez-la dans Vercel : **Settings** → **Environment Variables**
3. Nom : `RESEND_API_KEY`
4. Valeur : votre clé API (commence par `re_`)
5. Cochez **Production**, **Preview**, **Development**
6. **Redéployez** le projet

### Problème : Erreur 403 - Domaine non vérifié

**Solution :**
- **Pour les tests** : Utilisez `onboarding@resend.dev` comme `FROM_EMAIL`
- **Pour la production** : Vérifiez votre domaine sur [resend.com/domains](https://resend.com/domains)

### Problème : FROM_EMAIL invalide

**Format valide :**
- ✅ `onboarding@resend.dev` (pour les tests)
- ✅ `noreply@votredomaine.com` (si domaine vérifié)
- ❌ `votre-email@gmail.com` (ne fonctionne pas comme FROM)

### Problème : Emails dans les spams

**Solution :**
- Vérifiez votre dossier spam/courrier indésirable
- Si vous utilisez `onboarding@resend.dev`, les emails peuvent être marqués comme spam
- Pour la production, vérifiez votre domaine et configurez SPF/DKIM dans Resend

## 📝 Checklist de vérification

Avant de tester :

- [ ] `RESEND_API_KEY` est configurée dans Vercel
- [ ] `ADMIN_EMAIL` est configurée dans Vercel
- [ ] `FROM_EMAIL` est configurée dans Vercel
- [ ] `BASE_URL` est configurée dans Vercel
- [ ] Les variables sont disponibles pour **Production**
- [ ] Le projet a été **redéployé** après configuration
- [ ] Vous avez vérifié les **logs Vercel** après une soumission
- [ ] Vous avez vérifié le **dashboard Resend** pour voir les emails

## 🧪 Test rapide

Pour tester rapidement :

1. Configurez les variables d'environnement
2. Redéployez
3. Soumettez un formulaire avec `consent: true`
4. Vérifiez les logs Vercel (Functions → `/api/leads`)
5. Vérifiez [resend.com/emails](https://resend.com/emails)

Si vous voyez `[Email] Email envoyé avec succès: re_xxxxx` dans les logs mais rien dans Resend, vérifiez que vous êtes connecté au bon compte Resend.

