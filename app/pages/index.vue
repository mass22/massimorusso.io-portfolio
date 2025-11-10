<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: page } = await useAsyncData(`index-${locale.value}`, async () => {
  const allPages = await queryCollection('index').all()
  const found = allPages.find((p: any) => p.locale === locale.value)
  return found || allPages.find((p: any) => p.locale === 'fr') || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description, ogDescription: page.value?.seo?.description || page.value?.description, ogTitle: page.value?.seo?.title || page.value?.title, title: page.value?.seo?.title || page.value?.title
})

const isVisible = ref(false)

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
    <LandingHero :page />

    <!-- 2. Services (aperçu) -->
    <LazyLandingServices />

    <!-- 3. Testimonials (preuve sociale) -->
    <LazyLandingTestimonials :page />

    <!-- 4. About + WorkExperience (côte à côte) - Section secondaire -->
    <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20 lg:grid lg:grid-cols-2 lg:gap-8'
      }"
    >
      <div class="flex flex-col gap-4">
      <LazyLandingAbout :page />
        <LazyLandingWorkExperience :page/>
      </div>
      <LazyLandingSpeaking :page />
    </UPageSection>

    <!-- 5. Blog (contenu secondaire) -->
    <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20'
      }"
    >
    <LazyLandingBlog :page />
    </UPageSection>

    <!-- 6. FAQ (répondre aux objections) -->
    <UPageSection
      v-if="isVisible"
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20'
      }"
    >
      <LazyLandingFAQ :page />
    </UPageSection>

    <!-- 7. CTA final vers Contact -->
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

    <!-- 8. Derniers Speaking (Conférences, Talks, Podcasts) -->
    <!-- <UPageSection
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20'
      }"
    >

    </UPageSection> -->
  </UPage>
</template>
