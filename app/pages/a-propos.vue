<script setup lang="ts">
import { markdownToHtml } from '~/utils/markdown'

const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`about-${locale.value}`, async () => {
  const allPages = await queryCollection('about').all()
  const found = allPages.find((p: any) => p.locale === locale.value)
  return found || allPages.find((p: any) => p.locale === 'fr') || null
})

if (!page.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t('common.pageNotFound')
  })
}

const htmlContent = computed(() => {
  if (!page.value?.content) {
    return ''
  }
  return markdownToHtml(page.value.content)
})

usePageSeo({
  description: () => page.value?.seo?.description || page.value?.description,
  image: () => page.value?.images?.[0]?.src,
  ogType: 'website',
  title: () => page.value?.seo?.title || page.value?.title,
  titleFallbackKey: 'seo.pages.about'
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      orientation="horizontal"
      :ui="{
        container: 'lg:flex sm:flex-row items-center',
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <!-- <UColorModeAvatar
        class="sm:rotate-0 size-36 rounded-lg ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
        :light="global.picture?.light!"
        :dark="global.picture?.dark!"
        :alt="t(global.picture?.altKey ?? 'global.picture.alt')"
      /> -->
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <!-- Markdown → HTML (contenu du site) -->
      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="htmlContent"
        class="prose prose-neutral dark:prose-invert max-w-none"
        v-html="htmlContent"
      />
      <!-- eslint-enable vue/no-v-html -->
      <!-- Logo Vue Montreal près de la mention -->
      <div
        v-if="page.content?.includes('Vue Montreal')"
        class="mt-8 flex items-center gap-4 p-4 rounded-lg border border-default bg-default/50"
      >
        <img
          src="/logos/vue-mtl.webp"
          alt="Vue Montreal"
          class="size-12 object-contain shrink-0"
          width="48"
          height="48"
        >
        <div>
          <p class="font-medium text-highlighted">
            Vue Montreal
          </p>
          <a
            href="https://www.meetup.com/vue-js-montreal/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary hover:underline"
          >
            {{ t('homepage.companies.visit') }}
          </a>
        </div>
      </div>
    </UPageSection>
    <ServicesCTADefault
      v-if="page.cta"
      :cta="page.cta"
      :with-animation="false"
    />
  </UPage>
</template>
