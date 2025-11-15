<script setup lang="ts">
const { t, locale, defaultLocale } = useI18n()
const localePath = useLocalePath()

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

const defaultLocaleCode = computed(() => {
  if (typeof defaultLocale === 'string') {
    return defaultLocale
  }
  return (defaultLocale as any)?.value || defaultLocale || 'fr'
})

const localizedPosts = computed(() => {
  return (posts.value ?? []).map((post: any) => {
    // Extraire le slug du chemin du post
    // Le chemin peut être /blog/slug ou /en/blog/slug ou blog/slug.md
    let slug = post.slug

    if (!slug && post.path) {
      // Extraire le slug du chemin
      const pathSegments = post.path.split('/').filter(Boolean)
      // Enlever 'blog' et la locale si présente
      const blogIndex = pathSegments.findIndex((seg: string) => seg === 'blog')
      if (blogIndex !== -1 && blogIndex < pathSegments.length - 1) {
        slug = pathSegments[blogIndex + 1]
        // Enlever l'extension si présente
        if (slug) {
          slug = slug.replace(/\.(md|yml|yaml)$/, '')
        }
      }
    }

    // Si toujours pas de slug, utiliser le nom du fichier depuis _path ou _id
    if (!slug) {
      if (post._path) {
        const pathParts = post._path.split('/')
        const fileName = pathParts[pathParts.length - 1]
        slug = fileName.replace(/\.(md|yml|yaml)$/, '')
      } else if (post._id) {
        // Utiliser _id comme fallback (format: content:blog:filename.md)
        const idParts = post._id.split(':')
        if (idParts.length > 0) {
          const fileName = idParts[idParts.length - 1]
          slug = fileName.replace(/\.(md|yml|yaml)$/, '')
        }
      }
    }

    // Construire le chemin localisé avec localePath
    const blogPath = slug ? `/blog/${slug}` : '/blog'
    const localizedPath = localePath(blogPath)

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
