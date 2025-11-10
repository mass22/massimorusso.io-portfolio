<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
import { computed } from 'vue';

const colorMode = useColorMode()
const { locale, t, locales } = useI18n()
const localePath = useLocalePath()
const navLinks = computed(() => {
  try {
    return getNavLinks(t, localePath) || []
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

const alternateLinks = computed(() => {
  return availableLocales.value
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
      const hreflang = typeof localeObj === 'string' ? localeObj : localeObj.iso || localeObj.code
      return {
        href, hreflang, id: `alt-${localeObj.code}`, rel: 'alternate'
      }
    })
    .filter((link): link is { id: string; rel: string; hreflang: string; href: string } => Boolean(link))
})

const xDefaultLink = computed(() => ({
  href: canonicalUrl.value, hreflang: 'x-default', id: 'alt-x-default', rel: 'alternate'
}))

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id'
})

useHead(() => {
  const { meta = [], link = [], htmlAttrs = {} } = i18nHead.value
  const filteredLinks = link.filter(linkItem => !['alternate', 'canonical'].includes(linkItem.rel ?? ''))

  return {
    htmlAttrs: {
      ...htmlAttrs,
      lang: locale.value
    }, link: [
      ...filteredLinks,
      { rel: 'icon', href: '/favicon.ico' },
      {
        id: 'canonical',
        rel: 'canonical',
        href: canonicalUrl.value
      },
      ...alternateLinks.value,
      xDefaultLink.value
    ], meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { key: 'theme-color', name: 'theme-color', content: color.value },
      ...meta
    ]
  }
})

const { global } = useAppConfig()

// Métadonnées SEO améliorées
useSeoMeta({
  ogImage: () => global.picture?.light || 'https://ui.nuxt.com/assets/templates/nuxt/portfolio-light.png',
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  ogSiteName: 'Massimo Russo',
  titleTemplate: () => t('seo.titleTemplate'),
  twitterCard: 'summary_large_image',
  twitterImage: () => global.picture?.light || 'https://ui.nuxt.com/assets/templates/nuxt/portfolio-light.png',
  twitterCreator: '@massimorusso',
  twitterSite: '@massimorusso'
})

// Données structurées JSON-LD pour le SEO
const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Massimo Russo',
  jobTitle: 'Consultant Frontend Sénior',
  description: t('index.description') || 'Consultant Frontend Sénior — Vue.js, Nuxt & Modernisation d\'Architecture',
  url: siteUrl.value,
  image: global.picture?.light,
  email: global.email,
  sameAs: [
    'https://www.linkedin.com/in/russomassimo-frontend-consultant',
    'https://bsky.app/profile/massimorusso.bsky.social'
  ],
  knowsAbout: ['Vue.js', 'Nuxt.js', 'UX/UI Design', 'Frontend Development', 'Architecture Modernization'],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Boston University',
    department: 'Interactive Design'
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Boston',
    addressCountry: 'US'
  }
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData.value)
    }
  ]
})

const { data: navigation } = await useAsyncData('navigation', () => {
  return Promise.all([
    queryCollectionNavigation('blog')
  ])
}, {
  transform: data => data.flat()
})

const { data: files } = useLazyAsyncData('search', () => {
  return Promise.all([
    queryCollectionSearchSections('blog')
  ])
}, {
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
    </ClientOnly>
  </UApp>
</template>
