# Configuration de l'envoi d'emails avec Resend

Ce document décrit la configuration et l'utilisation du système d'envoi d'emails pour les notifications de leads.

## Vue d'ensemble

Le système utilise [Resend](https://resend.com) pour envoyer des emails de notification lorsqu'un nouveau lead est créé via le chatbot. L'implémentation utilise `$fetch` de Nuxt pour une meilleure compatibilité avec les environnements serverless (Vercel, Netlify, etc.).

## Configuration

### Variables d'environnement requises

Les variables suivantes doivent être configurées dans votre environnement (local et production) :

```bash
# Clé API Resend (obligatoire)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email de l'administrateur qui recevra les notifications (obligatoire)
ADMIN_EMAIL=votre-email@example.com

# Email expéditeur (obligatoire)
# Pour les tests : utilisez "onboarding@resend.dev"
# Pour la production : utilisez une adresse avec votre domaine vérifié
FROM_EMAIL=noreply@votredomaine.com

# URL de base du site (optionnel, défaut: https://massimorusso.io)
BASE_URL=https://massimorusso.io
```

### Configuration sur Vercel

1. Allez dans votre projet Vercel → **Settings** → **Environment Variables**
2. Ajoutez les variables d'environnement pour tous les environnements (Production, Preview, Development)
3. Redéployez votre application

### Configuration locale

Créez un fichier `.env` à la racine du projet :

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
ADMIN_EMAIL=votre-email@example.com
FROM_EMAIL=onboarding@resend.dev
BASE_URL=http://localhost:3000
```

## Obtenir une clé API Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Allez dans **API Keys** dans le dashboard
3. Créez une nouvelle clé API
4. Copiez la clé et ajoutez-la à vos variables d'environnement

## Vérification de domaine (Production)

Pour utiliser votre propre domaine dans `FROM_EMAIL` :

1. Allez dans **Domains** dans le dashboard Resend
2. Ajoutez votre domaine
3. Suivez les instructions pour vérifier le domaine (ajout de records DNS)
4. Une fois vérifié, utilisez une adresse avec ce domaine dans `FROM_EMAIL`

**Note** : Pour les tests et le développement, vous pouvez utiliser `onboarding@resend.dev` sans vérification de domaine.

## Utilisation

### Envoi d'email pour un nouveau lead

La fonction `sendAdminLeadEmail` est appelée automatiquement lors de la création d'un lead via l'API `/api/leads`.

```typescript
import { sendAdminLeadEmail } from '~/server/utils/sendAdminLeadEmail'

const success = await sendAdminLeadEmail({
  email: 'lead@example.com',
  name: 'John Doe',
  context: leadContext,
  qualification: qualificationResult,
  locale: 'fr',
  leadId: 123,
  token: 'access-token'
})
```

### Paramètres

- `email` (string, obligatoire) : Email du lead
- `name` (string, optionnel) : Nom du lead
- `context` (LeadContext, obligatoire) : Contexte complet du lead
- `qualification` (QualificationResult, optionnel) : Résultat de la qualification
- `locale` ('fr' | 'en', optionnel, défaut: 'en') : Langue de l'email
- `leadId` (number, obligatoire) : ID du lead dans la base de données
- `token` (string, obligatoire) : Token d'accès pour voir le lead

### Retour

La fonction retourne `true` si l'email a été envoyé avec succès, `false` sinon.

## Format de l'email

L'email envoyé contient :

1. **Informations de contact** : Email et nom du lead
2. **Qualification** (si disponible) :
   - Score et niveau de match
   - Offre recommandée
   - Raisons de qualification
3. **Résumé** : Résumé textuel du contexte du lead
4. **Contexte complet** : JSON formaté avec toutes les réponses
5. **Lien de visualisation** : URL sécurisée pour voir le lead complet

## Dépannage

### L'email n'est pas envoyé

1. **Vérifiez les variables d'environnement** :
   ```bash
   # Sur Vercel
   vercel env ls
   ```

2. **Vérifiez les logs Vercel** :
   - Allez dans votre projet Vercel → **Deployments** → **Functions** → **View Function Logs**
   - Cherchez les logs `[Email]` pour voir les erreurs

3. **Erreur 403 (Domaine non vérifié)** :
   - Utilisez `onboarding@resend.dev` pour les tests
   - Vérifiez votre domaine sur resend.com pour la production

### L'email est envoyé mais non reçu

1. Vérifiez votre dossier spam
2. Vérifiez les logs Resend dans le dashboard
3. Vérifiez que `ADMIN_EMAIL` est correctement configuré

### Timeout

L'envoi d'email a un timeout de 20 secondes. Si le timeout est atteint :
- Vérifiez votre connexion réseau
- Vérifiez que l'API Resend est accessible depuis Vercel
- Vérifiez les logs pour plus de détails

## Tests

Les tests unitaires sont disponibles dans `tests/server/utils/sendAdminLeadEmail.test.ts`.

Pour exécuter les tests :

```bash
pnpm test tests/server/utils/sendAdminLeadEmail.test.ts
```

## Architecture technique

### Pourquoi `$fetch` au lieu de `fetch` ?

Le système utilise `$fetch` de Nuxt (basé sur `ofetch`) au lieu de `fetch` natif pour :

- **Meilleure compatibilité serverless** : Optimisé pour Vercel, Netlify, etc.
- **Gestion native des timeouts** : Timeout intégré de 20 secondes
- **Meilleure gestion des erreurs** : Erreurs HTTP mieux gérées
- **Support des retries** : Possibilité d'ajouter des retries automatiques si nécessaire

### Flux d'envoi

1. Un lead est créé via `/api/leads`
2. Le lead est sauvegardé dans la base de données (Neon)
3. `sendAdminLeadEmail` est appelée avec les informations du lead
4. La fonction valide les variables d'environnement
5. L'email est généré avec le format approprié
6. `$fetch` est utilisé pour appeler l'API Resend
7. Le résultat est retourné (succès/échec)

## Références

- [Documentation Resend](https://resend.com/docs)
- [Documentation Nuxt $fetch](https://nuxt.com/docs/api/utils/dollarfetch)
- [Guide de dépannage Resend](./RESEND_EMAIL_TROUBLESHOOTING.md)

