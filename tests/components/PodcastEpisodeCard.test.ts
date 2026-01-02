import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PodcastEpisodeCard from '~/app/components/PodcastEpisodeCard.vue'

// Mock des composables Nuxt
const mockUseI18n = vi.fn(() => ({
  t: (key: string, fallback?: string) => fallback || key,
  locale: { value: 'fr' }
}))

vi.stubGlobal('useI18n', mockUseI18n)

describe('PodcastEpisodeCard', () => {
  const mockEpisode = {
    title: 'Test Episode',
    description: 'Description de test',
    date: new Date('2024-12-16'),
    duration: '05:44',
    link: 'https://podcast.ausha.co/test',
    audioUrl: 'https://audio.ausha.co/test.mp3',
    cover: 'https://image.ausha.co/test.jpg',
    tags: ['test', 'podcast'],
    featured: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit afficher le titre de l\'épisode', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Test Episode')
  })

  it('doit afficher la date formatée', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    expect(wrapper.text()).toContain('2024')
  })

  it('doit afficher la durée si fournie', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    expect(wrapper.text()).toContain('05:44')
  })

  it('doit afficher le badge featured si l\'épisode est featured', () => {
    const featuredEpisode = { ...mockEpisode, featured: true }
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: featuredEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    const badges = wrapper.findAll('.u-badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('doit afficher les tags', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    expect(wrapper.text()).toContain('test')
    expect(wrapper.text()).toContain('podcast')
  })

  it('doit nettoyer la description HTML', () => {
    const episodeWithHtml = {
      ...mockEpisode,
      description: '<p>Description avec <strong>HTML</strong></p>'
    }

    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: episodeWithHtml
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    // La description nettoyée ne devrait pas contenir de balises HTML
    const text = wrapper.text()
    expect(text).not.toContain('<p>')
    expect(text).not.toContain('<strong>')
  })

  it('doit limiter la description à ~200 caractères', () => {
    const longDescription = 'a'.repeat(300)
    const episodeWithLongDesc = {
      ...mockEpisode,
      description: longDescription
    }

    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: episodeWithLongDesc
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    const text = wrapper.text()
    // La description devrait être tronquée avec "..."
    expect(text).toContain('...')
  })

  it('doit gérer les dates sous forme de string', () => {
    const episodeWithStringDate = {
      ...mockEpisode,
      date: '2024-12-16'
    }

    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: episodeWithStringDate
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    expect(wrapper.text()).toContain('2024')
  })

  it('doit afficher l\'image de couverture si fournie', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('doit afficher le bouton de téléchargement si audioUrl est fourni', () => {
    const wrapper = mount(PodcastEpisodeCard, {
      props: {
        episode: mockEpisode
      },
      global: {
        stubs: {
          UCard: {
            template: '<div class="u-card"><slot /></div>',
            props: ['class']
          },
          UBadge: {
            template: '<span class="u-badge"><slot /></span>',
            props: ['color', 'variant', 'size']
          },
          UButton: {
            template: '<a :href="to" :aria-label="ariaLabel" class="u-button"><slot /></a>',
            props: ['to', 'target', 'rel', 'color', 'variant', 'icon', 'label', 'aria-label', 'size']
          },
          UIcon: {
            template: '<span class="u-icon"></span>',
            props: ['name']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'loading', 'format', 'quality']
          },
          ClientOnly: {
            template: '<div><slot /></div>',
            props: []
          }
        }
      }
    })

    const downloadButtons = wrapper.findAll('a[aria-label*="Télécharger"]')
    expect(downloadButtons.length).toBeGreaterThan(0)
  })
})
