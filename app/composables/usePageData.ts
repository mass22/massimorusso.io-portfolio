import type { IndexCollectionItem } from '@nuxt/content'

export const usePageData = async <T = IndexCollectionItem>(collection: string) => {
  const { locale } = useI18n()

  return useAsyncData<T | null>(`${collection}-${locale.value}`, async () => {
    const allPages = await queryCollection(collection as any).all()
    const found = allPages.find((p: any) => p.locale === locale.value)
    return (found || allPages.find((p: any) => p.locale === 'fr') || null) as T | null
  })
}
