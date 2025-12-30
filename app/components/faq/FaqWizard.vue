<script setup lang="ts">
import type { FaqWizardConfig, FaqWizardAnswers, LeadContext, FaqWizardQuestion } from '~/types/content'

const props = defineProps<{
  config: FaqWizardConfig
}>()

const emit = defineEmits<{
  complete: [context: LeadContext]
  stepChange: [stepIndex: number]
}>()

// État du wizard
const currentStepIndex = ref(0)
const answers = ref<FaqWizardAnswers>({})
const errors = ref<Record<string, string>>({})

// Computed
const currentStep = computed(() => props.config.steps[currentStepIndex.value])
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === props.config.steps.length - 1)
const progress = computed(() => {
  if (props.config.steps.length === 0) return 0
  return ((currentStepIndex.value + 1) / props.config.steps.length) * 100
})

// Validation d'une question
const validateQuestion = (question: FaqWizardQuestion, value: any): string | null => {
  if (question.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return 'Cette question est requise'
  }

  if (question.validation) {
    const { min, max, pattern, message } = question.validation

    if (min !== undefined && typeof value === 'number' && value < min) {
      return message || `La valeur doit être au moins ${min}`
    }

    if (max !== undefined && typeof value === 'number' && value > max) {
      return message || `La valeur doit être au maximum ${max}`
    }

    if (pattern && typeof value === 'string') {
      const regex = new RegExp(pattern)
      if (!regex.test(value)) {
        return message || 'Le format est invalide'
      }
    }
  }

  return null
}

// Validation de l'étape actuelle
const validateCurrentStep = (): boolean => {
  const stepErrors: Record<string, string> = {}

  if (!currentStep.value) {
    return false
  }

  currentStep.value.questions.forEach((question) => {
    const value = answers.value[question.id]
    const error = validateQuestion(question, value)

    if (error) {
      stepErrors[question.id] = error
    }
  })

  errors.value = stepErrors
  return Object.keys(stepErrors).length === 0
}

// Mise à jour d'une réponse
const updateAnswer = (questionId: string, value: any) => {
  answers.value[questionId] = value
  // Supprimer l'erreur si elle existe
  if (errors.value[questionId]) {
    const { [questionId]: _, ...rest } = errors.value
    errors.value = rest
  }
}

// Navigation
const goToNext = () => {
  if (!validateCurrentStep()) {
    return
  }

  if (!isLastStep.value) {
    currentStepIndex.value++
    emit('stepChange', currentStepIndex.value)
  } else {
    completeWizard()
  }
}

const goToPrevious = () => {
  if (!isFirstStep.value) {
    currentStepIndex.value--
    emit('stepChange', currentStepIndex.value)
  }
}

const goToStep = (index: number) => {
  if (index >= 0 && index < props.config.steps.length) {
    // Valider l'étape actuelle avant de changer
    if (!validateCurrentStep()) {
      return
    }
    currentStepIndex.value = index
    emit('stepChange', currentStepIndex.value)
  }
}

// Finalisation du wizard
const completeWizard = () => {
  if (!validateCurrentStep()) {
    return
  }

  const context: LeadContext = {
    answers: { ...answers.value },
    completedAt: new Date().toISOString(),
    stepCount: props.config.steps.length,
    metadata: {
      timestamp: new Date().toISOString(),
      ...(typeof window !== 'undefined' && {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined
      })
    }
  }

  emit('complete', context)
}

// Gestion des réponses pour les checkboxes
const toggleCheckbox = (questionId: string, value: string | number | boolean) => {
  const currentValue = answers.value[questionId]
  const arrayValue: Array<string | number | boolean> = Array.isArray(currentValue) ? currentValue : []

  if (arrayValue.includes(value)) {
    updateAnswer(questionId, arrayValue.filter(v => v !== value) as string[])
  } else {
    updateAnswer(questionId, [...arrayValue, value] as string[])
  }
}

// Vérifier si une option checkbox est sélectionnée
const isCheckboxSelected = (questionId: string, value: string | number | boolean): boolean => {
  const currentValue = answers.value[questionId]
  if (!Array.isArray(currentValue)) return false
  return currentValue.includes(value)
}
</script>

<template>
  <div class="faq-wizard">
    <!-- Barre de progression -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-muted">
          Étape {{ currentStepIndex + 1 }} sur {{ config.steps.length }}
        </span>
        <span class="text-sm font-medium">
          {{ Math.round(progress) }}%
        </span>
      </div>
      <UProgress
        :value="progress"
        :max="100"
        class="w-full"
      />
    </div>

    <!-- Contenu de l'étape actuelle -->
    <div
      v-if="currentStep"
      class="step-content"
    >
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-2">
          {{ currentStep.title }}
        </h2>
        <p
          v-if="currentStep.description"
          class="text-muted"
        >
          {{ currentStep.description }}
        </p>
      </div>

      <div class="space-y-6">
        <div
          v-for="question in currentStep.questions"
          :key="question.id"
          class="question-group"
        >
          <label
            :for="question.id"
            class="block mb-2 font-medium"
          >
            {{ question.label }}
            <span
              v-if="question.required"
              class="text-error"
            >*</span>
          </label>

          <p
            v-if="question.description"
            class="text-sm text-muted mb-3"
          >
            {{ question.description }}
          </p>

          <!-- Input texte -->
          <UInput
            v-if="question.type === 'text'"
            :id="question.id"
            :model-value="answers[question.id] as string || ''"
            :placeholder="question.placeholder"
            :error="errors[question.id]"
            @update:model-value="updateAnswer(question.id, $event)"
            @blur="validateQuestion(question, answers[question.id])"
          />

          <!-- Textarea -->
          <UTextarea
            v-else-if="question.type === 'textarea'"
            :id="question.id"
            :model-value="answers[question.id] as string || ''"
            :placeholder="question.placeholder"
            :error="errors[question.id]"
            :rows="4"
            @update:model-value="updateAnswer(question.id, $event)"
            @blur="validateQuestion(question, answers[question.id])"
          />

          <!-- Select -->
          <USelect
            v-else-if="question.type === 'select'"
            :id="question.id"
            :model-value="(typeof answers[question.id] === 'string' ? answers[question.id] : undefined)"
            :options="question.options || []"
            :placeholder="question.placeholder || 'Sélectionnez une option'"
            :error="errors[question.id]"
            @update:model-value="updateAnswer(question.id, $event)"
          />

          <!-- Radio buttons -->
          <div
            v-else-if="question.type === 'radio'"
            class="space-y-2"
          >
            <URadio
              v-for="option in question.options"
              :id="`${question.id}-${option.value}`"
              :key="`${question.id}-${option.value}`"
              :name="question.id"
              :value="option.value"
              :model-value="answers[question.id]"
              :label="option.label"
              @update:model-value="updateAnswer(question.id, $event)"
            />
            <p
              v-if="errors[question.id]"
              class="text-sm text-error mt-1"
            >
              {{ errors[question.id] }}
            </p>
          </div>

          <!-- Checkboxes -->
          <div
            v-else-if="question.type === 'checkbox'"
            class="space-y-2"
          >
            <UCheckbox
              v-for="option in question.options"
              :id="`${question.id}-${option.value}`"
              :key="`${question.id}-${option.value}`"
              :model-value="isCheckboxSelected(question.id, option.value)"
              :label="option.label"
              @update:model-value="toggleCheckbox(question.id, option.value)"
            />
            <p
              v-if="errors[question.id]"
              class="text-sm text-error mt-1"
            >
              {{ errors[question.id] }}
            </p>
          </div>

          <!-- Message d'erreur -->
          <p
            v-if="errors[question.id]"
            class="text-sm text-error mt-1"
          >
            {{ errors[question.id] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-default">
      <UButton
        v-if="!isFirstStep"
        variant="outline"
        color="neutral"
        @click="goToPrevious"
      >
        <template #leading>
          <UIcon
            name="i-lucide-arrow-left"
            class="size-4"
          />
        </template>
        Précédent
      </UButton>
      <div v-else />

      <UButton
        :color="isLastStep ? 'primary' : 'primary'"
        :label="isLastStep ? 'Terminer' : 'Suivant'"
        @click="goToNext"
      >
        <template #trailing>
          <UIcon
            v-if="!isLastStep"
            name="i-lucide-arrow-right"
            class="size-4"
          />
          <UIcon
            v-else
            name="i-lucide-check"
            class="size-4"
          />
        </template>
      </UButton>
    </div>

    <!-- Indicateurs d'étapes (optionnel) -->
    <div class="flex items-center justify-center gap-2 mt-6">
      <button
        v-for="(step, index) in config.steps"
        :key="step.id"
        type="button"
        class="w-2 h-2 rounded-full transition-all"
        :class="index === currentStepIndex ? 'bg-primary w-8' : 'bg-muted'"
        :aria-label="`Aller à l'étape ${index + 1}: ${step.title}`"
        @click="goToStep(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.faq-wizard {
  @apply w-full max-w-3xl mx-auto p-6;
}

.step-content {
  @apply min-h-[300px];
}

.question-group {
  @apply space-y-2;
}
</style>
