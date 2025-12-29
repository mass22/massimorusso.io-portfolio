// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt'
  ],
  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        // Préchargement DNS pour les ressources externes
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
  build: {
    transpile: ['motion-v']
  },
  routeRules: {
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
    '/en/services/architecture-frontend': {
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
    '/en/services/aide-decision-technique': {
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
    '/en/services/ia-pragmatique': {
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
      sourcemap: false, // Pas de sourcemaps en production pour réduire la taille
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
        '@tailwindcss/oxide-win32-x64-msvc'
      ]
    },
    // Optimisation de la résolution des modules pour réduire la taille
    resolve: {
      dedupe: ['vue', '@nuxt/ui']
    },
    // Configuration pour les fichiers .node
    ssr: {
      noExternal: []
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
      }
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
      maxAge: 31536000 // 1 an en secondes
    }
  }
})
