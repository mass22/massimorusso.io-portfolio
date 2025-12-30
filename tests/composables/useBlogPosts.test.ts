import { describe, expect, it, vi } from 'vitest'
import { useBlogPosts } from '../../app/composables/useBlogPosts'

// Mock des globales Nuxt
const mockUseI18n = vi.fn()
const mockUseAsyncData = vi.fn()
const mockQueryCollection = vi.fn()
const mockUseLocalePath = vi.fn()

vi.stubGlobal('useI18n', mockUseI18n)
vi.stubGlobal('useAsyncData', mockUseAsyncData)
vi.stubGlobal('queryCollection', mockQueryCollection)
vi.stubGlobal('useLocalePath', mockUseLocalePath)
vi.stubGlobal('computed', (fn: any) => ({ value: fn() }))

describe('useBlogPosts', () => {
  it('should filter posts by locale', async () => {
    mockUseI18n.mockReturnValue({ locale: { value: 'en' }, defaultLocale: 'fr' } as any)
    mockUseLocalePath.mockReturnValue(((path: string) => `/en${path}`) as any)

    const postsData = [
      { locale: 'fr', title: 'Post FR', slug: 'post-fr' },
      { locale: 'en', title: 'Post EN', slug: 'post-en' }
    ]

    mockUseAsyncData.mockImplementation(async (key: any, handler: any) => {
      const data = await handler()
      return { data: { value: data } }
    })

    const mockAll = vi.fn().mockResolvedValue(postsData)
    const mockOrder = vi.fn().mockReturnValue({ all: mockAll })
    mockQueryCollection.mockReturnValue({ order: mockOrder })

    const { localizedPosts } = await useBlogPosts()

    expect(localizedPosts.value).toHaveLength(1)
    expect(localizedPosts.value[0].title).toBe('Post EN')
    expect(localizedPosts.value[0].path).toBe('/en/blog/post-en')
  })
})
