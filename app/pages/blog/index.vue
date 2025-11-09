<script setup lang="ts">
const { t, locale, defaultLocale } = useI18n()

const { data: page } = await useAsyncData(`blog-page-${locale.value}`, async () => {
  const allPages = await queryCollection('pages').all()
  const blogPage = allPages.find((p: any) =>
    (p.path === '/blog' || p.path === '/en/blog') && p.locale === locale.value
  )
  if (blogPage) {
    return blogPage
  }
  const fallback = allPages.find((p: any) =>
    (p.path === '/blog' || p.path?.includes('blog')) && p.locale === 'fr'
  )
  return fallback || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}
const { data: posts } = await useAsyncData(`blogs-${locale.value}`, async () => {
  const allPosts = await queryCollection('blog')
    .order('date', 'DESC')
    .all()
  // Filtrer par locale
  return allPosts.filter((post: any) => post.locale === locale.value)
})
if (!posts.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.blogsNotFound')
  })
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
          v-for="(post, index) in localizedPosts"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <UBlogPost
            variant="naked"
            orientation="horizontal"
            :to="post.path"
            v-bind="post"
            :ui="{
              root: 'md:grid md:grid-cols-2 group overflow-visible transition-all duration-300',
              image:
                'group-hover/blog-post:scale-105 rounded-lg shadow-lg border-4 border-muted ring-2 ring-default',
              header:
                index % 2 === 0
                  ? 'sm:-rotate-1 overflow-visible'
                  : 'sm:rotate-1 overflow-visible'
            }"
          />
        </Motion>
      </UBlogPosts>
    </UPageSection>
  </UPage>
</template>
