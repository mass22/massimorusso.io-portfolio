<script setup lang="ts">
import { computed } from 'vue'
import type { ServicesPage } from '~/types/services'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { global } = useAppConfig()
const siteUrl = useRequestURL().origin

// Chargement du contenu depuis Nuxt Content
const { data: page } = await useAsyncData(`services-${locale.value}`, async () => {
  const allPages = await queryCollection('services').all()
  const found = allPages.find(p => p.locale === locale.value) as ServicesPage | undefined
  return found || (allPages.find(p => p.locale === 'fr') as ServicesPage | undefined) || null
})

if (!page.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t('common.pageNotFound')
  })
}

// SEO Meta
useSeoMeta({
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogType: 'website',
  ogImage: global.picture?.light,
  title: page.value?.seo?.title || page.value?.title
})

// Mapping des icônes par slug si non fourni
const getServiceIcon = (item: { slug?: string; icon?: string }): string => {
  if (item.icon) return item.icon
  const iconMap: Record<string, string> = {
    'architecture-frontend': 'i-ph-lightbulb',
    'frontend-architecture': 'i-ph-lightbulb',
    'aide-decision-technique': 'i-ph-chalkboard-teacher',
    'technical-decision-support': 'i-ph-chalkboard-teacher',
    'ia-pragmatique': 'i-ph-sparkle',
    'pragmatic-ai': 'i-ph-sparkle'
  }
  return item.slug ? (iconMap[item.slug] || 'i-ph-circle') : 'i-ph-circle'
}

// Génération d'une image stable par slug pour le placeholder
// Les images sont dans public/services/ et accessibles via /services/
const getServiceImage = (item: { slug?: string; image?: string }): string => {
  if (item.image) return item.image
  const imageMap: Record<string, number> = {
    'architecture-frontend': 1,
    'frontend-architecture': 1,
    'aide-decision-technique': 2,
    'technical-decision-support': 2,
    'ia-pragmatique': 3,
    'pragmatic-ai': 3
  }
  const imageNumber = item.slug ? (imageMap[item.slug] || 1) : 1
  // Chemin vers les images dans public/services/
  return `/services/service-${imageNumber}.png`
}

// Génération du lien pour les services
const getServiceLink = (item: { slug?: string }): string => {
  return item.slug ? localePath(`/services/${item.slug}`) : '#'
}

// JSON-LD structuré pour le SEO avec replacer pour éviter undefined
const serviceStructuredData = computed(() => {
  const serviceTypeMap: Record<string, string> = {
    fr: 'Conseil en architecture frontend & IA pragmatique',
    en: 'Frontend Architecture & Pragmatic AI Consulting'
  }

  const areaServedMap: Record<string, string> = {
    fr: 'Monde entier',
    en: 'Worldwide'
  }

  const items = page.value?.items || []

  const itemListElement = items
    .filter(item => item.title && item.description)
    .map((item, index) => ({
      '@type': 'Offer' as const,
      itemOffered: {
        '@type': 'Service' as const,
        name: item.title,
        description: item.description
      },
      position: index + 1
    }))

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    inLanguage: locale.value,
    serviceType: serviceTypeMap[locale.value] || serviceTypeMap.fr,
    provider: {
      '@type': 'Person',
      name: 'Massimo Russo',
      url: siteUrl,
      email: global.email,
      jobTitle: locale.value === 'fr' ? 'Consultant senior en architecture frontend' : 'Senior Frontend Consultant'
    },
    areaServed: {
      '@type': 'Country',
      name: areaServedMap[locale.value] || areaServedMap.fr
    }
  }

  if (itemListElement.length > 0) {
    structuredData.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: locale.value === 'fr' ? 'Services' : 'Services',
      itemListElement
    }
  }

  return structuredData
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(serviceStructuredData.value, (key, value) => {
        // Supprimer les valeurs undefined pour éviter les erreurs JSON-LD
        return value === undefined ? null : value
      })
    }
  ]
})

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

    <!-- Supporting line sous le hero -->
    <UPageSection
      v-if="page?.heroSupportingLine"
      :ui="{
        container: 'px-0 !pt-4 !pb-0'
      }"
    >
      <p class="text-sm text-muted max-w-xl">
        {{ page.heroSupportingLine }}
      </p>
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
        class="text-sm text-muted max-w-2xl mb-6"
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


    <!-- Content Section (Markdown) -->
    <ContentSection
      v-if="page?.content"
      :content="page.content"
    />

    <!-- Process Section avec lead-in -->
    <div v-if="page?.process && page.process.steps && page.process.steps.length > 0">
      <!-- Lead-in pour le process -->
      <UPageSection
        v-if="page?.processLeadIn"
        :ui="{
          container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 !pb-4'
        }"
      >
        <p class="text-sm text-muted max-w-2xl">
          {{ page.processLeadIn }}
        </p>
      </UPageSection>

      <ProcessSteps
        :title="page.process.title"
        :description="page.process.description"
        :steps="page.process.steps"
      />
    </div>

    <!-- Stats Section (optionnel - uniquement si statsEnabled === true) -->
    <StatsGrid
      v-if="page?.statsEnabled && page?.stats && page.stats.length > 0"
      :stats="page.stats"
    />

    <!-- FAQ Section -->
    <FAQ
      v-if="page?.faq"
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
