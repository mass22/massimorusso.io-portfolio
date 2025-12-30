<script setup lang="ts">
import { formatContextSummary } from './chatConfig'
import type { LeadContext as ChatbotLeadContext } from './chatConfig'
import type { LeadContext as LeadContextType } from '~/types/content'
import type { QualificationResult } from './qualification'
import { formatReasons, formatQualificationMessage } from './qualification'
import type { Locale } from './i18n'
import { t } from './i18n'

const props = defineProps<{
  qualification: QualificationResult
  context: LeadContextType
  locale: Locale
}>()

const emit = defineEmits<{
  success: []
  close: []
}>()

// État du formulaire
const name = ref('')
const email = ref('')
const consent = ref(false)
const isSubmitting = ref(false)
const consentError = ref<string | null>(null)
const error = ref<string | null>(null)

// Computed
// Extraire le contexte du chatbot depuis answers pour l'affichage
const chatbotContext = computed<ChatbotLeadContext>(() => {
  return props.context.answers as ChatbotLeadContext
})
const contextSummary = computed(() => formatContextSummary(chatbotContext.value, props.locale))
const qualificationMessage = computed(() => formatQualificationMessage(props.locale, chatbotContext.value, props.qualification))
const canSubmit = computed(() => {
  return email.value.trim() !== '' && consent.value && !isSubmitting.value
})

// Labels pour les niveaux et offres (localisés)
const levelLabels = computed(() => ({
  'high': t(props.locale, 'qualification.level.high'),
  'medium': t(props.locale, 'qualification.level.medium'),
  'low': t(props.locale, 'qualification.level.low')
}))

const offerLabels = computed(() => ({
  'audit': t(props.locale, 'qualification.offer.audit'),
  'coaching': t(props.locale, 'qualification.offer.coaching'),
  'mission': t(props.locale, 'qualification.offer.mission')
}))

const levelColors: Record<string, string> = {
  'high': 'bg-success/20 text-success border-success/30',
  'medium': 'bg-warning/20 text-warning border-warning/30',
  'low': 'bg-muted text-muted-foreground border-default'
}

// Reasons localisées (limitées à 3)
const displayedReasons = computed(() => {
  return formatReasons(props.locale, props.qualification.reasons).slice(0, 3)
})

// Validation de l'email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Soumettre le formulaire
const submitForm = async () => {
  error.value = null
  consentError.value = null

  // Validation
  if (!email.value.trim()) {
    error.value = t(props.locale, 'form.email.required')
    return
  }

  if (!validateEmail(email.value.trim())) {
    error.value = t(props.locale, 'form.email.invalid')
    return
  }

  // Vérifier le consentement avant de soumettre
  if (!consent.value) {
    consentError.value = t(props.locale, 'form.consent.error')
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch('/api/leads', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        name: name.value.trim() || undefined,
        consent: consent.value,
        qualification: props.qualification, // Valeurs agnostiques (codes de raison)
        context: props.context, // LeadContextType complet avec answers, completedAt, stepCount, metadata
        locale: props.locale // Inclure la locale pour l'email admin
      }
    })

    if (response) {
      emit('success')
    } else {
      throw new Error('Invalid server response')
    }
  } catch (err: any) {
    console.error('Erreur lors de la soumission du formulaire:', err)
    error.value = err.data?.message || t(props.locale, 'form.error.generic')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Badge de niveau -->
    <div class="flex items-center gap-2">
      <span
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
        :class="levelColors[qualification.level]"
      >
        {{ levelLabels[qualification.level] }}
      </span>
    </div>

    <!-- Message de qualification -->
    <div class="bg-muted/30 rounded-lg p-4 border border-default">
      <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ qualificationMessage }}</p>
    </div>

    <!-- Recommandation -->
    <div v-if="qualification.recommendedOffer && qualification.recommendedOffer !== 'unknown'" class="text-sm text-foreground">
      {{ t(locale, 'qualification.recommendation') }} {{ offerLabels[qualification.recommendedOffer] }}
    </div>

    <!-- Reasons comme chips/pills -->
    <div v-if="displayedReasons.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="(reason, index) in displayedReasons"
        :key="index"
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-default"
      >
        {{ reason }}
      </span>
    </div>

    <!-- Résumé du contexte -->
    <div class="bg-muted/50 rounded-lg p-4 border border-default">
      <h3 class="text-sm font-semibold mb-2 text-foreground">{{ t(locale, 'form.summary.title') }}</h3>
      <div class="bg-background rounded p-3">
        <pre class="text-xs text-muted whitespace-pre-wrap font-mono m-0">{{ contextSummary }}</pre>
      </div>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Nom (optionnel) -->
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-foreground">
          {{ t(locale, 'form.name.label') }}
        </label>
        <UInput
          id="name"
          v-model="name"
          type="text"
          :placeholder="t(locale, 'form.name.placeholder')"
          class="w-full"
        />
      </div>

      <!-- Email (requis) -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-foreground">
          {{ t(locale, 'form.email.label') }} <span class="text-error">*</span>
        </label>
        <UInput
          id="email"
          v-model="email"
          type="email"
          :placeholder="t(locale, 'form.email.placeholder')"
          required
          class="w-full"
          :error="error && !validateEmail(email.trim()) ? error : undefined"
        />
      </div>

      <!-- Consentement (requis) -->
      <div class="space-y-2">
        <UCheckbox
          id="consent"
          v-model="consent"
          class="w-full"
        >
          <template #label>
            <span class="text-sm text-muted">
              {{ t(locale, 'form.consent.label') }}
              <span class="text-error">*</span>
            </span>
          </template>
        </UCheckbox>
        <!-- Erreur inline pour le consentement -->
        <p v-if="consentError" class="text-xs text-error mt-1">
          {{ consentError }}
        </p>
      </div>

      <!-- Message d'erreur général -->
      <div v-if="error && !consentError" class="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">
        {{ error }}
      </div>

      <!-- Bouton de soumission -->
      <UButton
        type="submit"
        :disabled="!canSubmit"
        :loading="isSubmitting"
        color="primary"
        class="mt-4"
        block
      >
        {{ isSubmitting ? t(locale, 'form.submitting') : t(locale, 'form.submit') }}
      </UButton>
    </form>
  </div>
</template>
