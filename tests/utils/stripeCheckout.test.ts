import { describe, expect, it } from 'vitest'
import { appendStripeCheckoutLocale, resolveStripeCheckoutLocale } from '../../app/utils/stripeCheckout'

describe('resolveStripeCheckoutLocale', () => {
  it('returns fr for French locales', () => {
    expect(resolveStripeCheckoutLocale('fr')).toBe('fr')
    expect(resolveStripeCheckoutLocale('fr-CA')).toBe('fr')
  })

  it('returns en otherwise', () => {
    expect(resolveStripeCheckoutLocale('en')).toBe('en')
    expect(resolveStripeCheckoutLocale(undefined)).toBe('en')
  })
})

describe('appendStripeCheckoutLocale', () => {
  it('appends locale query param', () => {
    const url = appendStripeCheckoutLocale('https://buy.stripe.com/test', 'fr')
    expect(url).toBe('https://buy.stripe.com/test?locale=fr')
  })

  it('replaces existing locale param', () => {
    const url = appendStripeCheckoutLocale('https://buy.stripe.com/test?locale=en', 'fr')
    expect(url).toBe('https://buy.stripe.com/test?locale=fr')
  })

  it('returns empty string for empty input', () => {
    expect(appendStripeCheckoutLocale('', 'en')).toBe('')
  })
})
