import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getNavLinks } from '../../app/utils/links'

// Mock de useI18n
const mockUseI18n = vi.fn()

vi.stubGlobal('useI18n', mockUseI18n)

describe('getNavLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Configuration par défaut
    mockUseI18n.mockReturnValue({
      locale: { value: 'fr' }
    })
  })

  it('should return navigation links with translated labels', () => {
    mockUseI18n.mockReturnValue({
      locale: { value: 'fr' }
    })

    const t = (key: string) => `translated_${key}`
    const links = getNavLinks(t)

    expect(links).toHaveLength(6)
    expect(links[0].label).toBe('translated_navigation.home')
    expect(links[0].to).toBe('/')
  })

  it('should use localePath if provided', () => {
    mockUseI18n.mockReturnValue({
      locale: { value: 'fr' }
    })

    const t = (key: string) => key
    const localePath = (path: string) => `/fr${path}`
    const links = getNavLinks(t, localePath as any)

    expect(links[0].to).toBe('/fr/')
  })

  it('should use custom routes for French locale', () => {
    mockUseI18n.mockReturnValue({
      locale: { value: 'fr' }
    })

    const t = (key: string) => key
    const links = getNavLinks(t)

    // Vérifier que les routes personnalisées sont utilisées
    const aboutLink = links.find(link => link.label === 'navigation.about')
    expect(aboutLink?.to).toBe('/a-propos')

    const speakingLink = links.find(link => link.label === 'navigation.speaking')
    expect(speakingLink?.to).toBe('/conferences')
  })

  it('should use custom routes for English locale', () => {
    mockUseI18n.mockReturnValue({
      locale: { value: 'en' }
    })

    const t = (key: string) => key
    const links = getNavLinks(t)

    const aboutLink = links.find(link => link.label === 'navigation.about')
    expect(aboutLink?.to).toBe('/en/about')

    const speakingLink = links.find(link => link.label === 'navigation.speaking')
    expect(speakingLink?.to).toBe('/en/speaking')
  })
})
