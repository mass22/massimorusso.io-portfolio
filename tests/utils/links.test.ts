import { describe, expect, it } from 'vitest'
import { getNavLinks } from '../../app/utils/links'

describe('getNavLinks', () => {

  it('should return navigation links with translated labels', () => {
    const t = (key: string) => `translated_${key}`
    const locale = { value: 'fr' }
    const links = getNavLinks(t, undefined, locale)

    expect(links).toHaveLength(6)
    expect(links[0].label).toBe('translated_navigation.home')
    expect(links[0].to).toBe('/')
  })

  it('should use localePath if provided', () => {
    const t = (key: string) => key
    const localePath = (path: string) => `/fr${path}`
    const locale = { value: 'fr' }
    const links = getNavLinks(t, localePath as any, locale)

    expect(links[0].to).toBe('/fr/')
  })

  it('should use custom routes for French locale', () => {
    const t = (key: string) => key
    const locale = { value: 'fr' }
    const links = getNavLinks(t, undefined, locale)

    // Vérifier que les routes personnalisées sont utilisées
    const aboutLink = links.find(link => link.label === 'navigation.about')
    expect(aboutLink?.to).toBe('/a-propos')

    const speakingLink = links.find(link => link.label === 'navigation.speaking')
    expect(speakingLink?.to).toBe('/conferences')
  })

  it('should use custom routes for English locale', () => {
    const t = (key: string) => key
    const locale = { value: 'en' }
    const links = getNavLinks(t, undefined, locale)

    const aboutLink = links.find(link => link.label === 'navigation.about')
    expect(aboutLink?.to).toBe('/en/about')

    const speakingLink = links.find(link => link.label === 'navigation.speaking')
    expect(speakingLink?.to).toBe('/en/speaking')
  })
})
