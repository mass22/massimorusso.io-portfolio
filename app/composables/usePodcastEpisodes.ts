import { computed, type Ref } from 'vue'

export const usePodcastEpisodes = (
  rssEpisodes: Ref<any[] | null | undefined>,
  pageData: Ref<any>
) => {
  // Fusionner les épisodes RSS avec les épisodes featured du YAML
  const allEpisodes = computed(() => {
    const episodes: any[] = []

    // D'abord, ajouter les épisodes RSS
    if (rssEpisodes.value && Array.isArray(rssEpisodes.value)) {
      episodes.push(...rssEpisodes.value)
    }

    // Marquer les épisodes featured selon la liste dans le YAML
    const featuredList = pageData.value?.featuredEpisodes || []
    if (featuredList.length > 0) {
      episodes.forEach((episode: any) => {
        // Vérifier si l'épisode est dans la liste featured (par GUID ou lien)
        const isFeatured = featuredList.some((ref: string) => {
          const refLower = ref.toLowerCase().trim()
          const guidLower = (episode.guid || '').toLowerCase().trim()
          const linkLower = (episode.link || '').toLowerCase().trim()

          // Correspondance exacte
          if (guidLower === refLower || linkLower === refLower) {
            return true
          }

          // Correspondance partielle (pour les liens)
          if (linkLower && refLower && (linkLower.includes(refLower) || refLower.includes(linkLower))) {
            return true
          }

          // Correspondance par slug/identifiant dans l'URL
          const linkSlug = linkLower.split('/').pop() || ''
          const refSlug = refLower.split('/').pop() || ''
          if (linkSlug && refSlug && (linkSlug === refSlug || linkSlug.includes(refSlug) || refSlug.includes(linkSlug))) {
            return true
          }

          return false
        })
        if (isFeatured) {
          episode.featured = true
        }
      })
    }

    // Ensuite, ajouter/mettre à jour avec les épisodes featured du YAML (pour compatibilité)
    if (pageData.value?.episodes) {
      const featuredEpisodes = pageData.value.episodes.filter((ep: any) => ep.featured)

      for (const featuredEp of featuredEpisodes) {
        // Chercher si un épisode RSS correspond (par titre ou guid)
        const existingIndex = episodes.findIndex((ep: any) =>
          ep.title === featuredEp.title
          || ep.guid === featuredEp.guid
          || ep.link === featuredEp.link
        )

        if (existingIndex !== -1) {
          // Mettre à jour l'épisode existant avec les données featured
          episodes[existingIndex] = {
            ...episodes[existingIndex],
            ...featuredEp,
            featured: true
          }
        } else {
          // Ajouter l'épisode featured s'il n'existe pas dans le RSS
          episodes.push({
            ...featuredEp,
            featured: true
          })
        }
      }
    }

    // Trier par date décroissante
    return episodes.sort((a: any, b: any) => {
      const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : a.date) : null
      const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : b.date) : null

      if (!dateA || !dateB) {
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
      }

      const timeA = dateA instanceof Date && !isNaN(dateA.getTime()) ? dateA.getTime() : 0
      const timeB = dateB instanceof Date && !isNaN(dateB.getTime()) ? dateB.getTime() : 0

      return timeB - timeA
    })
  })

  // Épisodes featured (sélectionnés via Nuxt Studio)
  const featuredEpisodes = computed(() => {
    return allEpisodes.value.filter((ep: any) => ep.featured)
  })

  // Épisodes réguliers (non-featured)
  const regularEpisodes = computed(() => {
    const nonFeatured = allEpisodes.value.filter((ep: any) => !ep.featured)
    return nonFeatured.slice(0, 3) // 3 derniers par défaut
  })

  // Tous les épisodes non-featured
  const allNonFeaturedEpisodes = computed(() => {
    return allEpisodes.value.filter((ep: any) => !ep.featured)
  })

  return {
    episodes: allEpisodes,
    featuredEpisodes,
    regularEpisodes,
    allNonFeaturedEpisodes
  }
}
