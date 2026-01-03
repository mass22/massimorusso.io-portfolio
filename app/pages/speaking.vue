<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

type Event = {
  title: string
  date: string
  location: string
  url?: string
  category: 'Conference' | 'Live talk' | 'Podcast'
}

const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`speaking-${locale.value}`, async () => {
  const allPages = await queryCollection('speaking').all()
  const found = allPages.find(p => p.locale === locale.value)
  return found || allPages.find(p => p.locale === 'fr') || null
}, {
  watch: [locale]
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description, ogDescription: page.value?.seo?.description || page.value?.description, ogTitle: page.value?.seo?.title || page.value?.title, title: page.value?.seo?.title || page.value?.title
})

const { global } = useAppConfig()

// Fonction pour formater les événements avec la bonne locale
const formatEvents = (events: Event[], dateLocale: string): Record<Event['category'], (Event & { formattedDate: string })[]> => {
  const grouped: Record<Event['category'], (Event & { formattedDate: string })[]> = {
    'Conference': [],
    'Live talk': [],
    'Podcast': []
  }

  for (const event of events) {
    if (grouped[event.category]) {
      let formattedDate = ''
      if (event.date) {
        try {
          const date = new Date(event.date)
          if (!isNaN(date.getTime())) {
            formattedDate = new Intl.DateTimeFormat(dateLocale, {
              month: 'long',
              year: 'numeric'
            }).format(date)
          }
        } catch (e) {
          console.error('Error formatting date:', e)
        }
      }
      grouped[event.category].push({ ...event, formattedDate })
    }
  }
  return grouped
}

// Utiliser un ref réactif pour stocker les événements formatés
const groupedEvents = ref<Record<Event['category'], (Event & { formattedDate: string })[]>>({
  'Conference': [],
  'Live talk': [],
  'Podcast': []
})

// Fonction pour mettre à jour les événements formatés
const updateFormattedEvents = () => {
  const events = page.value?.events || []
  // Utiliser UNIQUEMENT la locale de la page (page.value?.locale) qui correspond au contenu affiché
  const pageLocale = page.value?.locale
  if (!pageLocale) {
    return
  }
  const dateLocale = pageLocale === 'fr' ? 'fr-CA' : 'en-US'
  groupedEvents.value = formatEvents(events, dateLocale)
}

// Mettre à jour quand la page change
watch(() => page.value, (newPage) => {
  if (newPage) {
    updateFormattedEvents()
  }
}, { immediate: true, deep: true })

// Aussi mettre à jour au montage côté client pour éviter les problèmes SSR
onMounted(() => {
  updateFormattedEvents()
})

function getCategoryLabel(category: string): string {
  const categoryMap: Record<Event['category'], string> = {
    'Conference': t('speaking.categories.conference'),
    'Live talk': t('speaking.categories.liveTalk'),
    'Podcast': t('speaking.categories.podcast')
  }
  return categoryMap[category as Event['category']] || category
}
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <template #links>
        <UButton
          v-if="page.links"
          :to="`mailto:${global.email}`"
          v-bind="page.links[0]"
          :aria-label="page.links[0]?.label || t('contact.hero.cta.contact')"
        />
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <template
        v-for="(eventsInCategory, category) in groupedEvents"
        :key="category"
      >
        <div
          class="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 mb-16 last:mb-0"
        >
          <div class="lg:col-span-1 mb-4 lg:mb-0">
            <h2
              class="lg:sticky lg:top-16 text-xl font-semibold tracking-tight text-highlighted"
            >
              {{ getCategoryLabel(String(category)) }}
            </h2>
          </div>

          <div class="lg:col-span-2 space-y-8">
            <div
              v-for="(event, index) in eventsInCategory"
              :key="`${category}-${index}`"
              class="group relative pl-6 border-l border-default"
            >
              <NuxtLink
                v-if="event.url"
                :to="event.url"
                class="absolute inset-0"
                :aria-label="`${event.title} - ${event.category === 'Podcast' ? t('speaking.listen') : t('speaking.watch')}`"
              />
              <div class="mb-1 text-sm font-medium text-muted">
                <span>{{ event.location }}</span>
                <span
                  v-if="event.location && event.date"
                  class="mx-1"
                >·</span>
                <ClientOnly>
                  <span v-if="event.formattedDate">{{ event.formattedDate }}</span>
                  <template #fallback>
                    <span v-if="event.date">{{ event.date }}</span>
                  </template>
                </ClientOnly>
              </div>

              <h3 class="text-lg font-semibold text-highlighted">
                {{ event.title }}
              </h3>

              <UButton
                v-if="event.url"
                target="_blank"
                :label="event.category === 'Podcast' ? t('speaking.listen') : t('speaking.watch')"
                variant="link"
                class="p-0 pt-2 gap-0"
              >
                <template #trailing>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </template>
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UPageSection>
  </UPage>
</template>
