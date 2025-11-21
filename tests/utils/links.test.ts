import { describe, expect, it } from 'vitest'
import { getNavLinks } from '../../app/utils/links'

describe('getNavLinks', () => {
  it('should return navigation links with translated labels', () => {
    const t = (key: string) => `translated_${key}`
    const links = getNavLinks(t)

    expect(links).toHaveLength(6)
    expect(links[0].label).toBe('translated_navigation.home')
    expect(links[0].to).toBe('/')
  })

  it('should use localePath if provided', () => {
    const t = (key: string) => key
    const localePath = (path: string) => `/fr${path}`
    const links = getNavLinks(t, localePath as any)

    expect(links[0].to).toBe('/fr/')
  })
})
