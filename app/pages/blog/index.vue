<script setup lang="ts">
const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`blog-page-${locale.value}`, async () => {
  const allPages = await queryCollection('pages').all()

  // Stratégie 1: Chercher directement par locale (le plus fiable)
  const blogPage = allPages.find((p) => {
    const rawPage = p as any
    // Vérifier la locale d'abord
    if (rawPage.locale !== locale.value) {
      return false
    }

    // Ensuite vérifier le nom de fichier ou le path
    const fileName = rawPage._path?.split('/').pop()
      || rawPage._id?.split(':').pop()
      || ''
    const path = rawPage.path
      || rawPage._path
      || ''

    // Pour la locale anglaise, chercher blog.en.yml ou /en/blog
    if (locale.value === 'en') {
      return fileName === 'blog.en.yml'
        || fileName.includes('blog.en')
        || path.includes('/en/blog')
        || path.includes('blog.en')
    }

    // Pour la locale française, chercher blog.yml ou /blog (sans préfixe)
    return fileName === 'blog.yml'
      || (fileName.includes('blog') && !fileName.includes('.en'))
      || (path.includes('/blog') && !path.includes('/en/'))
  })

  if (blogPage) {
    return blogPage
  }

  // Stratégie 2: Fallback - chercher n'importe quel fichier blog avec la bonne locale
  const localeFallback = allPages.find((p) => {
    const rawPage = p as any
    if (rawPage.locale !== locale.value) {
      return false
    }
    const fileName = rawPage._path?.split('/').pop()
      || rawPage._id?.split(':').pop()
      || ''
    return fileName.includes('blog')
  })

  if (localeFallback) {
    return localeFallback
  }

  // Stratégie 3: Dernier fallback - utiliser le fichier français si disponible
  const frFallback = allPages.find((p) => {
    const rawPage = p as any
    if (rawPage.locale !== 'fr') {
      return false
    }
    const fileName = rawPage._path?.split('/').pop()
      || rawPage._id?.split(':').pop()
      || ''
    return fileName === 'blog.yml'
      || (fileName.includes('blog') && !fileName.includes('.en'))
  })

  return frFallback || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}
const { localizedPosts: posts } = await useBlogPosts()

// Permettre une page blog vide (pas d'erreur si pas de posts)
// La page peut exister même sans contenu

// Fonction helper pour générer un hash stable basé sur l'ID du post
// Utiliser uniquement _id ou slug pour éviter les différences d'hydratation
// Ne pas utiliser post.path car il peut varier entre serveur et client
const getPostHash = (post: any): number => {
  // Utiliser _id en priorité car c'est l'identifiant le plus stable
  const id = post._id || post.slug || ''
  if (!id) return 0

  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Filtrer et nettoyer les posts pour s'assurer que les images sont des URLs valides
const validPosts = computed(() => {
  return posts.value?.map((post) => {
    // Si l'image est un ID de média (commence par "blog:" ou n'est pas une URL), la retirer
    if (post.image && typeof post.image === 'string') {
      if (post.image.startsWith('blog:') || (!post.image.startsWith('http') && !post.image.startsWith('/'))) {
        return { ...post, image: undefined }
      }
    }
    return post
  }) || []
})

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  title: page.value?.seo?.title || page.value?.title
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
      <UBlogPosts
        v-if="validPosts.length > 0"
        orientation="vertical"
      >
        <Motion
          v-for="(post, index) in validPosts"
          :key="(post as any)._id || post.slug || `post-${index}`"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <NuxtLink
            :to="post.path"
            class="block"
          >
            <UBlogPost
              variant="naked"
              orientation="horizontal"
              v-bind="post"
              :ui="{
                root: 'md:grid md:grid-cols-2 group overflow-visible transition-all duration-300 cursor-pointer',
                image:
                  'group-hover/blog-post:scale-105 rounded-lg shadow-lg border-4 border-muted ring-2 ring-default',
                header:
                  getPostHash(post) % 2 === 0
                    ? 'sm:-rotate-1 overflow-visible'
                    : 'sm:rotate-1 overflow-visible'
              }"
            />
          </NuxtLink>
        </Motion>
      </UBlogPosts>
      <div
        v-else
        class="text-center py-12"
      >
        <p class="text-muted">
          {{ t('common.blogsNotFound') || 'Aucun article disponible pour le moment.' }}
        </p>
      </div>
    </UPageSection>
  </UPage>
</template>
