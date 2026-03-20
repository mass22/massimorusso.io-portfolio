import type { IndexCollectionItem } from '@nuxt/content'

export const usePageData = async <T = IndexCollectionItem>(collection: string) => {
  const { locale } = useI18n()

  // Clé en getter : évite une clé figée au premier rendu (locale encore indéfinie).
  // On n'utilise pas .where() sur queryCollection : assertSafeQuery (Nuxt Content) rejette
  // certaines formes de WHERE ; SELECT * + filtre en mémoire est fiable.
  return useAsyncData<T | null>(
    () => `${collection}-${locale.value ?? 'fr'}`,
    async () => {
      const allPages = await queryCollection(collection as any).all()
      const loc = locale.value ?? 'fr'
      const found = allPages.find((p: any) => p.locale === loc)
      return (found
        || allPages.find((p: any) => p.locale === 'fr')
        || allPages[0]
        || null) as T | null
    }
  )
}
