<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content';
import { computed } from 'vue';

type Event = {
  title: string
  date: string
  location: string
  url?: string
  category: 'Conference' | 'Live talk' | 'Podcast'
}

type SpeakingSection = {
  title?: string
  description?: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()

defineProps<{
  page: IndexCollectionItem & { speaking?: SpeakingSection }
}>()

// Récupérer les événements speaking
const { data: speakingPage } = await useAsyncData(`speaking-${locale.value}`, async () => {
  try {
    const allPages = await queryCollection('speaking').all()
    const found = allPages.find((p: any) => p.locale === locale.value)
    const page = found || allPages.find((p: any) => p.locale === 'fr') || null
    return page
  } catch (error) {
    console.error('Error fetching speaking page:', error)
    return null
  }
})

// Récupérer les 3 derniers événements (toutes catégories, triés par date)
const latestEvents = computed(() => {
  if (!speakingPage.value) {
    console.warn('speakingPage.value is null/undefined')
    return []
  }

  if (!speakingPage.value.events) {
    console.warn('No events property in speakingPage:', speakingPage.value)
    return []
  }

  const events = [...speakingPage.value.events]
    .filter((event: any) => {
      if (!event) return false
      if (!event.date) {
        console.warn('Event without date:', event)
        return false
      }
      return true
    })
    .sort((a: any, b: any) => {
      // Trier par date décroissante (plus récent en premier)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, 3) // Limiter à 3
  return events as Event[]
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(
    locale.value === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
}

function getCategoryIcon(category: string): string {
  const iconMap: Record<Event['category'], string> = {
    'Conference': 'i-lucide-presentation',
    'Live talk': 'i-lucide-video',
    'Podcast': 'i-lucide-mic'
  }
  return iconMap[category as Event['category']] || 'i-lucide-mic'
}

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
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="page.speaking?.title || t('navigation.speaking')"
      :description="page.speaking?.description || t('homepage.speaking.description')"
      :ui="{
        container: '!pt-12 sm:!pt-16 lg:!pt-20',
        title: 'text-left text-lg sm:text-xl lg:text-xl font-normal text-muted',
        description: 'text-left mt-2 text-sm sm:text-sm lg:text-sm text-muted'
      }"
    >
      <div v-if="latestEvents.length === 0" class="text-center text-muted py-8">
        <p>Aucun événement disponible pour le moment.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Motion
          v-for="(event, index) in latestEvents"
          :key="`event-${index}-${event.title}`"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <UCard
            :to="event.url || localePath('/speaking')"
            :target="event.url ? '_blank' : undefined"
            class="group h-full hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.02]"
            :ui="{
              root: 'flex flex-col h-full',
              body: 'flex-1 flex flex-col',
              footer: 'pt-4'
            }"
          >
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div class="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <UIcon
                      :name="getCategoryIcon(event.category)"
                      class="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <span class="text-xs font-medium text-muted uppercase tracking-wide">
                    {{ getCategoryLabel(event.category) }}
                  </span>
                </div>
              </div>
            </template>

            <div class="flex-1 flex flex-col gap-3">
              <h3 class="text-lg font-semibold text-highlighted leading-tight group-hover:text-primary transition-colors">
                {{ event?.title || 'No title' }}
              </h3>
              <div class="flex flex-col gap-2 text-sm text-muted">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" aria-hidden="true" />
                  <span>{{ event?.location || 'No location' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar" class="size-4 shrink-0" aria-hidden="true" />
                  <span>{{ event?.date ? formatDate(event.date) : 'No date' }}</span>
                </div>
              </div>
            </div>

            <template #footer>
              <UButton
                :to="event.url || localePath('/speaking')"
                :target="event.url ? '_blank' : undefined"
                variant="link"
                size="sm"
                class="px-0 gap-1 text-primary"
                :label="event.category === 'Podcast' ? t('speaking.listen') : t('speaking.watch')"
              >
                <template #trailing>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 transition-all duration-300 ease-out opacity-0 group-hover:translate-x-2 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </template>
              </UButton>
            </template>
          </UCard>
        </Motion>
      </div>

      <div class="flex justify-center mt-8">
        <UButton
          :to="localePath('/speaking')"
          variant="outline"
          size="md"
          :label="t('homepage.speaking.viewAll')"
          icon="i-lucide-arrow-right"
          class="group"
        >
          <template #trailing>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </template>
        </UButton>
      </div>
    </UPageSection>
  </Motion>
</template>

