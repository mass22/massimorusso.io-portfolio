<script setup lang="ts">
import { computed } from 'vue'
import type { AboutCollectionItem } from '@nuxt/content'

const { t, locale } = useI18n()

const { data: page } = await useAsyncData(
  () => `about-${locale.value}`,
  async () => {
    const allPages = await queryCollection('about').all()
    const found = allPages.find(p => p.locale === locale.value)
    return found || allPages.find(p => p.locale === 'fr') || null
  },
  {
    watch: [locale]
  }
)

if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

const { global } = useAppConfig()

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description, ogDescription: page.value?.seo?.description || page.value?.description, ogTitle: page.value?.seo?.title || page.value?.title, title: page.value?.seo?.title || page.value?.title
})

// Render markdown content reactively
const htmlContent = computed(() => {
  if (!page.value?.content) return ''
  const html = markdownToHtml(page.value.content)
  return html
})


</script>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.markdown-content :deep(ul) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(a) {
  color: rgb(var(--color-primary-500));
  text-decoration: underline;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
</style>

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
        class="sm:rotate-4 size-36 rounded-lg ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
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
        class="markdown-content prose prose-neutral dark:prose-invert max-w-none"
        v-html="htmlContent"
      />
      <div class="flex flex-row justify-center items-center py-10 space-x-[-2rem]">
        <PolaroidItem
          v-for="(image, index) in page.images"
          :key="index"
          :image="image"
          :index
        />
      </div>
    </UPageSection>
  </UPage>
</template>
