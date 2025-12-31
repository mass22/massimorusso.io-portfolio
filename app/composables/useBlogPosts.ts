import type { BlogCollectionItem } from '@nuxt/content'

export const useBlogPosts = async (limit?: number) => {
  const { locale } = useI18n()

  const { data: posts } = await useAsyncData(`blog-posts-${locale.value}-${limit || 'all'}`, async () => {
    const query = queryCollection('blog').order('date', 'DESC')
    const allPosts = await query.all()

    let filtered = allPosts.filter((post: any) => post.locale === locale.value)

    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered as BlogCollectionItem[]
  })

  const localizedPosts = computed(() => {
    const currentLocale = locale.value
    return (posts.value ?? []).map((post) => {
      let slug = post.slug

      if (!slug && post.path) {
        const pathSegments = post.path.split('/').filter(Boolean)
        const blogIndex = pathSegments.findIndex(seg => seg === 'blog')
        if (blogIndex !== -1 && blogIndex < pathSegments.length - 1) {
          slug = pathSegments[blogIndex + 1]
          if (slug) {
            slug = slug.replace(/\.(md|yml|yaml)$/, '')
          }
        }
      }

      if (!slug) {
        // Fallback sur path ou id si disponibles (avec cast pour les propriétés internes)
        const rawPost = post as any
        if (rawPost._path) {
          const pathParts = rawPost._path.split('/')
          const fileName = pathParts[pathParts.length - 1]
          slug = fileName.replace(/\.(md|yml|yaml)$/, '')
        } else if (rawPost._id) {
          const idParts = rawPost._id.split(':')
          if (idParts.length > 0) {
            const fileName = idParts[idParts.length - 1]
            slug = fileName.replace(/\.(md|yml|yaml)$/, '')
          }
        }
      }

      const blogPath = slug ? `/blog/${slug}` : '/blog'
      // Calculer le chemin de manière déterministe pour éviter les erreurs d'hydratation
      // Utiliser la locale actuelle de manière synchrone
      const localizedPath = currentLocale === 'fr' || !currentLocale
        ? blogPath
        : `/${currentLocale}${blogPath}`

      return {
        ...post,
        path: localizedPath
      }
    })
  })

  return {
    posts,
    localizedPosts
  }
}
