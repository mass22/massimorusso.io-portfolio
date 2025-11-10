<script setup lang="ts">
import { computed } from 'vue'

const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`services-${locale.value}`, async () => {
  const allPages = await queryCollection('services').all()
  const found = allPages.find((p: any) => p.locale === locale.value)
  return found || allPages.find((p: any) => p.locale === 'fr') || null
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

const links = computed(() => ([
  {
    label: t('services.cta.contact'),
    to: localePath('/contact'),
    trailingIcon: 'i-lucide-arrow-right',
    variant: 'solid' as const,
    color: 'primary' as const
  },
  {
    label: t('services.cta.booking'),
    to: global.available ? global.meetingLink : localePath('/contact'),
    trailingIcon: 'i-lucide-calendar',
    variant: 'outline' as const,
    color: 'neutral' as const
  }
]))
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
            to="/services#"
            :aria-label="t(service.titleKey)"
          >
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
    <Motion
      :initial="{ opacity: 0, transform: 'translateY(30px)' }"
      :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
      :transition="{ duration: 0.6 }"
      :in-view-options="{ once: true, margin: '-100px' }"
    >
      <UPageSection
        :ui="{
          container: '!pt-16 sm:!pt-20 lg:!pt-24'
        }"
      >
        <UPageCTA
          :title="t('services.cta.title')"
          :description="t('services.cta.description')"
          :links="links"
          variant="solid"
          :ui="{
            container: 'bg-elevated/50 dark:bg-elevated/30 rounded-2xl p-8 sm:p-12 lg:p-16 gap-6 sm:gap-8',
            title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
            description: 'text-base sm:text-lg lg:text-xl max-w-2xl mx-auto'
          }"
        />
      </UPageSection>
    </Motion>
  <LazyLandingTestimonials v-if="page" :page="page as any" />
  <LazyLandingFAQ v-if="page" :page="page as any" />
  </UPage>
</template>