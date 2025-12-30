<script setup lang="ts">
import { computed } from 'vue'
import { copyToClipboard } from '~/utils/clipboard'

const route = useRoute()

// Extraire l'ID depuis les paramètres de route
const id = computed(() => {
  const idParam = route.params.id
  if (Array.isArray(idParam)) {
    return idParam[0]
  }
  return idParam as string
})

// Extraire le token depuis les query params
const token = computed(() => {
  const tokenParam = route.query.token
  if (typeof tokenParam === 'string') {
    return tokenParam
  }
  return ''
})

// Vérifier que l'ID et le token sont présents
if (!id.value || !token.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'ID et token requis',
    fatal: true
  })
}

// Appeler l'API pour récupérer le lead
const { data: leadData, error, pending } = await useFetch(`/api/leads/${id.value}`, {
  query: {
    token: token.value
  },
  key: `lead-${id.value}-${token.value}`
})

// Gérer les erreurs
if (error.value) {
  const statusCode = error.value.statusCode || 500
  const message = error.value.data?.message || 'Une erreur est survenue lors du chargement du lead.'

  throw createError({
    statusCode,
    statusMessage: message,
    fatal: true
  })
}

// Vérifier que les données sont présentes
if (!leadData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lead introuvable',
    fatal: true
  })
}

// JSON formaté pour l'affichage
const formattedJson = computed(() => {
  if (!leadData.value?.context) return ''
  return JSON.stringify(leadData.value.context, null, 2)
})

// Fonction pour copier le résumé
const copySummary = () => {
  if (leadData.value?.summary) {
    copyToClipboard(leadData.value.summary, 'Résumé copié dans le presse-papiers')
  }
}

// Fonction pour copier le JSON
const copyJson = () => {
  if (formattedJson.value) {
    copyToClipboard(formattedJson.value, 'JSON copié dans le presse-papiers')
  }
}

// SEO - Empêcher l'indexation des pages de leads
useSeoMeta({
  title: `Lead #${id.value}`,
  description: `Détails du lead #${id.value}`,
  robots: 'noindex, nofollow, noarchive, nosnippet'
})

// Empêcher également l'indexation via les balises meta supplémentaires
useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'googlebot', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Détails du Lead"
      :description="`Lead #${id}`"
    />

    <UPageSection>
      <div
        v-if="pending"
        class="flex items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 animate-spin text-muted"
        />
        <span class="ml-3 text-muted">Chargement...</span>
      </div>

      <div
        v-else-if="leadData"
        class="space-y-6"
      >
        <!-- Informations générales -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Informations générales
              </h2>
              <UBadge
                :label="`ID: ${leadData.id}`"
                color="primary"
              />
            </div>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Créé le:</span>
              <span>{{ new Date(leadData.createdAt).toLocaleString('fr-FR', { timeZone: 'America/Montreal' }) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Mis à jour le:</span>
              <span>{{ new Date(leadData.updatedAt).toLocaleString('fr-FR', { timeZone: 'America/Montreal' }) }}</span>
            </div>
          </div>
        </UCard>

        <!-- Qualification -->
        <UCard v-if="leadData.qualification">
          <template #header>
            <h2 class="text-xl font-semibold">
              Qualification
            </h2>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-muted">Score:</span>
              <UBadge
                :label="leadData.qualification.score.toString()"
                :color="leadData.qualification.score >= 7 ? 'success' : leadData.qualification.score >= 4 ? 'warning' : 'error'"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted">Niveau:</span>
              <UBadge
                :label="leadData.qualification.level === 'high' ? 'Élevé' : leadData.qualification.level === 'medium' ? 'Moyen' : 'Faible'"
                :color="leadData.qualification.level === 'high' ? 'success' : leadData.qualification.level === 'medium' ? 'warning' : 'error'"
              />
            </div>
            <div
              v-if="leadData.qualification.recommendedOffer && leadData.qualification.recommendedOffer !== 'unknown'"
              class="flex items-center justify-between"
            >
              <span class="text-muted">Offre recommandée:</span>
              <span class="font-medium">
                {{ leadData.qualification.recommendedOffer === 'audit' ? 'Audit' : leadData.qualification.recommendedOffer === 'coaching' ? 'Coaching' : 'Mission' }}
              </span>
            </div>
            <div v-if="leadData.qualification.reasons && leadData.qualification.reasons.length > 0">
              <span class="text-muted block mb-2">Raisons:</span>
              <ul class="list-disc list-inside space-y-1">
                <li
                  v-for="(reason, index) in leadData.qualification.reasons"
                  :key="index"
                  class="text-sm"
                >
                  {{ reason }}
                </li>
              </ul>
            </div>
          </div>
        </UCard>

        <!-- Résumé -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Résumé
              </h2>
              <UButton
                icon="i-lucide-copy"
                color="primary"
                variant="outline"
                size="sm"
                @click="copySummary"
              >
                Copier
              </UButton>
            </div>
          </template>
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <pre class="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-muted/50 p-4 rounded-lg overflow-x-auto">{{ leadData.summary }}</pre>
          </div>
        </UCard>

        <!-- Contexte JSON -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Contexte JSON
              </h2>
              <UButton
                icon="i-lucide-copy"
                color="primary"
                variant="outline"
                size="sm"
                @click="copyJson"
              >
                Copier
              </UButton>
            </div>
          </template>
          <div class="relative">
            <pre class="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-muted/50 p-4 rounded-lg overflow-x-auto">{{ formattedJson }}</pre>
          </div>
        </UCard>
      </div>
    </UPageSection>
  </UPage>
</template>

<style scoped>
pre {
  max-height: 600px;
  overflow-y: auto;
}
</style>
