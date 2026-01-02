<script setup lang="ts">
import { computed, ref } from 'vue'

const { t, locale } = useI18n()

// Récupérer les épisodes du RSS
const { data: rssEpisodes, error: rssError } = await useFetch('/api/podcast/rss', {
  key: `podcast-rss-episodes-${locale.value}`
})

// Récupérer les données de la page (pour les épisodes featured et les métadonnées)
const { data: page } = await useAsyncData(`podcast-page-${locale.value}`, async () => {
  const allPages = await queryCollection('podcast').all()
  const found = allPages.find((p: any) => p.locale === locale.value)
  return found || allPages.find((p: any) => p.locale === 'fr') || null
})

if (rssError.value) {
  console.error('Error loading podcast episodes:', rssError.value)
}

if (!page.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t('common.pageNotFound')
  })
}

// Utiliser le composable pour fusionner et organiser les épisodes
const { featuredEpisodes, regularEpisodes, allNonFeaturedEpisodes } = usePodcastEpisodes(
  rssEpisodes as Ref<any[] | null | undefined>,
  page
)

const showMoreEpisodes = computed(() => {
  // Afficher le bouton "Voir plus" s'il y a plus de 3 épisodes non-featured
  return allNonFeaturedEpisodes.value.length > 3
})

const displayAll = ref(false)

// SEO
useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || t('podcast.title', 'Podcast'),
  description: page.value?.seo?.description || page.value?.description || '',
  ogTitle: page.value?.seo?.title || page.value?.title || t('podcast.title', 'Podcast'),
  ogDescription: page.value?.seo?.description || page.value?.description || ''
})
</script>

<template>
  <UPage v-if="page">
    <!-- Hero Section -->
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{ container: 'pb-0' }"
    >
      <!-- Platforms -->
      <template
        v-if="page.platforms && page.platforms.length > 0"
        #links
      >
        <div class="flex flex-wrap items-center gap-4 mt-4">
          <UButton
            v-for="platform in page.platforms"
            :key="platform.url"
            :to="platform.url"
            target="_blank"
            rel="noopener noreferrer"
            :icon="platform.icon || 'i-lucide-external-link'"
            :label="platform.label"
            color="neutral"
            variant="outline"
            size="sm"
            :aria-label="`${t('podcast.listenOn', 'Écouter sur')} ${platform.label}`"
          />
        </div>
      </template>
    </UPageHero>

    <!-- Intro text -->
    <UPageSection
      v-if="page.intro"
      :ui="{ container: 'px-0 !pt-8' }"
    >
      <div class="prose prose-neutral dark:prose-invert max-w-none">
        <p class="text-lg text-muted leading-relaxed">
          {{ page.intro }}
        </p>
      </div>
    </UPageSection>

    <!-- Featured Episodes -->
    <UPageSection
      v-if="featuredEpisodes.length > 0"
      :title="t('podcast.featuredEpisodes', 'Épisodes à la une')"
      :ui="{ container: 'px-0 !pt-12 sm:!pt-16' }"
    >
      <div class="flex flex-col gap-6">
        <PodcastEpisodeCard
          v-for="(episode, index) in featuredEpisodes"
          :key="`featured-${episode.guid || episode.link || index}`"
          :episode="episode"
        />
      </div>
    </UPageSection>

    <!-- Regular Episodes -->
    <UPageSection
      :title="t('podcast.latestEpisodes', 'Derniers épisodes')"
      :ui="{ container: 'px-0 !pt-12 sm:!pt-16' }"
    >
      <div class="flex flex-col gap-6">
        <PodcastEpisodeCard
          v-for="(episode, index) in (displayAll ? allNonFeaturedEpisodes : regularEpisodes)"
          :key="`episode-${episode.guid || episode.link || index}`"
          :episode="episode"
        />
      </div>

      <!-- Show More / Show Less button -->
      <div
        v-if="showMoreEpisodes"
        class="flex justify-center mt-8"
      >
        <UButton
          :label="displayAll ? t('podcast.showLess', 'Afficher moins') : t('podcast.showMore', 'Voir tous les épisodes')"
          :icon="displayAll ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          color="neutral"
          variant="outline"
          @click="displayAll = !displayAll"
        />
      </div>
    </UPageSection>
  </UPage>
  <div
    v-else
    class="text-muted text-center py-16"
  >
    {{ t('podcast.noneAvailable', 'Aucun épisode disponible') }}
  </div>
</template>
