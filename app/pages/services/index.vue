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
    consulting: 'i-ph-lightbulb',
    workshops: 'i-ph-chalkboard-teacher',
    audit: 'i-ph-sparkle'
  }
  return item.slug ? (iconMap[item.slug] || 'i-ph-circle') : 'i-ph-circle'
}

// Génération d'une image stable par slug pour le placeholder
const getServiceImage = (item: { slug?: string; image?: string }): string => {
  if (item.image) return item.image
  const imageMap: Record<string, number> = {
    consulting: 1,
    workshops: 2,
    audit: 3
  }
  return `https://picsum.photos/200?random=${item.slug ? (imageMap[item.slug] || 1) : 1}`
}

// Génération du lien pour les services
const getServiceLink = (item: { slug?: string }): string => {
  return item.slug ? localePath(`/services/${item.slug}`) : '#'
}

// JSON-LD structuré pour le SEO
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

  return {
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
    },
    ...(itemListElement.length > 0 && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: locale.value === 'fr' ? 'Services' : 'Services',
        itemListElement
      }
    })
  }
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(serviceStructuredData.value)
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

    <!-- Content Section (Markdown) -->
    <ContentSection
      v-if="page?.content"
      :content="page.content"
    />

    <!-- Services Cards Section -->
    <CardGrid
      v-if="page?.items && page.items.length > 0"
      :items="page.items"
      :get-icon="getServiceIcon"
      :get-image="getServiceImage"
      :get-link="getServiceLink"
      :columns="3"
    />

    <!-- Process Section -->
    <ProcessSteps
      v-if="page?.process && page.process.steps && page.process.steps.length > 0"
      :title="page.process.title"
      :description="page.process.description"
      :steps="page.process.steps"
    />

    <!-- Stats Section (optionnel) -->
    <StatsGrid
      v-if="page?.stats && page.stats.length > 0"
      :stats="page.stats"
    />

    <!-- FAQ Section -->
    <FAQ
      v-if="page?.faq"
      :title="page.faq.title"
      :description="page.faq.description"
      :categories="page.faq.categories"
    />

    <!-- CTA Section -->
    <CTA
      v-if="page?.cta && (page.cta.primary || page.cta.secondary)"
      :title="page.cta.title"
      :description="page.cta.description"
      :primary="page.cta.primary"
      :secondary="page.cta.secondary"
    />
  </UPage>
</template>
