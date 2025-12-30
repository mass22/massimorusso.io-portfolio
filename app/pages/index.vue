<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { t } = useI18n()
const localePath = useLocalePath()

const { data: page } = await usePageData<IndexCollectionItem>('index')
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

// SEO Meta pour la page d'accueil
useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogDescription: page.value?.seo?.description || page.value?.description
})

// Preload de l'image LCP pour optimiser le Largest Contentful Paint
// Note: Le preload sera géré automatiquement par NuxtImg avec fetchpriority="high"
// Pas besoin de preload manuel car NuxtImg génère l'URL optimisée dynamiquement

const ctaLinks = computed(() => ([
  {
    label: t('homepage.cta.button'),
    to: localePath('/contact'),
    trailingIcon: 'i-lucide-arrow-right',
    variant: 'solid' as const
  }
]))
</script>

<template>
  <UPage v-if="page">
    <!-- 1. Hero avec CTA principal -->
    <LazyLandingHero :page />

    <!-- 1.1. Context -->
    <LazyLandingContext />

    <!-- 2. Services (aperçu) -->
    <LazyLandingServices :page />

    <!-- 3. Companies (preuve sociale) -->
    <LazyLandingCompanies :page />

    <!-- 4. About + WorkExperience (côte à côte) - Section secondaire -->
    <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20 lg:grid lg:grid-cols-2 lg:gap-8'
      }"
    >
      <LazyLandingAbout :page />
      <LazyLandingWorkExperience :page/>
    </UPageSection>

    <!-- 5. Speaking (Conférences, Talks, prises de parole) -->
    <LazyLandingSpeaking :page />

    <!-- 6. Blog (contenu secondaire) -->
    <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20'
      }"
    >
      <LazyLandingBlog :page />
    </UPageSection>

    <!-- 7. FAQ (répondre aux objections) -->
    <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20'
      }"
    >
      <LazyLandingFAQ :page />
    </UPageSection>

    <!-- 8. CTA final vers Contact -->
    <Motion
      :initial="{ opacity: 0, transform: 'translateY(30px)' }"
      :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
      :transition="{ duration: 0.6 }"
      :in-view-options="{ once: true, margin: '-100px' }"
    >
      <UPageSection
        :ui="{
          container: '!pt-12 sm:!pt-16 lg:!pt-20'
        }"
      >
        <UPageCTA
          :title="t('homepage.cta.title')"
          :description="t('homepage.cta.description')"
          :links="ctaLinks"
          variant="solid"
        />
      </UPageSection>
    </Motion>
  </UPage>
</template>
