<script setup lang="ts">
import type { IndexCollectionItem, BlogCollectionItem } from '@nuxt/content';
import { computed } from 'vue';

const { t, locale, defaultLocale } = useI18n()

defineProps<{
  page: IndexCollectionItem
}>()

const { data: posts } = await useAsyncData(`index-blogs-${locale.value}`, async () => {
  const allPosts = await queryCollection('blog')
    .order('date', 'DESC')
    .all()
  // Filtrer par locale et limiter à 3
  return allPosts
    .filter(post => post.locale === locale.value)
    .slice(0, 3)
})
if (!posts.value) {
  throw createError({ fatal: true, statusCode: 404, statusMessage: t('common.blogsNotFound') })
}

const defaultLocaleCode = computed(() => {
  const localeValue = typeof defaultLocale === 'string' ? defaultLocale : (defaultLocale as { value: string })?.value
  return localeValue || 'fr'
})

const localizedPosts = computed(() => {
  return (posts.value ?? []).map(post => {
    const localeCode = post.locale || defaultLocaleCode.value
    const basePath = post.path || (post.slug ? `/blog/${post.slug}` : '/blog')
    const segments = basePath.split('/').filter(Boolean)

    if (segments[0] === localeCode && localeCode !== defaultLocaleCode.value) {
      segments.shift()
    }

    const normalizedPath = `/${segments.join('/')}`
    const localizedPath = localeCode && localeCode !== defaultLocaleCode.value
      ? `/${localeCode}${normalizedPath}`
      : normalizedPath

    return {
      ...post,
      path: localizedPath
    }
  })
})
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
  <UPageSection
    :title="page.blog.title"
    :description="page.blog.description"
    :ui="{
      container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
        title: 'text-left text-lg sm:text-xl lg:text-xl font-normal text-muted',
        description: 'text-left mt-2 text-sm sm:text-sm lg:text-sm text-muted'
    }"
  >
    <UBlogPosts
      orientation="vertical"
      class="gap-4 lg:gap-y-4"
    >
        <Motion
        v-for="(post, index) in localizedPosts"
        :key="index"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <UBlogPost
        orientation="horizontal"
        variant="naked"
        v-bind="post"
        :to="post.path"
        :ui="{
          root: 'group relative lg:items-start lg:flex ring-0 hover:ring-0 ring-color-primary',
          body: '!px-0',
          header: 'hidden'
        }"
      >
        <template #footer>
          <UButton
            size="xs"
            variant="link"
            class="px-0 gap-0"
            :label="t('blog.readArticle')"
          >
            <template #trailing>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                    aria-hidden="true"
              />
            </template>
          </UButton>
        </template>
      </UBlogPost>
        </Motion>
    </UBlogPosts>
  </UPageSection>
  </Motion>
</template>
