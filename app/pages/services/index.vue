<script setup lang="ts">
import { computed } from 'vue'
import { useSiteUrl } from '~/composables/useSiteUrl'
import type { ServicesPage } from '~/types/services'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { global } = useAppConfig()
const siteUrl = useSiteUrl()

// Chargement du contenu depuis Nuxt Content
const { data: page } = await useAsyncData(`services-${locale.value}`, async () => {
  const allPages = await queryCollection('services').all()
  const found = allPages.find(p => p.locale === locale.value) as ServicesPage | undefined
  const result = found || (allPages.find(p => p.locale === 'fr') as ServicesPage | undefined) || null
  return result
})

const isVisible = ref(false)

if (!page.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t('common.pageNotFound')
  })
}

usePageSeo({
  description: () => page.value?.seo?.description || page.value?.description,
  image: () => global.picture?.light,
  ogType: 'website',
  title: () => page.value?.seo?.title || page.value?.title,
  titleFallbackKey: 'seo.pages.services'
})

// Mapping des icônes par slug si non fourni
const getServiceIcon = (item: { slug?: string, icon?: string }): string => {
  if (item.icon) {
    return item.icon
  }
  const iconMap: Record<string, string> = {
    'aide-decision-technique': 'i-ph-chalkboard-teacher',
    'architecture-frontend': 'i-ph-lightbulb',
    'developpement-vuejs': 'i-ph-code',
    'frontend-architecture': 'i-ph-lightbulb',
    'ia-pragmatique': 'i-ph-sparkle',
    'pragmatic-ai': 'i-ph-sparkle',
    'technical-decision-support': 'i-ph-chalkboard-teacher',
    'vuejs-development': 'i-ph-code'
  }
  return item.slug ? (iconMap[item.slug] || 'i-ph-circle') : 'i-ph-circle'
}

// Génération d'une image stable par slug pour le placeholder
// Les images sont dans public/services/ et accessibles via /services/
const getServiceImage = (item: { slug?: string, image?: string }): string => {
  if (item.image) {
    return item.image
  }
  const imageMap: Record<string, number> = {
    'aide-decision-technique': 2,
    'architecture-frontend': 1,
    'developpement-vuejs': 4,
    'frontend-architecture': 1,
    'ia-pragmatique': 3,
    'pragmatic-ai': 3,
    'technical-decision-support': 2,
    'vuejs-development': 4
  }
  const imageNumber = item.slug ? (imageMap[item.slug] || 1) : 1
  // Chemin vers les images dans public/services/
  return `/services/service-${imageNumber}.webp`
}

// Génération du lien pour les services
const getServiceLink = (item: { slug?: string }): string => item.slug ? localePath(`/services/${item.slug}`) : '#'

// JSON-LD structuré pour le SEO avec replacer pour éviter undefined
const serviceStructuredData = computed(() => {
  const serviceTypeMap: Record<string, string> = {
    en: 'Frontend Architecture & Pragmatic AI Consulting',
    fr: 'Conseil en architecture frontend & IA pragmatique'
  }

  const areaServedMap: Record<string, string> = {
    en: 'Worldwide',
    fr: 'Monde entier'
  }

  const items = page.value?.items || []

  const itemListElement = items
    .filter(item => item.title && item.description)
    .map((item, index) => ({
      '@type': 'Offer' as const,
      'itemOffered': {
        '@type': 'Service' as const,
        'description': item.description,
        'name': item.title
      },
      'position': index + 1
    }))

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'areaServed': {
      '@type': 'Country',
      'name': areaServedMap[locale.value] || areaServedMap.fr
    },
    'inLanguage': locale.value,
    'provider': {
      '@type': 'Person',
      'email': global.email,
      'jobTitle': locale.value === 'fr' ? 'Consultant senior en architecture frontend' : 'Senior Frontend Consultant',
      'name': 'Massimo Russo',
      'url': siteUrl
    },
    'serviceType': serviceTypeMap[locale.value] || serviceTypeMap.fr
  }

  if (itemListElement.length > 0) {
    structuredData.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      itemListElement,
      'name': locale.value === 'fr' ? 'Services' : 'Services'
    }
  }

  return structuredData
})

useHead(() => ({
  script: [
    {
      key: 'ld-json-services-index',
      innerHTML: JSON.stringify(serviceStructuredData.value, (key, value) => value === undefined ? null : value),
      type: 'application/ld+json'
    }
  ]
}))
</script>

<template>
  <UPage>
    <!-- Hero Section -->
    <UPageHero
      :title="page?.title || t('services.hero.title')"
      :description="page?.description || t('services.hero.description')"
      :ui="{
        title: 'text-3xl md:text-5xl font-bold',
        description: 'mt-6 text-base md:text-xl text-muted'
      }"
    />

    <!-- Context paragraph avec style identique à Context.vue -->
    <UPageSection
      v-if="page?.heroContext"
      :ui="{
        container: 'px-0 !py-8 sm:!py-12'
      }"
    >
      <div class="mx-auto max-w-5xl">
        <div class="relative px-8 sm:px-12">
          <!-- Vertical accent -->
          <div
            class="absolute left-0 top-0 h-full w-px bg-primary/30"
            aria-hidden="true"
          />

          <!-- Quote content -->
          <div class="text-center">
            <p class="text-md sm:text-lg leading-relaxed text-highlighted">
              {{ typeof page.heroContext === 'string' ? page.heroContext : String(page.heroContext || '') }}
            </p>
          </div>
        </div>
      </div>
    </UPageSection>

    <!-- Services Cards Section -->
    <UPageSection
      v-if="page?.items && page.items.length > 0"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-6 sm:gap-8'
      }"
    >
      <!-- Mini-intro pour les cartes -->
      <p
        v-if="page?.itemsIntro"
        class="text-base text-muted max-w-2xl mb-6 px-8"
      >
        {{ page.itemsIntro }}
      </p>

      <CardGrid
        :items="page.items"
        :get-icon="getServiceIcon"
        :get-image="getServiceImage"
        :get-link="getServiceLink"
        :columns="1"
      />
    </UPageSection>

    <!-- Process Section avec lead-in -->
    <div v-if="page?.process && page.process.steps && page.process.steps.length > 0">
      <!-- Lead-in pour le process -->
      <UPageSection
        v-if="page?.processLeadIn"
        :ui="{
          container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 !pb-4'
        }"
      >
        <p class="text-base text-muted max-w-2xl px-8">
          {{ page.processLeadIn }}
        </p>
      </UPageSection>

      <ProcessSteps
        :title="page.process.title"
        :description="page.process.description"
        :steps="page.process.steps"
      />
    </div>

    <!-- Content Section (Markdown) -->
    <ContentSection
      v-if="page?.content"
      :content="page.content"
    />

    <!-- Stats Section (optionnel - uniquement si statsEnabled === true) -->
    <StatsGrid
      v-if="page?.statsEnabled && page?.stats && page.stats.length > 0"
      :stats="page.stats"
    />

    <!-- FAQ Section -->
    <FAQ
      v-if="page?.faq && isVisible"
      :title="page.faq.title"
      :description="page.faq.description"
      :categories="page.faq.categories"
    />

    <!-- CTA Section Final - Unique avec plus d'espace -->
    <CTA
      v-if="page?.cta && (page.cta.primary || page.cta.secondary)"
      :title="page.cta.title"
      :description="page.cta.description"
      :primary="page.cta.primary"
      :secondary="page.cta.secondary"
    />
  </UPage>
</template>
