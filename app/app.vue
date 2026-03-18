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

// Données structurées JSON-LD pour le SEO
const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
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
  'description': t('index.description') || 'Consultant Frontend Sénior — Vue.js, Nuxt & Modernisation d\'Architecture',
  'email': global.email,
  'image': global.picture?.light,
  'jobTitle': 'Consultant Frontend Sénior',
  'knowsAbout': ['Vue.js', 'Nuxt.js', 'UX/UI Design', 'Frontend Development', 'Architecture Modernization'],
  'name': 'Massimo Russo',
  'sameAs': [
    'https://www.linkedin.com/in/russomassimo-frontend-consultant',
    'https://bsky.app/profile/massimorusso.bsky.social'
  ],
  'url': siteUrl.value
}))

useHead({
  script: [
    {
      innerHTML: JSON.stringify(structuredData.value),
      type: 'application/ld+json'
    }
  ]
})

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
      <ChatbotWidget v-if="!route.path.startsWith('/lead/')" />
    </ClientOnly>
  </UApp>
</template>
