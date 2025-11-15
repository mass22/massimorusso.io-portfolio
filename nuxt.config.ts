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
    '/services/**': {
      isr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, must-revalidate'
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
        minifyWhitespace: true
      }
    },
    experimental: {
      wasm: true
    },
    // La compression HTTP (gzip/brotli) est gérée automatiquement par Nitro avec compressPublicAssets
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: false, // Force le CSS dans un seul fichier pour éviter le chargement asynchrone
      minify: 'esbuild', // Utiliser esbuild pour une minification plus rapide et efficace
      rollupOptions: {
        output: {
          // Optimisation du code splitting pour réduire le JavaScript non utilisé
          manualChunks: (id) => {
            // Séparer les dépendances vendor
            if (id.includes('node_modules')) {
              // Séparer les grandes bibliothèques
              if (id.includes('vue')) return 'vue-vendor'
              if (id.includes('@nuxt/ui')) return 'nuxt-ui'
              if (id.includes('motion-v')) return 'motion'
              // Regrouper les autres dépendances
              return 'vendor'
            }
          }
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
      strictMessage: false
    },
    bundle: {
      optimizeTranslationDirective: false
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
