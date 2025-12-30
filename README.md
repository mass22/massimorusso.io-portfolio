# Website Massimo Russo

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.1-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.0.1-00DC82)](https://ui.nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

Professional website of Massimo Russo, senior frontend architecture consultant and AI advisor. Bilingual website (French/English) built with Nuxt 4, Nuxt UI, and Nuxt Content.

## ✨ Features

### 🌐 Internationalization
- Bilingual French/English support with `@nuxtjs/i18n`
- Localized routes with language prefix
- Automatic language detection
- Translated content for all pages

### 📝 Blog & Content
- Blog powered by Nuxt Content (Markdown)
- Nuxt Studio for real-time content editing
- Automatic SEO metadata generation
- Optimized images with Nuxt Image (WebP, AVIF)
- Open Graph image support

### 🤖 Intelligent Chatbot
- Chat widget with lead qualification
- Lead capture with integrated form
- Lead storage in Neon database (PostgreSQL)
- Email notifications via Resend
- Multilingual interface synchronized with the site

### ⚡ Performance
- Prerendering and ISR (Incremental Static Regeneration)
- Image optimization with Nuxt Image
- Automatic code splitting
- HTTP cache configured for static assets
- Public assets compression
- Source maps for debugging

### 🎨 UI/UX
- Design system with Nuxt UI
- Dark mode by default
- Smooth animations with Motion V
- Mobile-first responsive design
- Custom cursor
- "Back to top" button

### 🧪 Code Quality
- Unit tests with Vitest
- Linting with ESLint and Oxlint
- Strict TypeScript
- CI/CD with GitHub Actions
- Renovate for dependency updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- pnpm 10.18.3+ (package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/mass22/massimorusso.io-portfolio.git
cd massimorusso.io-portfolio

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file at the root of the project:

```env
# Neon Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@massimorusso.io
RESEND_ADMIN_EMAIL=admin@massimorusso.io

# Site
NUXT_PUBLIC_SITE_URL=https://massimorusso.io

# Nuxt Studio (optional, for production editing)
STUDIO_GITHUB_CLIENT_ID=your_github_client_id
STUDIO_GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Development

```bash
# Start the development server
pnpm dev

# The site will be available at http://localhost:3000
```

#### Nuxt Studio (Development Mode)

In development mode, Nuxt Studio is automatically available:

1. Start the server with `pnpm dev`
2. A floating button appears at the bottom left to access the editor
3. All changes are synchronized in real-time with the file system

> **Note**: The publishing system is only available in production mode. In development, use your usual workflow (IDE, CLI, GitHub Desktop...) to publish your changes.

### Production

```bash
# Build for production
pnpm build

# Preview the build locally
pnpm preview
```

## 📁 Project Structure

```
├── app/
│   ├── components/          # Reusable Vue components
│   │   ├── chatbot/        # Chat widget and qualification
│   │   ├── landing/        # Homepage sections
│   │   └── ...
│   ├── composables/        # Nuxt composables
│   ├── layouts/            # Page layouts
│   ├── pages/              # Application routes
│   ├── plugins/            # Nuxt plugins
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utilities
├── content/                # Markdown and YAML content
│   ├── blog/              # Blog posts
│   └── services/          # Service pages
├── locales/               # i18n translation files
├── public/                # Static assets
├── server/                # API routes and server utilities
│   ├── api/              # API endpoints
│   └── utils/            # Server utilities (DB, email, etc.)
├── tests/                 # Unit tests
└── nuxt.config.ts        # Nuxt configuration
```

## 🛠️ Technologies Used

### Core
- **[Nuxt 4](https://nuxt.com)** - Full-stack Vue.js framework
- **[Vue 3](https://vuejs.org)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing

### UI & Design
- **[Nuxt UI](https://ui.nuxt.com)** - Tailwind CSS-based UI components
- **[Motion V](https://motion-v.com)** - Vue animations
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

### Content & CMS
- **[Nuxt Content](https://content.nuxt.com)** - Markdown-based headless CMS
- **[Nuxt Studio](https://content.nuxt.com/docs/studio)** - Visual content editor

### Internationalization
- **[@nuxtjs/i18n](https://i18n.nuxtjs.org)** - Internationalization

### Database
- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[@neondatabase/serverless](https://github.com/neondatabase/serverless-js)** - Neon driver

### Email
- **[Resend](https://resend.com)** - Transactional email service

### Images
- **[Nuxt Image](https://image.nuxt.com)** - Image optimization
- **[Sharp](https://sharp.pixelplumbing.com)** - Image processing

### Testing
- **[Vitest](https://vitest.dev)** - Testing framework
- **[Vue Test Utils](https://test-utils.vuejs.org)** - Vue testing utilities

### Linting & Formatting
- **[ESLint](https://eslint.org)** - JavaScript/TypeScript linter
- **[Oxlint](https://oxc-project.github.io)** - Fast linter

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm preprod          # Build + preview on port 3001

# Code Quality
pnpm lint             # Lint with ESLint
pnpm lint:fix         # Lint and auto-fix
pnpm lint:oxlint      # Lint with Oxlint
pnpm lint:oxlint:fix  # Lint and fix with Oxlint
pnpm typecheck        # Check TypeScript types

# Tests
pnpm test             # Run tests with Vitest
```

## 🚢 Deployment

The project is configured to be deployed on **Vercel**:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deployment happens automatically on every push to `main`

### Vercel Configuration

The following environment variables must be configured in Vercel:

- `DATABASE_URL` - Neon PostgreSQL connection URL
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Sender email
- `RESEND_ADMIN_EMAIL` - Notification recipient email
- `NUXT_PUBLIC_SITE_URL` - Public site URL

### Nuxt Studio in Production

To enable Nuxt Studio in production:

1. Create a GitHub OAuth App at [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Set the callback URL: `https://your-domain.com/_studio/auth/github/callback`
3. Add environment variables:
   - `STUDIO_GITHUB_CLIENT_ID`
   - `STUDIO_GITHUB_CLIENT_SECRET`
4. Access `/_studio` on your deployed site

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

Tests are organized in the `tests/` folder and cover:
- Components (chatbot, qualification)
- Composables (blog posts, page data)
- Utilities (links, markdown)
- Server API routes

## 📚 Documentation

### Configuration

- **Nuxt Config** : `nuxt.config.ts` - Main configuration
- **Content Config** : `content.config.ts` - Content configuration
- **i18n Config** : `i18n.config.ts` - Internationalization configuration
- **App Config** : `app/app.config.ts` - Application configuration

### Available Guides

- `doc/VERCEL_SETUP_CHECKLIST.md` - Vercel setup checklist
- `doc/VERCEL_NEON_VERIFICATION.md` - Neon connection verification
- `doc/EMAIL_SETUP.md` - Email setup with Resend
- `doc/TROUBLESHOOTING.md` - Troubleshooting guide

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and owned by Massimo Russo.

## 👤 Author

**Massimo Russo**

- Website: [massimorusso.io](https://massimorusso.io)
- LinkedIn: [@russomassimo-frontend-consultant](https://www.linkedin.com/in/russomassimo-frontend-consultant)
- Bluesky: [@massimorusso.bsky.social](https://bsky.app/profile/massimorusso.bsky.social)

## 🙏 Acknowledgments

- [Nuxt](https://nuxt.com) - Amazing framework for Vue.js
- [Nuxt UI](https://ui.nuxt.com) - Elegant UI components
- [Nuxt Content](https://content.nuxt.com) - Powerful headless CMS
- [Vercel](https://vercel.com) - Exceptional deployment platform
- [Neon](https://neon.tech) - High-performance serverless PostgreSQL

---

Made with ❤️ using Nuxt 4
