<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type LeadQualification = {
  score: number
  level: 'high' | 'medium' | 'low' | string
  reasons?: string[]
  recommendedOffer?: string
}

type LeadListItem = {
  id: number
  email?: string
  name?: string
  completedAt: string
  createdAt: string
  updatedAt: string
  stepCount: number
  qualification?: LeadQualification
  metadata?: {
    referrer?: string
    timestamp?: string
    userAgent?: string
  }
  accessToken?: string
}

type LeadsResponse = {
  total: number
  items: LeadListItem[]
}

definePageMeta({
  middleware: 'admin'
})

usePageSeo({
  title: 'Dashboard Leads',
  description: 'Liste des leads enregistrés.',
  ogType: 'website',
  titleFallbackKey: 'seo.pages.lead'
})

useSeoMeta({
  robots: 'noindex, nofollow, noarchive, nosnippet'
})

useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'googlebot', content: 'noindex, nofollow' }
  ]
})

const limit = ref<number>(10)
const page = ref<number>(0)
const offset = computed(() => page.value * limit.value)

const leadsResponse = ref<LeadsResponse | null>(null)
const isLoading = ref<boolean>(true)
const loadError = ref<string | null>(null)
const loadStatusCode = ref<number | null>(null)

const router = useRouter()
const route = useRoute()

const redirectToLogin = () => {
  const next = route.fullPath || '/lead'
  router.push(`/admin/login?next=${encodeURIComponent(next)}`)
}

const load = async () => {
  isLoading.value = true
  loadError.value = null
  loadStatusCode.value = null

  try {
    leadsResponse.value = await $fetch<LeadsResponse>('/api/leads', {
      query: {
        limit: limit.value,
        offset: offset.value
      },
      credentials: 'include'
    })
  } catch (err: any) {
    loadStatusCode.value = err?.statusCode
      || err?.response?.status
      || err?.response?.statusCode
      || err?.data?.statusCode
      || null
    loadError.value = err?.data?.message || err?.message || 'Impossible de charger les leads.'
    if (loadStatusCode.value === 401) {
      loadError.value = 'Accès refusé. Connecte-toi pour voir les leads.'
      redirectToLogin()
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Les cookies d'auth ne sont fiables qu'après hydratation (chargement côté client).
onMounted(async () => {
  await load()
})

watch([page, limit], async () => {
  // Si la page n'est pas encore hydratée, on évite un double chargement.
  if (!leadsResponse.value && !isLoading.value) return
  await load()
})

const totalPages = computed(() => {
  const total = leadsResponse.value?.total ?? 0
  return total > 0 ? Math.ceil(total / limit.value) : 1
})

const canPrev = computed(() => page.value > 0)
const canNext = computed(() => page.value < totalPages.value - 1)

const goPrev = () => {
  if (!canPrev.value) return
  page.value -= 1
}

const goNext = () => {
  if (!canNext.value) return
  page.value += 1
}

const query = ref<string>('')
const filteredItems = computed<LeadListItem[]>(() => {
  const items = leadsResponse.value?.items ?? []
  const q = query.value.trim().toLowerCase()

  if (!q) {
    return items
  }

  return items.filter((item) => {
    const id = String(item.id)
    const email = (item.email || '').toLowerCase()
    const name = (item.name || '').toLowerCase()
    const referrer = (item.metadata?.referrer || '').toLowerCase()
    return id.includes(q) || email.includes(q) || name.includes(q) || referrer.includes(q)
  })
})

const getLevelLabel = (level?: string) => {
  if (!level) return '—'
  if (level === 'high') return 'Élevé'
  if (level === 'medium') return 'Moyen'
  if (level === 'low') return 'Faible'
  return level
}

const getLevelColor = (level?: string) => {
  if (level === 'high') return 'success'
  if (level === 'medium') return 'warning'
  if (level === 'low') return 'error'
  return 'neutral'
}

const getScoreColor = (score?: number) => {
  if (typeof score !== 'number') return 'neutral'
  if (score >= 7) return 'success'
  if (score >= 4) return 'warning'
  return 'error'
}

const getOfferLabel = (offer?: string) => {
  if (!offer) return null
  if (offer === 'audit') return 'Audit'
  if (offer === 'coaching') return 'Coaching'
  if (offer === 'mission') return 'Mission'
  if (offer === 'unknown') return null
  return offer
}

const formatFr = (dateString?: string) => {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', {
    timeZone: 'America/Montreal',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const buildLeadDetailUrl = (lead: LeadListItem) => {
  const token = lead.accessToken
  if (!token) return `/lead/${lead.id}`
  return `/lead/${lead.id}?token=${encodeURIComponent(token)}`
}

const copyToClipboard = useCopyToClipboard()
const copiedToken = ref<string | null>(null)
const copyToken = async (token: string, leadId: number) => {
  await copyToClipboard(token, `Token du lead #${leadId} copié`)
  copiedToken.value = String(leadId)
  setTimeout(() => {
    copiedToken.value = null
  }, 2000)
}

const limitOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 }
]
</script>

<template>
  <UPage>
    <UPageHero
      v-if="!isLoading && !loadError"
      title="Dashboard des leads"
      description="Affiche la liste des leads enregistrés. Détails sur `lead/[id].vue`."
      :ui="{ title: 'text-3xl sm:text-5xl font-bold', description: 'mt-4 text-base sm:text-lg' }"
    />

    <UPageSection>
      <!-- Header / stats -->
      <div
        v-if="!isLoading && !loadError"
        class="flex flex-col gap-4 mb-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div class="flex flex-wrap gap-3 items-center">
            <UCard class="p-4">
              <div class="text-muted text-sm">
                Total leads
              </div>
              <div class="text-2xl font-semibold">
                {{ leadsResponse?.total ?? '—' }}
              </div>
            </UCard>
            <UCard class="p-4">
              <div class="text-muted text-sm">
                Sur la page
              </div>
              <div class="text-2xl font-semibold">
                {{ leadsResponse?.items?.length ?? 0 }}
              </div>
            </UCard>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <UInput
              v-model="query"
              placeholder="Rechercher (email, nom, referrer, ID)..."
              icon="i-lucide-search"
              size="lg"
              class="w-full sm:w-96"
            />

            <div class="flex items-center gap-3">
              <div class="text-sm text-muted whitespace-nowrap">
                Par page
              </div>
              <USelect
                v-model="limit"
                :options="limitOptions"
                option-attribute="value"
                class="w-28"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading / error -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 animate-spin text-primary"
        />
        <span class="ml-3 text-muted">
          Chargement...
        </span>
      </div>

      <UAlert
        v-else-if="loadError"
        color="error"
        variant="soft"
        title="Erreur"
        :description="loadError"
        class="mb-6"
      />

      <div v-else>
        <!-- Empty state -->
        <div
          v-if="filteredItems.length === 0"
          class="text-center py-12 text-muted"
        >
          Aucun lead trouvé pour la recherche.
        </div>

        <!-- Leads list -->
        <div
          v-else
          class="space-y-4"
        >
          <UCard
            v-for="lead in filteredItems"
            :key="lead.id"
            class="hover:shadow-lg transition-shadow"
          >
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    :label="`Lead #${lead.id}`"
                    color="primary"
                  />
                  <UBadge
                    :label="`${lead.stepCount} étapes`"
                    variant="soft"
                    color="neutral"
                  />
                  <UBadge
                    v-if="lead.qualification"
                    :label="`Score ${lead.qualification.score}`"
                    :color="getScoreColor(lead.qualification.score)"
                    variant="soft"
                  />
                  <UBadge
                    v-if="lead.qualification"
                    :label="getLevelLabel(lead.qualification.level)"
                    :color="getLevelColor(lead.qualification.level)"
                    variant="soft"
                  />
                  <UBadge
                    v-if="getOfferLabel(lead.qualification?.recommendedOffer)"
                    :label="`Offre: ${getOfferLabel(lead.qualification?.recommendedOffer)}`"
                    color="primary"
                    variant="outline"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    :to="buildLeadDetailUrl(lead)"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    color="primary"
                    variant="outline"
                    icon="i-lucide-external-link"
                  >
                    Détails
                  </UButton>

                  <UButton
                    v-if="lead.accessToken"
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    :icon="copiedToken === String(lead.id) ? 'i-lucide-check' : 'i-lucide-copy'"
                    @click="copyToken(lead.accessToken as string, lead.id)"
                  >
                    {{ copiedToken === String(lead.id) ? 'Copié' : 'Copier token' }}
                  </UButton>
                </div>
              </div>
            </template>

            <div class="grid md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <div class="text-sm text-muted">
                  Email
                </div>
                <div class="font-medium break-all">
                  {{ lead.email || '—' }}
                </div>

                <div
                  v-if="lead.name"
                  class="text-sm"
                >
                  <span class="text-muted">
                    Nom:
                  </span>
                  <span>{{ lead.name }}</span>
                </div>

                <div
                  v-if="lead.metadata?.referrer"
                  class="text-sm"
                >
                  <span class="text-muted">
                    Référent:
                  </span>
                  <span class="break-all">{{ lead.metadata.referrer }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-sm text-muted">
                  Contexte / qualification
                </div>
                <div
                  v-if="lead.qualification"
                  class="space-y-2"
                >
                  <div class="text-xs text-muted">
                    Raisons (max 4)
                  </div>
                  <div
                    v-if="lead.qualification.reasons && lead.qualification.reasons.length > 0"
                    class="flex flex-wrap gap-2"
                  >
                    <UBadge
                      v-for="(reason, idx) in lead.qualification.reasons.slice(0, 4)"
                      :key="`${lead.id}-reason-${idx}`"
                      :label="reason"
                      variant="soft"
                      color="neutral"
                    />
                  </div>
                  <div
                    v-else
                    class="text-sm text-muted"
                  >
                    Aucune raison
                  </div>
                </div>
                <div
                  v-else
                  class="text-sm text-muted"
                >
                  Pas de qualification
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-sm text-muted">
                  Dates
                </div>
                <div class="text-sm flex justify-between gap-4">
                  <span class="text-muted">Créé</span>
                  <span>{{ formatFr(lead.createdAt) }}</span>
                </div>
                <div class="text-sm flex justify-between gap-4">
                  <span class="text-muted">Mis à jour</span>
                  <span>{{ formatFr(lead.updatedAt) }}</span>
                </div>
                <div class="text-sm flex justify-between gap-4">
                  <span class="text-muted">Complété</span>
                  <span>{{ formatFr(lead.completedAt) }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-4 mt-8">
          <div class="text-sm text-muted">
            Page {{ page + 1 }} / {{ totalPages }} ({{ leadsResponse?.total ?? 0 }} au total)
          </div>

          <div class="flex items-center gap-2">
            <UButton
              :disabled="!canPrev"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-arrow-left"
              @click="goPrev"
            >
              Précédent
            </UButton>

            <UButton
              :disabled="!canNext"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-arrow-right"
              @click="goNext"
            >
              Suivant
            </UButton>
          </div>
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
