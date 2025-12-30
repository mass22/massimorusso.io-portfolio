// https://nuxt.com/docs/api/configuration/nuxt-config
/* eslint-disable */
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'nuxt-studio',
    'motion-v/nuxt'
  ],
  app: {
    head: {
      link: [
        // Préchargement DNS pour les ressources externes (si utilisées)
        {
          rel: 'dns-prefetch',
          href: 'https://picsum.photos'
        },
        {
          rel: 'dns-prefetch',
          href: 'https://images.unsplash.com'
        }
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover'
        }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },
  studio: {
    // Route d'administration Studio (par défaut: '/_studio')
    route: '/_studio',
    // Configuration du dépôt Git
    repository: {
      provider: 'github', // 'github' ou 'gitlab'
      owner: 'mass22', // Votre nom d'utilisateur GitHub
      repo: 'massimorusso.io-portfolio', // Nom du dépôt
      branch: 'main' // Branche sur laquelle commiter (par défaut: main)
    }
  },
  build: {
    transpile: ['motion-v']
  },
  routeRules: {
    // Empêcher l'indexation des pages de leads
    '/lead/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet'
      }
    },
    '/': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/a-propos': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/about': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services/architecture-frontend': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/frontend-architecture': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services/aide-decision-technique': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/technical-decision-support': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services/ia-pragmatique': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/pragmatic-ai': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/contact': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/ressources': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/ressources': {
      redirect: { to: '/en/resources', statusCode: 301 }
    },
    '/resources': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/resources': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/about': {
      redirect: { to: '/a-propos', statusCode: 301 }
    },
    '/speaking': {
      redirect: { to: '/conferences', statusCode: 301 }
    },
    '/conferences': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/speaking': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/blog': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/blog': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/blog/**': {
      isr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, must-revalidate'
      }
    },
    // Headers de cache pour les assets statiques
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/favicon.ico': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/hero/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // Cache pour les images optimisées par Nuxt Image (IPX)
    '/_ipx/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // Cache pour les images de services
    '/services/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },
  experimental: {
    payloadExtraction: false,
    viewTransition: false
  },
  compatibilityDate: '2025-11-08',
  nitro: {
    compressPublicAssets: true,
    minify: true,
    sourceMap: true, // Source maps pour le code serveur
    // Optimisations pour réduire la taille des bundles
    esbuild: {
      options: {
        treeShaking: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
        legalComments: 'none' // Supprimer les commentaires légaux pour réduire la taille
      }
    },
    experimental: {
      wasm: true
    }
    // La compression HTTP (gzip/brotli) est gérée automatiquement par Nitro avec compressPublicAssets
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: false, // Force le CSS dans un seul fichier pour éviter le chargement asynchrone
      minify: 'esbuild', // Utiliser esbuild pour une minification plus rapide et efficace
      sourcemap: 'hidden', // Source maps cachés (disponibles pour débogage mais pas chargés automatiquement)
      // Note: Les warnings Tailwind CSS concernant les source maps sont normaux et non critiques
      // Lighthouse vérifie principalement les source maps JavaScript, pas CSS
      rollupOptions: {
        // Laisser Nuxt gérer le code splitting automatiquement
        // Tree-shaking standard (suffisant pour Nuxt)
        treeshake: {
          preset: 'recommended'
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:math";'
        }
      }
    },
    // Optimisations supplémentaires
    optimizeDeps: {
      include: ['vue', '@nuxt/ui', '@vueuse/core'],
      // Exclure les dépendances natives qui causent des erreurs
      exclude: [
        'lightningcss',
        '@tailwindcss/oxide',
        '@tailwindcss/oxide-darwin-arm64',
        '@tailwindcss/oxide-darwin-x64',
        '@tailwindcss/oxide-linux-x64-gnu',
        '@tailwindcss/oxide-linux-arm64-gnu',
        '@tailwindcss/oxide-win32-x64-msvc',
        'fsevents',
        'better-sqlite3'
      ]
    },
    // Optimisation de la résolution des modules pour réduire la taille
    resolve: {
      dedupe: ['vue', '@nuxt/ui']
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    locales: [
      {
        code: 'fr',
        iso: 'fr-CA',
        language: 'fr-CA',
        name: 'Français',
        file: 'fr.json'
      },
      {
        code: 'en',
        iso: 'en',
        language: 'en',
        name: 'English',
        file: 'en.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    restructureDir: '',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://massimorusso.io',
    detectBrowserLanguage: false,
    compilation: {
      strictMessage: false
    },
    bundle: {
      optimizeTranslationDirective: true // Optimiser les directives de traduction
    },
    // Configuration des routes personnalisées par langue
    pages: {
      about: {
        fr: '/a-propos',
        en: '/about'
      },
      speaking: {
        fr: '/conferences',
        en: '/speaking'
      },
      resources: {
        fr: '/ressources',
        en: '/resources'
      },
      // Exclure la route /lead de la localisation i18n
      'lead/[id]': false
    }
  },
  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    domains: ['picsum.photos', 'images.unsplash.com', 'images.pexels.com', 'ui.nuxt.com'],
    presets: {
      hero: {
        modifiers: {
          format: 'webp',
          quality: 80,
          width: 800,
          height: 800
        }
      }
    },
    // Optimisations de performance
    provider: 'ipx',
    ipx: {
      maxAge: 31536000 // 1 an en secondes (géré par le middleware server/middleware/ipx-cache.ts)
    }
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  }
})
