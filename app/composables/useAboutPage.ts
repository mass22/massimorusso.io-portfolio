export const useAboutPage = async () => {
  const { t, locale } = useI18n()

  const { data: page } = await useAsyncData(
    `about-${locale.value}`,
    async () => {
      const allPages = await queryCollection('about').all()
      const found = allPages.find((p: any) => p.locale === locale.value)
      return (found || allPages.find((p: any) => p.locale === 'fr') || null) as any
    },
    {
      watch: [locale]
    }
  )

  if (!page.value) {
    throw createError({
      fatal: true,
      statusCode: 404,
      statusMessage: t('common.pageNotFound')
    })
  }

  const { global } = useAppConfig()

  useSeoMeta({
    title: page.value?.seo?.title || page.value?.title,
    description: page.value?.seo?.description || page.value?.description,
    ogTitle: page.value?.seo?.title || page.value?.title,
    ogDescription: page.value?.seo?.description || page.value?.description
  })

  return {
    page,
    global,
    t
  }
}

