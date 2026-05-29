export type StripeCheckoutLocale = 'fr' | 'en'

export function resolveStripeCheckoutLocale(locale?: string): StripeCheckoutLocale {
  return locale?.startsWith('fr') ? 'fr' : 'en'
}

/** Ajoute ou remplace `locale=fr|en` sur un lien Stripe Checkout / Payment Link. */
export function appendStripeCheckoutLocale(
  url: string,
  locale: StripeCheckoutLocale
): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)
    parsed.searchParams.set('locale', locale)
    return parsed.toString()
  } catch {
    return trimmed
  }
}
