# Nuxt Portfolio Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to create your own portfolio with [Nuxt UI](https://ui.nuxt.com).

- [Live demo](https://portfolio-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/getting-started/installation)

<a href="https://portfolio-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/portfolio-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/portfolio-light.png">
    <img alt="Nuxt Portfolio Template" src="https://ui.nuxt.com/assets/templates/nuxt/portfolio-dark.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/portfolio
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=portfolio&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fportfolio&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fportfolio-dark.png&demo-url=https%3A%2F%2Fportfolio-template.nuxt.dev%2F&demo-title=Nuxt%20Portfolio%20Template&demo-description=A%20sleek%20portfolio%20template%20to%20showcase%20your%20work%2C%20skills%20and%20blog%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Nuxt Studio (Mode Développement)

Nuxt Studio est maintenant configuré ! En mode développement, vous pouvez éditer votre contenu directement depuis le site :

1. Lancez le serveur de développement avec `pnpm dev`
2. Un bouton flottant apparaîtra en bas à gauche pour accéder à l'éditeur
3. Toutes les modifications seront synchronisées en temps réel avec le système de fichiers

> **Note** : Le système de publication n'est disponible qu'en mode production. En développement, utilisez votre workflow habituel (IDE, CLI, GitHub Desktop...) pour publier vos modifications.

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

### Nuxt Studio (Mode Production)

Pour activer Nuxt Studio en production et permettre l'édition du contenu directement depuis votre site déployé, vous devez configurer :

#### 1. Authentification

Configurez un fournisseur d'authentification OAuth. Exemple avec GitHub :

```bash
STUDIO_GITHUB_CLIENT_ID=<votre_client_id>
STUDIO_GITHUB_CLIENT_SECRET=<votre_client_secret>
```

Pour créer une GitHub OAuth App :
1. Allez sur [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Définissez l'URL de callback : `https://votre-domaine.com/_studio/auth/github/callback`
4. Utilisez le Client ID et Client Secret générés

#### 2. Déploiement

Nuxt Studio nécessite des routes côté serveur pour l'authentification. Votre site doit être **déployé sur une plateforme qui supporte le SSR** avec `nuxt build`.

#### 3. Accéder à Studio

Une fois déployé, naviguez vers `/_studio` (ou la route configurée) et authentifiez-vous pour commencer à éditer.

> 📖 Documentation complète : [Nuxt Studio Setup](https://content.nuxt.com/docs/studio/setup)

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
