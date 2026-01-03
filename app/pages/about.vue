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

const { global } = useAppConfig()

const htmlContent = computed(() => {
  if (!page.value?.content) return ''
  return markdownToHtml(page.value.content)
})

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogDescription: page.value?.seo?.description || page.value?.description
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
      <UColorModeAvatar
        class="sm:rotate-0 size-36 rounded-lg ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
        :light="global.picture?.light!"
        :dark="global.picture?.dark!"
        :alt="t(global.picture?.altKey ?? 'global.picture.alt')"
      />
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <div
        v-if="htmlContent"
        class="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-highlighted prose-headings:leading-tight prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-0 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mb-5 prose-h3:mt-10 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted prose-p:mb-8 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-strong:text-highlighted prose-strong:font-semibold prose-ul:my-8 prose-ul:space-y-4 prose-li:text-muted prose-li:leading-relaxed prose-ol:my-8 prose-ol:space-y-4"
        v-html="htmlContent"
      />
    </UPageSection>
  </UPage>
</template>

<style>
/* Style global pour forcer l'espacement des paragraphes - spécificité maximale */
.prose.prose-lg p {
  margin-bottom: 2rem !important;
  margin-top: 0 !important;
}

.prose.prose-lg p + p {
  margin-top: 2rem !important;
}

.prose.prose-lg h2 {
  margin-top: 3rem !important;
  margin-bottom: 1.5rem !important;
  color: var(--color-primary) !important;
}

.prose.prose-lg h2:first-child {
  margin-top: 0 !important;
}

.prose.prose-lg h3 {
  margin-top: 2.5rem !important;
  margin-bottom: 1.25rem !important;
  color: var(--color-highlighted) !important;
}

.prose.prose-lg h2 + p,
.prose.prose-lg h3 + p {
  margin-top: 0 !important;
}

.prose.prose-lg ul,
.prose.prose-lg ol {
  margin-top: 2rem !important;
  margin-bottom: 2rem !important;
}

.prose.prose-lg li {
  margin-bottom: 0.75rem !important;
}

.prose.prose-lg p + ul,
.prose.prose-lg p + ol {
  margin-top: 2rem !important;
}

.prose.prose-lg ul + p,
.prose.prose-lg ol + p {
  margin-top: 2rem !important;
}
</style>
