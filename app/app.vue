<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
import { computed } from 'vue'

const colorMode = useColorMode()
const { locale, t, locales } = useI18n()
const localePath = useLocalePath()
const navLinks = computed(() => {
  try {
    return getNavLinks(t, localePath, locale) || []
  } catch {
    return []
  }
})

const color = computed(() => (colorMode.value === 'dark' ? '#020618' : 'white'))
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()

const siteUrl = computed(() => {
  const explicit = runtimeConfig.public?.siteUrl
  if (explicit && typeof explicit === 'string') {
    return explicit
  }
  const baseFromI18n = runtimeConfig.public?.i18n?.baseUrl
  return (typeof baseFromI18n === 'string' ? baseFromI18n : 'https://massimorusso.io')
})

const toAbsoluteUrl = (path: string) => {
  try {
    return new URL(path, siteUrl.value).toString()
  } catch {
    const base = siteUrl.value.replace(/\/$/, '')
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${base}${normalized}`
  }
}

const canonicalUrl = computed(() => toAbsoluteUrl(route.path || '/'))

const availableLocales = computed(() => {
  const list = locales.value
  return Array.isArray(list) ? list : []
})

const alternateLinks = computed(() => availableLocales.value
  .map((entry) => {
    const localeObj = typeof entry === 'string' ? { code: entry } : entry
    if (!localeObj?.code) {
      return null
    }
    const targetPath = switchLocalePath(localeObj.code)
    if (!targetPath) {
      return null
    }
    const href = toAbsoluteUrl(targetPath)
    // Utiliser iso pour hreflang (fr-CA ou en), sinon fallback sur code
    const hreflang = typeof localeObj === 'string' ? localeObj : (localeObj.iso || localeObj.code)
    return {
      href, hreflang, id: `alt-${localeObj.code}`, rel: 'alternate'
    }
  })
  .filter((link): link is { id: string, rel: string, hreflang: string, href: string } => Boolean(link)))

// X-default doit pointer vers la version française (locale par défaut)
const xDefaultLink = computed(() => {
  const defaultLocalePath = locale.value === 'fr' ? route.path : switchLocalePath('fr')
  const defaultHref = defaultLocalePath ? toAbsoluteUrl(defaultLocalePath) : canonicalUrl.value
  return {
    href: defaultHref, hreflang: 'x-default', id: 'alt-x-default', rel: 'alternate'
  }
})

const i18nHead = useLocaleHead()

useHead(() => {
  const { meta = [], link = [], htmlAttrs = {} } = i18nHead.value
  const filteredLinks = link.filter(linkItem => !['alternate', 'canonical'].includes(linkItem.rel ?? ''))

  return {
    htmlAttrs: {
      ...htmlAttrs,
      lang: locale.value
    }, link: [
      ...filteredLinks,
      { href: '/favicon.ico', rel: 'icon' },
      {
        href: canonicalUrl.value,
        id: 'canonical',
        rel: 'canonical'
      },
      ...alternateLinks.value,
      xDefaultLink.value
    ], meta: [
      { charset: 'utf-8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { content: color.value, key: 'theme-color', name: 'theme-color' },
      ...meta
    ]
  }
})

const { global } = useAppConfig()

// Métadonnées SEO améliorées
useSeoMeta({
  ogImage: () => global.picture?.light || 'https://ui.nuxt.com/assets/templates/nuxt/portfolio-light.png',
  ogSiteName: 'Massimo Russo',
  ogType: 'website',
  ogUrl: () => canonicalUrl.value,
  titleTemplate: () => t('seo.titleTemplate'),
  twitterCard: 'summary_large_image',
  twitterCreator: '@massimorusso',
  twitterImage: () => global.picture?.light || 'https://ui.nuxt.com/assets/templates/nuxt/portfolio-light.png',
  twitterSite: '@massimorusso'
})

// Données structurées JSON-LD (SEO + AIO : entités Person + WebSite, sameAs complet)
const siteBase = computed(() => siteUrl.value.replace(/\/$/, ''))
const structuredData = computed(() => {
  const personId = `${siteBase.value}#person`
  const websiteId = `${siteBase.value}#website`
  const description = t('index.description')
  const rawImg = global.picture?.light
  const imageUrl = rawImg
    ? toAbsoluteUrl(String(rawImg).startsWith('/') ? String(rawImg) : `/${String(rawImg)}`)
    : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': 'US',
          'addressLocality': 'Boston'
        },
        'alumniOf': {
          '@type': 'CollegeOrUniversity',
          'department': 'Interactive Design',
          'name': 'Boston University'
        },
        'description': description,
        'email': global.email,
        'image': imageUrl,
        'jobTitle': 'Consultant frontend senior',
        'knowsAbout': [
          'Vue.js',
          'Nuxt',
          'Architecture frontend',
          'Décisions techniques',
          'Modernisation de stacks',
          'IA pragmatique'
        ],
        'knowsLanguage': ['fr', 'en'],
        'name': 'Massimo Russo',
        'sameAs': [
          'https://www.linkedin.com/in/russomassimo-frontend-consultant',
          'https://bsky.app/profile/massimorusso.bsky.social',
          'https://github.com/mass22',
          'https://x.com/Massimo_Russo_X',
          'https://discord.com/invite/mass22'
        ],
        'url': siteBase.value
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        'description': description,
        'inLanguage': ['fr-CA', 'en'],
        'name': 'Massimo Russo',
        'publisher': { '@id': personId },
        'url': `${siteBase.value}/`
      }
    ]
  }
})

useHead(() => ({
  script: [
    {
      key: 'ld-json-person',
      innerHTML: JSON.stringify(structuredData.value),
      type: 'application/ld+json'
    }
  ]
}))

const { data: navigation } = await useAsyncData('navigation', () => Promise.all([
  queryCollectionNavigation('blog')
]), {
  transform: data => data.flat()
})

const { data: files } = useLazyAsyncData('search', () => Promise.all([
  queryCollectionSearchSections('blog')
]), {
  server: false,
  transform: data => data.flat()
})
</script>

<template>
  <Analytics />
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        shortcut="meta_k"
        :links="navLinks"
        :fuse="{ resultLimit: 42 }"
      />
      <ChatbotWidget v-if="!route.path.startsWith('/lead/') && !route.path.startsWith('/lp/audit')" />
    </ClientOnly>
  </UApp>
</template>
