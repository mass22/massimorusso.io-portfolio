import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'

// Mock de fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch as any

// Mock de h3 (utilisé par Nuxt pour les auto-imports)
const mockCreateError = vi.fn((options: any) => {
  const error: any = new Error(options.statusMessage || 'Error')
  error.statusCode = options.statusCode || 500
  error.statusMessage = options.statusMessage
  throw error
})

const mockDefineEventHandler = vi.fn((handler: any) => handler)

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    createError: mockCreateError,
    defineEventHandler: mockDefineEventHandler
  }
})

// Exposer les fonctions globalement pour les auto-imports Nuxt
;(globalThis as any).createError = mockCreateError
;(globalThis as any).defineEventHandler = mockDefineEventHandler

// Import dynamique du handler pour éviter les problèmes d'auto-imports
let handler: any

describe('GET /api/podcast/rss', () => {
  // Mock console pour éviter les logs dans les tests
  const originalConsoleError = console.error
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeAll(async () => {
    // Supprimer les logs pendant les tests
    console.error = vi.fn()
    console.log = vi.fn()
    console.warn = vi.fn()

    // Charger le handler après que tous les mocks soient en place
    const module = await import('~/server/api/podcast/rss.get')
    handler = module.default
  })

  afterAll(() => {
    // Restaurer les logs après les tests
    console.error = originalConsoleError
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit parser correctement un flux RSS valide', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Test Episode]]></title>
      <description><![CDATA[Description de test]]></description>
      <pubDate>Mon, 16 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/test-episode</link>
      <guid>test-guid-123</guid>
      <enclosure url="https://audio.ausha.co/test.mp3" length="1000000" type="audio/mpeg"/>
      <itunes:duration>05:44</itunes:duration>
      <itunes:image href="https://image.ausha.co/test.jpg"/>
      <itunes:episode>1</itunes:episode>
      <itunes:season>1</itunes:season>
      <itunes:subtitle><![CDATA[Sous-titre de test]]></itunes:subtitle>
      <itunes:keywords>test, podcast, episode</itunes:keywords>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0]).toMatchObject({
      title: 'Test Episode',
      description: 'Description de test',
      link: 'https://podcast.ausha.co/test-episode',
      guid: 'test-guid-123',
      audioUrl: 'https://audio.ausha.co/test.mp3',
      duration: '05:44',
      cover: 'https://image.ausha.co/test.jpg',
      episode: 1,
      season: 1,
      subtitle: 'Sous-titre de test',
      tags: ['test', 'podcast', 'episode'],
      featured: false
    })
    expect(result[0].date).toBeInstanceOf(Date)
  })

  it('doit gérer plusieurs épisodes', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Episode 1]]></title>
      <pubDate>Mon, 16 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/ep1</link>
      <guid>guid-1</guid>
    </item>
    <item>
      <title><![CDATA[Episode 2]]></title>
      <pubDate>Tue, 17 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/ep2</link>
      <guid>guid-2</guid>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(result.length).toBe(2)
    // Les épisodes sont triés par date décroissante, donc Episode 2 (plus récent) vient en premier
    expect(result[0].title).toBe('Episode 2')
    expect(result[1].title).toBe('Episode 1')
  })

  it('doit trier les épisodes par date décroissante', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Ancien épisode]]></title>
      <pubDate>Mon, 01 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/old</link>
      <guid>old-guid</guid>
    </item>
    <item>
      <title><![CDATA[Nouvel épisode]]></title>
      <pubDate>Mon, 16 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/new</link>
      <guid>new-guid</guid>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(result[0].title).toBe('Nouvel épisode')
    expect(result[1].title).toBe('Ancien épisode')
  })

  it('doit gérer les épisodes sans certaines métadonnées', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Episode minimal]]></title>
      <pubDate>Mon, 16 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/minimal</link>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(result[0].title).toBe('Episode minimal')
    expect(result[0].date).toBeInstanceOf(Date)
    expect(result[0].featured).toBe(false)
  })

  it('doit gérer les erreurs de fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    const mockEvent = {}

    await expect(handler(mockEvent)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        statusMessage: 'Failed to fetch podcast episodes from RSS feed'
      })
    )
  })

  it('doit gérer les erreurs réseau', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const mockEvent = {}

    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('doit parser les tags depuis les keywords', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Episode avec tags</title>
      <pubDate>Mon, 16 Dec 2024 20:51:17 +0000</pubDate>
      <link>https://podcast.ausha.co/tags</link>
      <guid>tags-guid</guid>
      <itunes:keywords>architecture, frontend, vue, nuxt</itunes:keywords>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(result[0].tags).toEqual(['architecture', 'frontend', 'vue', 'nuxt'])
  })

  it('doit gérer les dates invalides', async () => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Episode date invalide</title>
      <pubDate>Date invalide</pubDate>
      <link>https://podcast.ausha.co/invalid</link>
      <guid>invalid-date</guid>
    </item>
  </channel>
</rss>`

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssXml
    })

    const mockEvent = {}
    const result = await handler(mockEvent)

    expect(result[0].date).toBeInstanceOf(Date)
  })
})
