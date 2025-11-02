<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content';

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
    .filter((post: any) => post.locale === locale.value)
    .slice(0, 3)
})
if (!posts.value) {
  throw createError({ statusCode: 404, statusMessage: t('common.blogsNotFound'), fatal: true })
}

const defaultLocaleCode = computed(() => defaultLocale.value || 'fr')

const localizedPosts = computed(() => {
  return (posts.value ?? []).map((post: any) => {
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
  <UPageSection
    :title="page.blog.title"
    :description="page.blog.description"
    :ui="{
      container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UBlogPosts
      orientation="vertical"
      class="gap-4 lg:gap-y-4"
    >
      <UBlogPost
        v-for="(post, index) in localizedPosts"
        :key="index"
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
              />
            </template>
          </UButton>
        </template>
      </UBlogPost>
    </UBlogPosts>
  </UPageSection>
</template>
