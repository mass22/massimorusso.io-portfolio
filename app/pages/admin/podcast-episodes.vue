<script setup lang="ts">
import { ref, computed } from 'vue'

// Protéger cette page avec le middleware admin
definePageMeta({
  middleware: 'admin'
})

// Récupérer les épisodes RSS
const { data: episodes, pending, error } = await useFetch('/api/podcast/rss', {
  key: 'admin-podcast-episodes'
})

// Récupérer les épisodes featured actuels
const { data: page } = await useAsyncData('admin-podcast-page', async () => {
  const allPages = await queryCollection('podcast').all()
  return allPages.find((p: any) => p.locale === 'fr') || null
})

const featuredEpisodes = computed(() => {
  return page.value?.featuredEpisodes || []
})

const isFeatured = (episode: any) => {
  if (!featuredEpisodes.value || featuredEpisodes.value.length === 0) return false
  return featuredEpisodes.value.some((ref: string) => {
    const refLower = ref.toLowerCase().trim()
    const guidLower = (episode.guid || '').toLowerCase().trim()
    const linkLower = (episode.link || '').toLowerCase().trim()

    if (guidLower === refLower || linkLower === refLower) return true
    if (linkLower && refLower && (linkLower.includes(refLower) || refLower.includes(linkLower))) return true

    const linkSlug = linkLower.split('/').pop() || ''
    const refSlug = refLower.split('/').pop() || ''
    if (linkSlug && refSlug && (linkSlug === refSlug || linkSlug.includes(refSlug) || refSlug.includes(linkSlug))) return true

    return false
  })
}

const copiedItem = ref<string | null>(null)

const copyToClipboard = async (text: string, type: 'guid' | 'link' | 'slug') => {
  try {
    let textToCopy = text
    if (type === 'slug') {
      textToCopy = text.split('/').pop() || text
    }
    await navigator.clipboard.writeText(textToCopy)
    copiedItem.value = `${type}-${textToCopy}`
    setTimeout(() => {
      copiedItem.value = null
    }, 2000)
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
  }
}

const searchQuery = ref('')
const filteredEpisodes = computed(() => {
  if (!episodes.value) return []
  if (!searchQuery.value) return episodes.value

  const query = searchQuery.value.toLowerCase()
  return episodes.value.filter((ep: any) =>
    ep.title?.toLowerCase().includes(query)
    || ep.description?.toLowerCase().includes(query)
    || ep.guid?.toLowerCase().includes(query)
    || ep.link?.toLowerCase().includes(query)
  )
})

// SEO - Empêcher l'indexation
useSeoMeta({
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-background py-8">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">
          Épisodes du Podcast RSS
        </h1>
        <p class="text-muted">
          Liste des épisodes provenant du flux RSS. Utilisez les boutons pour copier le GUID ou le lien à ajouter dans <code>featuredEpisodes</code> du fichier <code>content/podcast.yml</code>.
        </p>
      </div>

      <!-- Recherche -->
      <div class="mb-6">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher un épisode..."
          icon="i-lucide-search"
          size="lg"
        />
      </div>

      <!-- Erreur -->
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        title="Erreur"
        :description="error.message || 'Impossible de charger les épisodes'"
        class="mb-6"
      />

      <!-- Loading -->
      <div
        v-if="pending"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 animate-spin text-primary"
        />
      </div>

      <!-- Liste des épisodes -->
      <div
        v-else-if="episodes && episodes.length > 0"
        class="space-y-4"
      >
        <UCard
          v-for="episode in filteredEpisodes"
          :key="episode.guid || episode.link"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Image -->
            <div
              v-if="episode.cover"
              class="flex-shrink-0 w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted"
            >
              <img
                :src="episode.cover"
                :alt="episode.title"
                class="w-full h-full object-cover"
              >
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-lg font-semibold text-highlighted">
                  {{ episode.title }}
                </h3>
                <UBadge
                  v-if="isFeatured(episode)"
                  color="primary"
                  variant="soft"
                  size="sm"
                >
                  Featured
                </UBadge>
              </div>

              <p class="text-sm text-muted mb-3 line-clamp-2">
                {{ episode.description?.substring(0, 200) }}...
              </p>

              <!-- Métadonnées -->
              <div class="flex flex-wrap items-center gap-4 text-xs text-muted mb-4">
                <span v-if="episode.date">
                  <UIcon
                    name="i-lucide-calendar"
                    class="size-3 inline mr-1"
                  />
                  {{ new Date(episode.date).toLocaleDateString('fr-FR') }}
                </span>
                <span v-if="episode.duration">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-3 inline mr-1"
                  />
                  {{ episode.duration }}
                </span>
                <span v-if="episode.episode">
                  <UIcon
                    name="i-lucide-podcast"
                    class="size-3 inline mr-1"
                  />
                  Épisode {{ episode.episode }}
                </span>
              </div>

              <!-- Informations techniques -->
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-mono text-muted">GUID:</span>
                  <code class="text-xs bg-muted px-2 py-1 rounded">{{ episode.guid || 'N/A' }}</code>
                  <UButton
                    v-if="episode.guid"
                    size="xs"
                    :color="copiedItem === `guid-${episode.guid}` ? 'success' : 'neutral'"
                    variant="ghost"
                    :icon="copiedItem === `guid-${episode.guid}` ? 'i-lucide-check' : 'i-lucide-copy'"
                    @click="copyToClipboard(episode.guid, 'guid')"
                  >
                    {{ copiedItem === `guid-${episode.guid}` ? 'Copié !' : 'Copier GUID' }}
                  </UButton>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-mono text-muted">Lien:</span>
                  <code class="text-xs bg-muted px-2 py-1 rounded truncate max-w-md">{{ episode.link || 'N/A' }}</code>
                  <UButton
                    v-if="episode.link"
                    size="xs"
                    :color="copiedItem === `link-${episode.link}` ? 'success' : 'neutral'"
                    variant="ghost"
                    :icon="copiedItem === `link-${episode.link}` ? 'i-lucide-check' : 'i-lucide-copy'"
                    @click="copyToClipboard(episode.link, 'link')"
                  >
                    {{ copiedItem === `link-${episode.link}` ? 'Copié !' : 'Copier lien' }}
                  </UButton>
                </div>

                <div
                  v-if="episode.link"
                  class="flex flex-wrap items-center gap-2"
                >
                  <span class="text-xs font-mono text-muted">Slug:</span>
                  <code class="text-xs bg-muted px-2 py-1 rounded">{{ episode.link.split('/').pop() }}</code>
                  <UButton
                    size="xs"
                    :color="copiedItem === `slug-${episode.link.split('/').pop()}` ? 'success' : 'neutral'"
                    variant="ghost"
                    :icon="copiedItem === `slug-${episode.link.split('/').pop()}` ? 'i-lucide-check' : 'i-lucide-copy'"
                    @click="copyToClipboard(episode.link, 'slug')"
                  >
                    {{ copiedItem === `slug-${episode.link.split('/').pop()}` ? 'Copié !' : 'Copier slug' }}
                  </UButton>
                </div>
              </div>

              <!-- Lien vers l'épisode -->
              <div class="mt-4">
                <UButton
                  :to="episode.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  color="primary"
                  variant="outline"
                  icon="i-lucide-external-link"
                >
                  Voir l'épisode
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Aucun épisode -->
      <div
        v-else
        class="text-center py-12 text-muted"
      >
        <UIcon
          name="i-lucide-podcast"
          class="size-12 mx-auto mb-4 opacity-50"
        />
        <p>Aucun épisode trouvé</p>
      </div>

      <!-- Instructions -->
      <UCard class="mt-8 bg-muted/50">
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <h3 class="text-lg font-semibold mb-2">
            Comment utiliser cette page
          </h3>
          <ol class="list-decimal list-inside space-y-2 text-sm">
            <li>Parcourez la liste des épisodes RSS ci-dessus</li>
            <li>Cliquez sur "Copier GUID", "Copier lien" ou "Copier slug" pour l'épisode que vous souhaitez mettre en featured</li>
            <li>Ouvrez le fichier <code>content/podcast.yml</code> dans Nuxt Studio ou votre éditeur</li>
            <li>Ajoutez la valeur copiée dans la liste <code>featuredEpisodes</code></li>
            <li>Sauvegardez le fichier</li>
          </ol>
          <div class="mt-4 p-4 bg-background rounded-lg">
            <p class="text-xs font-mono mb-2">
              Exemple dans podcast.yml:
            </p>
            <pre class="text-xs"><code>featuredEpisodes:
  - "4bf0be0072765b8c22dc4f00c9f73682d51873bf"
  - "https://podcast.ausha.co/on-parle-dev/episode-slug"</code></pre>
          </div>
          <UAlert
            color="warning"
            variant="soft"
            title="Mode développement uniquement"
            description="Cette page n'est accessible qu'en mode développement. Elle sera complètement bloquée en production."
            class="mt-4"
          />
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
