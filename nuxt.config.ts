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
    '/about': {
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
    '/services/consulting': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/consulting': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services/workshops': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/workshops': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/services/audit': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/en/services/audit': {
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
    '/projects': {
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
    '/speaking': {
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
        output: {
          // Optimisation du code splitting pour réduire le JavaScript non utilisé
          manualChunks: (id) => {
            // Séparer les dépendances vendor
            if (id.includes('node_modules')) {
              // Séparer les grandes bibliothèques
              if (id.includes('@nuxt/ui')) {
                return 'nuxt-ui'
              }
              if (id.includes('@nuxt/content')) {
                return 'nuxt-content'
              }
              if (id.includes('@nuxtjs/i18n')) {
                return 'i18n'
              }
              if (id.includes('motion-v')) {
                return 'motion'
              }
              if (id.includes('@vueuse')) {
                return 'vueuse'
              }
              // Autres vendor dans un chunk séparé
              return 'vendor'
            }
          },
          // Optimisation des noms de chunks pour le cache
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return 'img/[name]-[hash][extname]'
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return 'fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        },
        // Tree-shaking agressif
        treeshake: {
          moduleSideEffects: false,
          preset: 'recommended',
          propertyReadSideEffects: false
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
        iso: 'fr-FR',
        language: 'fr-FR',
        name: 'Français',
        file: 'fr.json'
      },
      {
        code: 'en',
        iso: 'en-US',
        language: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    restructureDir: '',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://massimorusso.io',
    detectBrowserLanguage: {
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      useCookie: true,
      alwaysRedirect: false
    },
    compilation: {
      strictMessage: false,
      jit: true // Compilation JIT pour réduire la taille du bundle
    },
    bundle: {
      optimizeTranslationDirective: true // Optimiser les directives de traduction
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
