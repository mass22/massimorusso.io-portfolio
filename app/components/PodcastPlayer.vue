<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'
import { onMounted, ref } from 'vue'

defineProps<{
  page: IndexCollectionItem
}>()

const { t } = useI18n()

const iframeLoaded = ref(false)
const iframeError = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const handleIframeLoad = () => {
  iframeLoaded.value = true
  iframeError.value = false
}

const handleIframeError = () => {
  iframeError.value = true
  iframeLoaded.value = false
  // Ne pas logger l'erreur dans la console pour éviter le bruit
  // Les erreurs 403/404 du player externe sont normales et ne doivent pas être affichées
}

onMounted(() => {
  // Vérifier si l'iframe est chargé après un délai
  if (iframeRef.value) {
    setTimeout(() => {
      if (!iframeLoaded.value && !iframeError.value) {
        // Si l'iframe n'a pas chargé après 5 secondes, on considère qu'il y a un problème
        // mais on ne fait rien car cela peut être normal (CORS, blocage, etc.)
      }
    }, 5000)
  }
})
</script>

<template>
  <UPageSection
    :title="page.podcast.title"
    :description="page.podcast.description"
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 sm:gap-6 lg:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UModal title="Abonnez-vous sur vos plateformes préférées">
      <UButton
        label="S'abonner"
        icon="i-lucide-rss"
        color="neutral"
        variant="subtle"
        class="w-fit"
      />

      <template #body>
        <div class="podcast-platforms">
          <a
            target="_blank"
            href="https://feed.ausha.co/pJ1YkF6eXmgj"
            aria-label="S'abonner au podcast via RSS"
            rel="noopener noreferrer"
            class="platform-link rss"
          >
            <UIcon
              name="i-lucide-rss"
              class="w-8 h-8 text-[#EE802F]"
            />
          </a>
          <a
            target="_blank"
            href="https://www.youtube.com/channel/UCMYbBAzF4nqB4R29vRJ3hXg"
            aria-label="Écouter le podcast sur YouTube"
            rel="noopener noreferrer"
            class="platform-link youtube"
          >
            <UIcon
              name="i-simple-icons-youtube"
              class="w-8 h-8 text-[#FF0000]"
            />
          </a>
          <a
            target="_blank"
            href="https://podcasts.apple.com/ca/podcast/on-parle-dev/id1815187281"
            aria-label="Écouter le podcast sur Apple Podcasts"
            rel="noopener noreferrer"
            class="platform-link apple"
          >
            <UIcon
              name="i-simple-icons-applepodcasts"
              class="w-8 h-8 text-[#B535F5]"
            />
          </a>
          <a
            target="_blank"
            href="https://open.spotify.com/show/7pRx7V2awXyEalPsrnC7i1"
            aria-label="Écouter le podcast sur Spotify"
            rel="noopener noreferrer"
            class="platform-link spotify"
          >
            <UIcon
              name="i-simple-icons-spotify"
              class="w-8 h-8 text-[#1DB954]"
            />
          </a>
          <a
            target="_blank"
            href="https://www.deezer.com/show/1001894371"
            aria-label="Écouter le podcast sur Deezer"
            rel="noopener noreferrer"
            class="platform-link deezer"
          >
            <UIcon
              name="i-simple-icons-deezer"
              class="w-8 h-8 text-[#A238FF]"
            />
          </a>
          <a
            target="_blank"
            href="https://podcastaddict.com/podcast/on-parle-dev/5885427"
            aria-label="Écouter le podcast sur Podcast Addict"
            rel="noopener noreferrer"
            class="platform-link podcast-addict"
          >
            <UIcon
              name="i-simple-icons-podcastaddict"
              class="w-8 h-8 text-[#F4842D]"
            />
          </a>
          <a
            target="_blank"
            href="https://music.amazon.com/podcasts/b773b6aa-e35b-422b-aebe-a5de9ad6f38d"
            aria-label="Écouter le podcast sur Amazon Music"
            rel="noopener noreferrer"
            class="platform-link amazon"
          >
            <UIcon
              name="i-simple-icons-amazonmusic"
              class="w-8 h-8 text-[#00A8E1]"
            />
          </a>
          <a
            target="_blank"
            href="https://overcast.fm/itunes1815187281"
            aria-label="Écouter le podcast sur Overcast"
            rel="noopener noreferrer"
            class="platform-link overcast"
          >
            <UIcon
              name="i-simple-icons-overcast"
              class="w-8 h-8 text-[#FC7E0F]"
            />
          </a>
        </div>
      </template>
    </UModal>
    <ClientOnly>
      <div class="relative w-full min-h-[705px] sm:min-h-[420px]">
        <iframe
          id="ausha-P04n"
          ref="iframeRef"
          name="Ausha Podcast Player"
          title="Lecteur de podcast Ausha"
          frameborder="0"
          loading="lazy"
          class="h-[705px] sm:h-[420px] rounded-xl mx-auto"
          style="border: none; width:90%; background-color: #000000;"
          src="https://player.ausha.co/?showId=pJ1YkF6eXmgj&color=%23ffffff&multishow=false&playlist=true&dark=true&v=3&playerId=ausha-P04n"
          referrerpolicy="no-referrer-when-downgrade"
          allow="autoplay; encrypted-media"
          :class="{ 'opacity-0': !iframeLoaded && !iframeError }"
          @load="handleIframeLoad"
          @error="handleIframeError"
        />
        <!-- Fallback silencieux si l'iframe ne charge pas -->
        <div
          v-if="iframeError"
          class="absolute inset-0 flex items-center justify-center bg-muted rounded-lg"
          role="region"
          aria-label="Lecteur de podcast"
        >
          <div class="text-center p-6">
            <p class="text-sm text-muted mb-4">
              {{ t('podcast.player.error') }}
            </p>
            <UButton
              to="https://feed.ausha.co/pJ1YkF6eXmgj"
              target="_blank"
              variant="outline"
              size="sm"
              :label="t('podcast.player.fallback')"
            />
          </div>
        </div>
        <!-- Indicateur de chargement -->
        <div
          v-if="!iframeLoaded && !iframeError"
          class="absolute inset-0 flex items-center justify-center bg-muted rounded-lg animate-pulse"
          :aria-label="t('podcast.player.loading')"
          role="status"
        >
          <div class="text-center">
            <div class="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p class="text-xs text-muted">
              {{ t('podcast.player.loading') }}
            </p>
          </div>
        </div>
      </div>
      <template #fallback>
        <div class="w-full min-h-[685px] sm:min-h-[420px]">
          <div class="flex items-center justify-center bg-muted rounded-lg h-full min-h-[685px] sm:min-h-[420px]">
            <div class="text-center p-6">
              <div class="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p class="text-xs text-muted">
                {{ t('podcast.player.loading') }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </UPageSection>
</template>

<style scoped lang="scss">
    .subscribe-overlay {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        &__icon {
            width: 40px;
            height: 40px;
        }
    }
</style>
