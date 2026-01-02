import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { usePodcastEpisodes } from '../../app/composables/usePodcastEpisodes'

describe('usePodcastEpisodes', () => {
  const createMockRssEpisodes = () => ref([
    {
      title: 'Episode RSS 1',
      description: 'Description RSS 1',
      date: new Date('2024-12-16'),
      link: 'https://podcast.ausha.co/ep1',
      guid: 'rss-guid-1',
      audioUrl: 'https://audio.ausha.co/ep1.mp3',
      featured: false
    },
    {
      title: 'Episode RSS 2',
      description: 'Description RSS 2',
      date: new Date('2024-12-15'),
      link: 'https://podcast.ausha.co/ep2',
      guid: 'rss-guid-2',
      audioUrl: 'https://audio.ausha.co/ep2.mp3',
      featured: false
    }
  ])

  const createMockPageData = (featuredEpisodes: string[] = ['rss-guid-1'], episodes: any[] = []) => ref({
    featuredEpisodes,
    episodes
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit retourner tous les épisodes RSS', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const mockPageData = createMockPageData()
    const { episodes } = usePodcastEpisodes(mockRssEpisodes, mockPageData)

    expect(episodes.value.length).toBe(2)
    expect(episodes.value[0].title).toBe('Episode RSS 1')
    expect(episodes.value[1].title).toBe('Episode RSS 2')
  })

  it('doit marquer les épisodes featured selon la liste du YAML', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const mockPageData = createMockPageData(['rss-guid-1'])
    const { episodes, featuredEpisodes } = usePodcastEpisodes(mockRssEpisodes, mockPageData)

    const featured = episodes.value.filter(ep => ep.featured)
    expect(featured.length).toBe(1)
    expect(featured[0].guid).toBe('rss-guid-1')
    expect(featuredEpisodes.value.length).toBe(1)
  })

  it('doit trier les épisodes par date décroissante', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const mockPageData = createMockPageData()
    const { episodes } = usePodcastEpisodes(mockRssEpisodes, mockPageData)

    expect(episodes.value[0].date.getTime()).toBeGreaterThanOrEqual(
      episodes.value[1].date.getTime()
    )
  })

  it('doit retourner les 3 derniers épisodes non-featured', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const mockPageData = createMockPageData(['rss-guid-1'])
    const { regularEpisodes } = usePodcastEpisodes(mockRssEpisodes, mockPageData)

    expect(regularEpisodes.value.length).toBe(1) // Seulement ep2 car ep1 est featured
    expect(regularEpisodes.value[0].guid).toBe('rss-guid-2')
  })

  it('doit retourner tous les épisodes non-featured', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const mockPageData = createMockPageData(['rss-guid-1'])
    const { allNonFeaturedEpisodes } = usePodcastEpisodes(mockRssEpisodes, mockPageData)

    expect(allNonFeaturedEpisodes.value.length).toBe(1)
    expect(allNonFeaturedEpisodes.value[0].guid).toBe('rss-guid-2')
  })

  it('doit gérer les épisodes featured par lien', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const pageDataWithLink = createMockPageData(['https://podcast.ausha.co/ep1'])
    const { featuredEpisodes } = usePodcastEpisodes(mockRssEpisodes, pageDataWithLink)

    expect(featuredEpisodes.value.length).toBe(1)
    expect(featuredEpisodes.value[0].link).toBe('https://podcast.ausha.co/ep1')
  })

  it('doit gérer les épisodes featured par slug', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const pageDataWithSlug = createMockPageData(['ep1'])
    const { featuredEpisodes } = usePodcastEpisodes(mockRssEpisodes, pageDataWithSlug)

    expect(featuredEpisodes.value.length).toBe(1)
  })

  it('doit gérer une liste vide d\'épisodes RSS', () => {
    const emptyRssEpisodes = ref([])
    const mockPageData = createMockPageData()
    const { episodes, featuredEpisodes, regularEpisodes } = usePodcastEpisodes(
      emptyRssEpisodes,
      mockPageData
    )

    expect(episodes.value.length).toBe(0)
    expect(featuredEpisodes.value.length).toBe(0)
    expect(regularEpisodes.value.length).toBe(0)
  })

  it('doit gérer une liste vide de featuredEpisodes', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const pageDataEmpty = createMockPageData([], []) // Pas d'épisodes YAML avec featured: true
    const { featuredEpisodes } = usePodcastEpisodes(mockRssEpisodes, pageDataEmpty)

    // Aucun épisode ne devrait être featured car featuredEpisodes est vide et episodes aussi
    expect(featuredEpisodes.value.length).toBe(0)
  })

  it('doit fusionner les épisodes YAML avec les épisodes RSS', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const pageDataWithEpisodes = createMockPageData([], [
      {
        title: 'Episode YAML',
        description: 'Description YAML',
        date: new Date('2024-12-14'),
        link: 'https://podcast.ausha.co/yaml',
        guid: 'yaml-guid',
        featured: true
      }
    ])

    const { episodes, featuredEpisodes } = usePodcastEpisodes(mockRssEpisodes, pageDataWithEpisodes)

    // Doit contenir les épisodes RSS + l'épisode YAML
    expect(episodes.value.length).toBe(3)
    // L'épisode YAML avec featured: true devrait être dans featuredEpisodes
    // Mais comme featuredEpisodes est vide, seul l'épisode YAML avec featured: true devrait être featured
    expect(featuredEpisodes.value.length).toBe(1)
    expect(featuredEpisodes.value[0].title).toBe('Episode YAML')
  })

  it('doit mettre à jour un épisode RSS existant avec les données YAML', () => {
    const mockRssEpisodes = createMockRssEpisodes()
    const pageDataWithMatchingEpisode = createMockPageData([], [
      {
        title: 'Episode RSS 1 Modifié',
        description: 'Description modifiée',
        date: new Date('2024-12-16'),
        link: 'https://podcast.ausha.co/ep1',
        guid: 'rss-guid-1',
        featured: true,
        guest: 'Invité spécial'
      }
    ])

    const { episodes, featuredEpisodes } = usePodcastEpisodes(
      mockRssEpisodes,
      pageDataWithMatchingEpisode
    )

    const updatedEpisode = episodes.value.find(ep => ep.guid === 'rss-guid-1')
    expect(updatedEpisode).toBeDefined()
    expect(updatedEpisode?.title).toBe('Episode RSS 1 Modifié')
    expect(updatedEpisode?.guest).toBe('Invité spécial')
    expect(updatedEpisode?.featured).toBe(true)
    expect(featuredEpisodes.value.length).toBe(1)
  })
})
