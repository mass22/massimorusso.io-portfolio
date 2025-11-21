
import { describe, expect, it, vi } from 'vitest'
import { usePageData } from '../../app/composables/usePageData'

// Mock des globales Nuxt
const mockUseI18n = vi.fn()
const mockUseAsyncData = vi.fn()
const mockQueryCollection = vi.fn()

vi.stubGlobal('useI18n', mockUseI18n)
vi.stubGlobal('useAsyncData', mockUseAsyncData)
vi.stubGlobal('queryCollection', mockQueryCollection)

describe('usePageData', () => {
  it('should fetch data with correct locale', async () => {
    mockUseI18n.mockReturnValue({ locale: { value: 'en' } })
    mockUseAsyncData.mockImplementation((key: any, handler: any) => {
      return { data: { value: handler() } }
    })

    const mockAll = vi.fn().mockResolvedValue([
      { locale: 'fr', title: 'French' },
      { locale: 'en', title: 'English' }
    ])
    mockQueryCollection.mockReturnValue({ all: mockAll })

    const { data } = await usePageData('index')
    const result = await data.value

    expect(result).toEqual({ locale: 'en', title: 'English' })
  })

  it('should fallback to fr if locale not found', async () => {
    mockUseI18n.mockReturnValue({ locale: { value: 'es' } })
    mockUseAsyncData.mockImplementation((key: any, handler: any) => {
      return { data: { value: handler() } }
    })

    const mockAll = vi.fn().mockResolvedValue([
      { locale: 'fr', title: 'French' }
    ])
    mockQueryCollection.mockReturnValue({ all: mockAll })

    const { data } = await usePageData('index')
    const result = await data.value

    expect(result).toEqual({ locale: 'fr', title: 'French' })
  })
})
