<script setup lang="ts">
import { computed } from 'vue'

type Episode = {
  title: string
  description: string
  date: string | Date
  duration?: string
  tags?: string[]
  guest?: string
  link: string
  audioUrl?: string
  videoUrl?: string
  cover?: string
  coverAlt?: string
  featured?: boolean
  // Champs RSS additionnels
  subtitle?: string
  episode?: number
  season?: number
  guid?: string
}

const props = defineProps<{
  episode: Episode
}>()

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!props.episode.date) return ''
  const date = typeof props.episode.date === 'string' ? new Date(props.episode.date) : props.episode.date
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-CA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})

// Nettoyer la description HTML du RSS pour l'affichage
const cleanDescription = computed(() => {
  if (!props.episode.description) return ''

  let text = props.episode.description

  // Nettoyer les balises HTML (fonctionne côté serveur et client)
  // D'abord, remplacer les entités HTML communes
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')

  // Ensuite, supprimer les balises HTML
  text = text.replace(/<[^>]*>/g, '')

  // Nettoyer les espaces multiples et les sauts de ligne
  text = text.replace(/\s+/g, ' ').trim()

  // Limiter à ~200 caractères pour l'affichage
  return text.length > 200 ? text.substring(0, 200) + '...' : text
})

// Extraire les tags depuis les keywords RSS (format: "tag1,tag2,tag3")
const extractedTags = computed(() => {
  if (props.episode.tags && props.episode.tags.length > 0) {
    return props.episode.tags
  }
  return []
})

const isWebPImage = (imagePath: string): boolean => {
  return imagePath?.endsWith('.webp') ?? false
}
</script>

<template>
  <UCard
    class="group relative overflow-hidden transition-all duration-500 ease-out hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
  >
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Cover Image -->
      <div
        v-if="episode.cover"
        class="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden bg-muted"
      >
        <img
          v-if="isWebPImage(episode.cover)"
          :src="episode.cover"
          :alt="episode.coverAlt || episode.title"
          width="192"
          height="192"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
        <ClientOnly v-else>
          <NuxtImg
            :src="episode.cover"
            :alt="episode.coverAlt || episode.title"
            width="192"
            height="192"
            loading="lazy"
            format="webp"
            quality="85"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <template #fallback>
            <div class="w-full h-full bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50" />
          </template>
        </ClientOnly>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- Header -->
        <div class="flex flex-col gap-2">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-xl font-bold text-highlighted leading-tight group-hover:text-primary transition-colors duration-300">
              {{ episode.title }}
            </h3>
            <UBadge
              v-if="episode.featured"
              color="primary"
              variant="soft"
              size="sm"
            >
              {{ t('podcast.featured', 'À la une') }}
            </UBadge>
          </div>

          <!-- Meta info -->
          <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="size-4"
              />
              {{ formattedDate }}
            </span>
            <span
              v-if="episode.duration"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-4"
              />
              {{ episode.duration }}
            </span>
            <span
              v-if="episode.guest"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-user"
                class="size-4"
              />
              {{ episode.guest }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-base text-muted leading-relaxed line-clamp-3 flex-1">
          {{ cleanDescription }}
        </p>

        <!-- Tags -->
        <div
          v-if="extractedTags.length > 0"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="tag in extractedTags"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ tag }}
          </UBadge>
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-3 pt-2">
          <UButton
            :to="episode.link"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="solid"
            :icon="episode.audioUrl || episode.videoUrl ? 'i-lucide-headphones' : 'i-lucide-external-link'"
            :label="t('podcast.listen', 'Écouter')"
            :aria-label="`${t('podcast.listen', 'Écouter')} ${episode.title}`"
          />
          <UButton
            v-if="episode.audioUrl"
            :to="episode.audioUrl"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            variant="ghost"
            icon="i-lucide-download"
            :aria-label="`${t('podcast.download', 'Télécharger')} ${episode.title}`"
            size="sm"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
