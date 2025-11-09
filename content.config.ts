import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const createBaseSchema = () => z.object({
  description: z.string(), title: z.string()
})

const createButtonSchema = () => z.object({
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(), icon: z.string().optional(), label: z.string(), size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(), target: z.enum(['_blank', '_self']).optional(), to: z.string().optional(), variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional()
})

const createImageSchema = () => z.object({
  alt: z.string(), src: z.string().editor({ input: 'media' })
})

const createAuthorSchema = () => z.object({
  avatar: createImageSchema().optional(), description: z.string().optional(), name: z.string(), to: z.string().optional(), twitter: z.string().optional(), username: z.string().optional()
})

const createTestimonialSchema = () => z.object({
  author: createAuthorSchema(), quote: z.string()
})

export default defineContentConfig({
  collections: {
    about: defineCollection({
      type: 'page',
      source: [
        { include: 'about.yml' },
        { include: 'about.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional(),
        content: z.string(),
        images: z.array(createImageSchema())
      })
    }), blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        minRead: z.number(),
        date: z.date(),
        image: z.string().nonempty().editor({ input: 'media' }),
        author: createAuthorSchema(),
        locale: z.enum(['fr', 'en']).default('fr'),
        slug: z.string().optional()
      })
    }), index: defineCollection({
      type: 'page',
      source: [
        { include: 'index.yml' },
        { include: 'index.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional(),
        hero: z.object({
          tags: z.array(z.string()),
          links: z.array(createButtonSchema()),
          images: z.array(createImageSchema()),
          isResourcesAvailable: z.boolean().optional()
        }),
        about: createBaseSchema(),
        experience: createBaseSchema().extend({
          items: z.array(z.object({
            date: z.date(),
            position: z.string(),
            company: z.object({
              name: z.string(),
              url: z.string(),
              logo: z.string().editor({ input: 'icon' }),
              color: z.string()
            })
          }))
        }),
        blog: createBaseSchema(),
        podcast: createBaseSchema()
      })
    }), pages: defineCollection({
      type: 'page',
      source: [
        { include: 'projects.yml' },
        { include: 'projects.en.yml' },
        { include: 'blog.yml' },
        { include: 'blog.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        links: z.array(createButtonSchema())
      })
    }), projects: defineCollection({
      type: 'data',
      source: 'projects/*.yml',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        image: z.string().nonempty().editor({ input: 'media' }),
        url: z.string().nonempty(),
        tags: z.array(z.string()),
        date: z.date()
      })
    }), ressources: defineCollection({
      type: 'page',
      source: [
        { include: 'ressources.yml' },
        { include: 'ressources.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        links: z.array(createButtonSchema()),
        ressources: z.array(z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          type: z.string().nonempty(),
          icon: z.string().nonempty(),
          url: z.string().nonempty(),
          download: createButtonSchema().optional()
        }))
      })
    }), services: defineCollection({
      type: 'page',
      source: [
        { include: 'services.yml' },
        { include: 'services.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional(),
        content: z.string(),
        images: z.array(createImageSchema()),
        testimonials: z.array(createTestimonialSchema()),
        faq: createBaseSchema().extend({
          categories: z.array(
            z.object({
              title: z.string().nonempty(),
              questions: z.array(
                z.object({
                  label: z.string().nonempty(),
                  content: z.string().nonempty()
                })
              )
            }))
        })
      })
    }), speaking: defineCollection({
      type: 'page',
      source: [
        { include: 'speaking.yml' },
        { include: 'speaking.en.yml' }
      ],
      schema: z.object({
        locale: z.enum(['fr', 'en']).default('fr'),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional(),
        links: z.array(createButtonSchema()),
        events: z.array(z.object({
          category: z.enum(['Live talk', 'Podcast', 'Conference']),
          title: z.string(),
          date: z.date(),
          location: z.string(),
          url: z.string().optional()
        }))
      })
    })
  }
})
