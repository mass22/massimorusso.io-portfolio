<script setup lang="ts">
import { computed } from 'vue'
import type { ServicesCollectionItem } from '@nuxt/content'

const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`services-${locale.value}`, async () => {
  const allPages = await queryCollection('services').all()
  const found = allPages.find(p => p.locale === locale.value)
  return found || allPages.find(p => p.locale === 'fr') || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

const { global } = useAppConfig()
const siteUrl = useRequestURL().origin

const serviceItems = [
  {
    descriptionKey: 'services.items.consulting.description', icon: 'i-ph-lightbulb', imageAltKey: 'services.items.consulting.imageAlt', titleKey: 'services.items.consulting.title'
  },
  {
    descriptionKey: 'services.items.workshops.description', icon: 'i-ph-chalkboard-teacher', imageAltKey: 'services.items.workshops.imageAlt', titleKey: 'services.items.workshops.title'
  },
  {
    descriptionKey: 'services.items.audit.description', icon: 'i-ph-sparkle', imageAltKey: 'services.items.audit.imageAlt', titleKey: 'services.items.audit.title'
  }
]

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogType: 'website',
  ogImage: global.picture?.light,
  title: page.value?.seo?.title || page.value?.title
})

// Données structurées Service pour le SEO
const serviceStructuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Consulting & Development Services',
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
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: serviceItems.map((service, index) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: t(service.titleKey),
        description: t(service.descriptionKey)
      },
      position: index + 1
    }))
  }
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(serviceStructuredData.value)
    }
  ]
})

const localePath = useLocalePath()

// Fonction pour obtenir le slug d'un service
const getServiceSlug = (titleKey: string) => {
  const serviceSlugs: Record<string, string> = {
    'services.items.consulting.title': 'consulting',
    'services.items.workshops.title': 'workshops',
    'services.items.audit.title': 'audit'
  }
  return serviceSlugs[titleKey] || ''
}
</script>

<template>
  <UPage>
    <UPageHero
      :title="t('services.hero.title')"
      :description="t('services.hero.description')"
      :ui="{
        title: 'text-3xl md:text-5xl font-bold',
        description: 'mt-6 text-base md:text-xl text-muted'
      }"
    />
    <LazyLandingProcess />
    <LazyLandingStats />
    <Motion
      :initial="{ opacity: 0, transform: 'translateY(30px)' }"
      :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
      :transition="{ duration: 0.6 }"
      :in-view-options="{ once: true, margin: '-100px' }"
    >
      <UBlogPosts class="grid md:grid-cols-3 gap-8 mt-12">
        <Motion
          v-for="(service, index) in serviceItems"
          :key="service.titleKey"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <UPageCard
            :title="t(service.titleKey)"
            :description="t(service.descriptionKey)"
            :icon="service.icon"
            orientation="vertical"
            reverse
            :to="localePath(`/services/${getServiceSlug(service.titleKey)}`)"
            :aria-label="t(service.titleKey)"
            class="group hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
            :ui="{
              root: 'h-full',
              body: 'flex-1'
            }"
          >
            <template #footer>
              <UButton
                :to="localePath(`/services/${getServiceSlug(service.titleKey)}`)"
                variant="link"
                size="sm"
                class="px-0 gap-1 text-primary"
                :label="t('services.cta.learnMore')"
              >
                <template #trailing>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 transition-all duration-300 ease-out opacity-0 group-hover:translate-x-2 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </template>
              </UButton>
            </template>
            <ClientOnly>
              <NuxtImg
                src="https://picsum.photos/200"
                :alt="t(service.imageAltKey)"
                width="200"
                height="200"
                loading="lazy"
                format="webp"
                quality="80"
                class="w-full"
              />
              <template #fallback>
                <div class="w-full h-[200px] bg-muted rounded-lg animate-pulse" />
              </template>
            </ClientOnly>
          </UPageCard>
        </Motion>
      </UBlogPosts>
    </Motion>
    <ServicesCTA />
  <LazyLandingTestimonials v-if="page" :page="page" />
  <LazyLandingFAQ v-if="page" :page="page" />
  </UPage>
</template>