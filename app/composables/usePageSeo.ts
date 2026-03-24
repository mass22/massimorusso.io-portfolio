import { computed, toValue, type MaybeRefOrGetter } from 'vue'

function resolveText(v: MaybeRefOrGetter<string | undefined | null>): string {
  const raw = toValue(v)
  return typeof raw === 'string' ? raw.trim() : ''
}

function toAbsoluteMediaUrl(src: string | undefined, siteBase: string): string | undefined {
  if (!src) {
    return undefined
  }
  if (src.startsWith('http')) {
    return src
  }
  if (src.startsWith('/')) {
    return `${siteBase.replace(/\/$/, '')}${src}`
  }
  return src
}

/** Segment de titre pour `titleTemplate` : évite « Nom - Nom » et les suffixes déjà présents dans le contenu. */
function normalizeSeoTitleSegment(raw: string, siteName: string, defaultTitle: string): string {
  let s = raw.trim()
  if (!s) {
    return defaultTitle
  }
  const esc = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (s.localeCompare(siteName, undefined, { sensitivity: 'accent' }) === 0 || s.toLowerCase() === siteName.toLowerCase()) {
    return defaultTitle
  }
  s = s.replace(new RegExp(`\\s*[-–—|]\\s*${esc}\\s*$`, 'i'), '').trim()
  s = s.replace(new RegExp(`^${esc}\\s*[-–—]\\s*`, 'i'), '').trim()
  return s || defaultTitle
}

export type PageSeoOptions = {
  /** Titre affiché (balise <title>, Open Graph, Twitter) */
  title: MaybeRefOrGetter<string | undefined | null>
  /**
   * Clé i18n (ex. `seo.pages.blog`) : titre descriptif de la page si le contenu est absent
   * ou se résume au nom du site (évite un titre générique sans indication sur la page).
   */
  titleFallbackKey?: string
  /** Meta description */
  description: MaybeRefOrGetter<string | undefined | null>
  ogType?: MaybeRefOrGetter<'article' | 'website' | undefined>
  /** Image partagée (chemin /... ou URL absolue) ; sinon photo du site */
  image?: MaybeRefOrGetter<string | undefined | null>
}

/**
 * Métadonnées SEO homogènes : title, description, Open Graph et Twitter (titres + textes).
 */
export function usePageSeo(options: PageSeoOptions) {
  const { t } = useI18n()
  const { global } = useAppConfig()
  const siteUrl = useSiteUrl()

  const title = computed(() => {
    const s = resolveText(options.title)
    const fallback = options.titleFallbackKey
      ? t(options.titleFallbackKey)
      : t('seo.pages.generic')
    const siteName = t('seo.siteName')
    return normalizeSeoTitleSegment(s || fallback, siteName, fallback)
  })

  const description = computed(() => {
    const s = resolveText(options.description)
    return s || t('seo.defaultDescription')
  })

  const ogType = computed(() => toValue(options.ogType) ?? 'website')

  const shareImage = computed(() => {
    const raw = toValue(options.image)
    const explicit = typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
    const src = explicit || global.picture?.light
    return toAbsoluteMediaUrl(src, siteUrl) ?? src
  })

  useSeoMeta({
    description: () => description.value,
    ogDescription: () => description.value,
    ogImage: () => shareImage.value,
    ogTitle: () => title.value,
    ogType: () => ogType.value,
    title: () => title.value,
    twitterDescription: () => description.value,
    twitterImage: () => shareImage.value,
    twitterTitle: () => title.value
  })
}
