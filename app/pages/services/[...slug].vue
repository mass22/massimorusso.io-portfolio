<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

const route = useRoute()
const { t, locale, defaultLocale } = useI18n()
const localePath = useLocalePath()

const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug as string

// Debug: vérifier le slug extrait
if (process.dev) {
  console.log('🔍 Route params:', route.params)
  console.log('🔍 Slug extrait:', slug)
  console.log('🔍 Route path:', route.path)
}

const buildPathForLocale = (targetLocale: string) => {
  if (!targetLocale || targetLocale === 'fr') {
    return `/services/${slug}`
  }
  return `/${targetLocale}/services/${slug}`
}

const matchService = (service: any, targetLocale?: string) => {
  if (!service) {
    return false
  }
  // Vérifier d'abord le slug qui est le plus fiable
  if (service.slug === slug) {
    // Si on a une locale cible, vérifier qu'elle correspond
    if (targetLocale) {
      return service.locale === targetLocale
    }
    return true
  }
  return false
}

const { data: page } = await useAsyncData(`service-${locale.value}-${slug}`, async () => {
  try {
    // Récupérer tous les services
    const allServices = await queryCollection('serviceItems').all()

    // Debug: vérifier ce qu'on récupère
    if (process.dev) {
      console.log('🔍 Services trouvés:', allServices.length)
      console.log('🔍 Slug recherché:', slug)
      console.log('🔍 Locale actuelle:', locale.value)
      allServices.forEach((s: any) => {
        console.log(`  - slug: "${s.slug}", locale: "${s.locale}", path: "${s.path || 'N/A'}"`)
      })
    }

    if (!allServices || allServices.length === 0) {
      console.warn('⚠️ Aucun service trouvé dans la collection serviceItems')
      return null
    }

    // Essayer de trouver par slug et locale actuelle
    const currentLocaleMatch = allServices.find((service: any) =>
      service.slug === slug && service.locale === locale.value
    )
    if (currentLocaleMatch) {
      if (process.dev) {
        console.log('✅ Service trouvé par slug et locale:', currentLocaleMatch.slug)
      }
      return currentLocaleMatch
    }

    // Fallback vers la locale par défaut
    const fallbackLocaleCode = (defaultLocale as any)?.value || defaultLocale || 'fr'
    const defaultLocaleMatch = allServices.find((service: any) =>
      service.slug === slug && service.locale === fallbackLocaleCode
    )
    if (defaultLocaleMatch) {
      if (process.dev) {
        console.log('✅ Service trouvé par slug et locale par défaut:', defaultLocaleMatch.slug)
      }
      return defaultLocaleMatch
    }

    // Dernier recours : trouver n'importe quel service avec ce slug
    const anyMatch = allServices.find((service: any) => service.slug === slug)
    if (anyMatch) {
      if (process.dev) {
        console.log('✅ Service trouvé par slug uniquement:', anyMatch.slug)
      }
      return anyMatch
    }

    if (process.dev) {
      console.warn(`⚠️ Aucun service trouvé avec le slug: "${slug}"`)
      console.warn('⚠️ Services disponibles:', allServices.map((s: any) => s.slug))
    }

    return null
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des services:', error)
    console.error('❌ Détails de l\'erreur:', error)
    return null
  }
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('common.pageNotFound'),
    fatal: true
  })
}

const { global } = useAppConfig()
const siteUrl = useRequestURL().origin

if (page.value?.images && page.value.images.length > 0 && page.value.images[0]?.src) {
  defineOgImage({ url: page.value.images[0].src })
} else {
  defineOgImageComponent('Service', {
    headline: page.value?.title || ''
  }, {
    fonts: ['Geist:400', 'Geist:600']
  })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  description,
  ogDescription: description,
  ogTitle: title,
  ogType: 'website',
  ogImage: page.value?.images?.[0]?.src || global.picture?.light,
  title
})

// Données structurées Service pour le SEO
const serviceStructuredData = computed(() => {
  if (!page.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    image: page.value.images?.[0]?.src || [],
    provider: {
      '@type': 'Person',
      name: 'Massimo Russo',
      url: siteUrl,
      email: global.email,
      jobTitle: 'Senior Frontend Consultant'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Worldwide'
    }
  }
})

useHead({
  script: [
    ...(serviceStructuredData.value ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(serviceStructuredData.value)
      }
    ] : [])
  ]
})

const breadcrumb = computed(() => {
  return [
    {
      label: t('navigation.home'),
      to: localePath('/'),
      icon: 'i-lucide-home'
    },
    {
      label: t('services.hero.title'),
      to: localePath('/services'),
      icon: 'i-lucide-briefcase'
    },
    {
      label: page.value?.title || '',
      // Pas de 'to' pour le dernier élément (page actuelle)
    }
  ]
})

// Données structurées BreadcrumbList pour le SEO
const breadcrumbStructuredData = computed(() => {
  if (!breadcrumb.value || breadcrumb.value.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.value.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `${siteUrl}${item.to}` } : {})
    }))
  }
})

useHead({
  script: [
    ...(serviceStructuredData.value ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(serviceStructuredData.value)
      }
    ] : []),
    ...(breadcrumbStructuredData.value ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbStructuredData.value)
      }
    ] : [])
  ]
})

const scrollEl = ref<HTMLElement | Window>()
const isClient = typeof window !== 'undefined'
const pageHeight = ref(0)

onMounted(() => {
  if (isClient) {
    scrollEl.value = window
    const updateHeight = () => {
      pageHeight.value = document.documentElement.scrollHeight - window.innerHeight
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
  }
})

const { y } = useScroll(scrollEl)
const scrollPercent = computed(() => (pageHeight.value > 0 ? (y.value / pageHeight.value) * 100 : 0))

</script>

<template>
  <div>
    <div
      style="position: fixed; left: 0; top: 0; height: 4px; background: #00b894; z-index: 10004; transition: width 0.15s;"
      :style="{ width: scrollPercent + '%' }"
    />
    <UMain class="mt-20 px-2">
      <UContainer class="relative min-h-screen">
        <UPage v-if="page">
          <UBreadcrumb
            v-if="breadcrumb.length > 0"
            :items="breadcrumb"
            separator-icon="i-lucide-chevron-right"
            class="mb-6"
            :ui="{
              root: 'text-sm',
              link: 'text-muted hover:text-default transition-colors',
              separatorIcon: 'text-muted'
            }"
          />
          <UPageHero
            :title="page.title"
            :description="page.description"
            :ui="{
              title: 'text-3xl md:text-5xl font-bold',
              description: 'mt-6 text-base md:text-xl text-muted'
            }"
          >
            <template #headline>
              <div class="flex items-center gap-2">
                <UIcon
                  v-if="page.icon"
                  :name="page.icon"
                  class="size-6 text-primary"
                  aria-hidden="true"
                />
                <span class="text-sm font-medium text-primary">
                  {{ t('services.hero.title') }}
                </span>
              </div>
            </template>
          </UPageHero>

          <UPageBody class="max-w-4xl mx-auto">
            <div
              v-if="page.images && page.images.length > 0 && page.images[0]"
              class="mb-8"
            >
              <NuxtImg
                :src="page.images[0]?.src"
                :alt="page.images[0]?.alt || page.title"
                class="rounded-lg w-full h-[400px] object-cover object-center"
                width="1200"
                height="400"
                loading="eager"
                format="webp"
                quality="85"
              />
            </div>

            <ContentRenderer
              v-if="page.body"
              :value="page"
            />
          </UPageBody>

          <ServicesCTA />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>

