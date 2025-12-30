# Diagnostic : Emails Resend non envoyés

## Problème : 200 OK mais aucun email reçu

Si vous obtenez un 200 OK mais que les emails ne sont pas envoyés, suivez ce guide de diagnostic.

## 🔍 Étapes de diagnostic

### 1. Vérifier les logs Vercel (PRIORITAIRE)

Les erreurs d'email sont loggées mais ne font pas échouer la requête. Pour les voir :

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Deployments** → dernier déploiement
4. Cliquez sur **Functions** → `/api/leads`
5. Regardez les **Logs** après une soumission de formulaire

**Recherchez ces messages dans les logs :**

#### ✅ Si vous voyez :
```
[Email] 📧 Début de l'envoi d'email pour le lead: 1
[Email] 🔍 Configuration:
[Email]   - FROM_EMAIL: onboarding@resend.dev
[Email]   - ADMIN_EMAIL: votre-email@gmail.com
[Email] ✅ Email envoyé avec succès!
[Email]   ID Resend: re_xxxxx
[Email]   Vérifiez sur: https://resend.com/emails
```
→ L'email a été envoyé ! Vérifiez votre boîte de réception et les spams.

#### ❌ Si vous voyez :
```
[Email] ❌ RESEND_API_KEY n'est pas définie
```
→ Ajoutez `RESEND_API_KEY` dans Vercel → Settings → Environment Variables

#### ❌ Si vous voyez :
```
[Email] ❌ ADMIN_EMAIL n'est pas définie
```
→ Ajoutez `ADMIN_EMAIL` dans Vercel → Settings → Environment Variables

#### ❌ Si vous voyez :
```
[Email] ❌ FROM_EMAIL n'est pas définie
```
→ Ajoutez `FROM_EMAIL` dans Vercel → Settings → Environment Variables

#### ❌ Si vous voyez :
```
[Email] ⚠️  Erreur 403 - Domaine non vérifié dans Resend
```
→ Votre `FROM_EMAIL` n'est pas valide. Utilisez `onboarding@resend.dev` pour les tests.

#### ❌ Si vous voyez :
```
[Email] ❌ Erreur lors de l'envoi de l'email:
[Email]   Status: 400
```
→ Vérifiez le format de votre `FROM_EMAIL` (doit être un email valide)

#### ⚠️ Si vous ne voyez AUCUN log `[Email]` :
→ La fonction `sendAdminLeadEmail` n'est pas appelée. Vérifiez que `consent` est `true` dans la requête.

### 2. Vérifier les variables d'environnement sur Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que ces variables sont présentes :
   - ✅ `RESEND_API_KEY` - Votre clé API Resend (commence par `re_`)
   - ✅ `ADMIN_EMAIL` - L'adresse email qui recevra les notifications
   - ✅ `FROM_EMAIL` - L'adresse email d'envoi
   - ✅ `BASE_URL` - L'URL de base de votre site (optionnel)

**Important** : Ces variables doivent être disponibles pour **Production** (pas seulement Development)

### 3. Configuration Resend pour les tests

Si vous n'avez pas encore vérifié de domaine dans Resend :

1. Allez sur [resend.com](https://resend.com)
2. Connectez-vous à votre compte
3. Dans Vercel, configurez :
   - `RESEND_API_KEY` = votre clé API (depuis [resend.com/api-keys](https://resend.com/api-keys))
   - `FROM_EMAIL` = `onboarding@resend.dev` (email de test Resend)
   - `ADMIN_EMAIL` = votre email personnel (celui avec lequel vous vous êtes inscrit à Resend)

**Note** : Avec `onboarding@resend.dev`, vous pouvez envoyer des emails uniquement à votre email Resend (celui avec lequel vous vous êtes inscrit).

### 4. Vérifier dans Resend Dashboard

1. Allez sur [resend.com/emails](https://resend.com/emails)
2. Vérifiez la liste des emails envoyés
3. Si vous voyez des emails avec statut "Failed", cliquez dessus pour voir l'erreur

**Statuts possibles :**
- ✅ **Sent** - Email envoyé avec succès
- ⚠️ **Failed** - Échec (cliquez pour voir l'erreur)
- 🔄 **Pending** - En attente d'envoi

### 5. Vérifier que consent est true

L'email n'est envoyé que si `consent` est `true`. Vérifiez dans les logs :

```
[API] 📧 Tentative d'envoi d'email pour le lead: 1
```

Si vous ne voyez pas ce message, c'est que `consent` est `false` ou manquant.

## 🔧 Solutions aux problèmes courants

### Problème : Aucun log `[Email]` dans Vercel

**Cause** : La fonction `sendAdminLeadEmail` n'est pas appelée

**Solutions :**
1. Vérifiez que `consent` est `true` dans la requête POST
2. Vérifiez les logs pour voir si le lead est créé avec succès
3. Vérifiez que le code arrive bien à la ligne `if (data.consent)`

### Problème : Logs montrent "Email envoyé avec succès" mais rien dans Resend

**Cause** : Possible problème de compte Resend ou email dans les spams

**Solutions :**
1. Vérifiez que vous êtes connecté au bon compte Resend
2. Vérifiez votre dossier spam/courrier indésirable
3. Vérifiez que `ADMIN_EMAIL` correspond à votre email Resend (pour les tests avec `onboarding@resend.dev`)

### Problème : Erreur 403 - Domaine non vérifié

**Cause** : `FROM_EMAIL` n'est pas valide pour Resend

**Solution :**
- **Pour les tests** : Utilisez `onboarding@resend.dev` comme `FROM_EMAIL`
- **Pour la production** : Vérifiez votre domaine sur [resend.com/domains](https://resend.com/domains)

### Problème : Variables d'environnement non injectées

**Cause** : Variables configurées mais pas disponibles pour Production

**Solution :**
1. Vérifiez que les variables sont disponibles pour **Production**
2. **Redéployez** le projet après avoir ajouté/modifié les variables
3. Vérifiez les logs pour confirmer que les variables sont présentes

## 📝 Checklist de vérification

- [ ] `RESEND_API_KEY` est configurée dans Vercel
- [ ] `ADMIN_EMAIL` est configurée dans Vercel
- [ ] `FROM_EMAIL` est configurée dans Vercel (utilisez `onboarding@resend.dev` pour les tests)
- [ ] Les variables sont disponibles pour **Production**
- [ ] Le projet a été **redéployé** après configuration
- [ ] Vous avez vérifié les **logs Vercel** après une soumission
- [ ] Vous avez vérifié le **dashboard Resend** ([resend.com/emails](https://resend.com/emails))
- [ ] Vous avez vérifié votre **dossier spam**

## 🧪 Test rapide

Pour tester rapidement :

1. Configurez les variables d'environnement (voir étape 3)
2. Redéployez
3. Soumettez un formulaire avec `consent: true`
4. Vérifiez les logs Vercel (Functions → `/api/leads`)
5. Vérifiez [resend.com/emails](https://resend.com/emails)

Si vous voyez `[Email] ✅ Email envoyé avec succès!` dans les logs mais rien dans Resend, vérifiez que vous êtes connecté au bon compte Resend.

