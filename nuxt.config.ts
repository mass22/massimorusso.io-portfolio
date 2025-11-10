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
        }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
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
    experimental: {
      wasm: true
    }
    // La compression HTTP (gzip/brotli) est gérée automatiquement par Nitro avec compressPublicAssets
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: false, // Force le CSS dans un seul fichier pour éviter le chargement asynchrone
      minify: 'esbuild' // Utiliser esbuild pour une minification plus rapide et efficace
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:math";'
        }
      }
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }, i18n: {
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
  }, image: {
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
