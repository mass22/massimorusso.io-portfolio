<script setup lang="ts">
import type { PagesCollectionItem, BlogCollectionItem } from '@nuxt/content'

const { t, locale, defaultLocale } = useI18n()
const localePath = useLocalePath()

const { data: page } = await useAsyncData(`blog-page-${locale.value}`, async () => {
  const allPages = await queryCollection('pages').all()
  const blogPage = allPages.find(p =>
    (p.path === '/blog' || p.path === '/en/blog') && p.locale === locale.value
  )
  if (blogPage) {
    return blogPage
  }
  const fallback = allPages.find(p =>
    (p.path === '/blog' || p.path?.includes('blog')) && p.locale === 'fr'
  )
  return fallback || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}
const { localizedPosts: posts } = await useBlogPosts()

if (!posts.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.blogsNotFound')
  })
}

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description, ogDescription: page.value?.seo?.description || page.value?.description, ogTitle: page.value?.seo?.title || page.value?.title, title: page.value?.seo?.title || page.value?.title
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <UBlogPosts orientation="vertical">
        <Motion
          v-for="(post, index) in posts"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <NuxtLink :to="post.path" class="block">
            <UBlogPost
              variant="naked"
              orientation="horizontal"
              v-bind="post"
              :ui="{
                root: 'md:grid md:grid-cols-2 group overflow-visible transition-all duration-300 cursor-pointer',
                image:
                  'group-hover/blog-post:scale-105 rounded-lg shadow-lg border-4 border-muted ring-2 ring-default',
                header:
                  index % 2 === 0
                    ? 'sm:-rotate-1 overflow-visible'
                    : 'sm:rotate-1 overflow-visible'
              }"
            />
          </NuxtLink>
        </Motion>
      </UBlogPosts>
    </UPageSection>
  </UPage>
</template>
