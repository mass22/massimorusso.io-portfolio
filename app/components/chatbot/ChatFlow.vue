<script setup lang="ts">
import type { LeadContext as LeadContextType } from '~/types/content'
import { getChatConfig, type LeadContext } from './chatConfig'
import type { Locale } from './i18n'
import { qualifyLead, type QualificationResult } from './qualification'

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
  timestamp: Date
}

const props = defineProps<{
  locale: Locale
}>()

const emit = defineEmits<{
  complete: [context: LeadContextType]
}>()

// État du flux
const currentQuestionId = ref<string | null>(null)
const messages = ref<Message[]>([])
const context = ref<LeadContext>({})
const isComplete = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const qualificationResult = ref<QualificationResult | null>(null)

// Configuration réactive selon la locale
const chatConfig = computed(() => getChatConfig(props.locale))

// Initialiser currentQuestionId avec la config
watch(() => chatConfig.value.startQuestionId, (startId) => {
  if (!currentQuestionId.value) {
    currentQuestionId.value = startId
  }
}, { immediate: true })

// Computed pour la question courante
const currentQuestion = computed(() => {
  if (!currentQuestionId.value) return null
  return chatConfig.value.questions.find(q => q.id === currentQuestionId.value!)
})

// Scroll automatique vers le bas
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Observer les changements de locale pour mettre à jour la question courante et les options
watch(() => props.locale, () => {
  if (isComplete.value) return

  // Si on a une question courante, mettre à jour son texte avec la nouvelle locale
  if (currentQuestionId.value && currentQuestion.value) {
    const updatedQuestion = chatConfig.value.questions.find(q => q.id === currentQuestionId.value!)
    if (updatedQuestion) {
      // Remplacer le dernier message bot par la nouvelle version localisée
      const lastBotMessageIndex = messages.value.findLastIndex(m => m.type === 'bot')
      if (lastBotMessageIndex !== -1 && messages.value[lastBotMessageIndex]) {
        messages.value[lastBotMessageIndex].text = updatedQuestion.text
      }
    }
  }
}, { immediate: false })

// Initialiser avec le premier message du bot
onMounted(() => {
  if (currentQuestion.value) {
    addBotMessage(currentQuestion.value.text)
  }
})

// Observer les changements de messages pour scroller
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Ajouter un message bot
const addBotMessage = (text: string) => {
  messages.value.push({
    id: `bot-${Date.now()}`,
    type: 'bot',
    text,
    timestamp: new Date()
  })
}

// Ajouter un message utilisateur
const addUserMessage = (text: string) => {
  messages.value.push({
    id: `user-${Date.now()}`,
    type: 'user',
    text,
    timestamp: new Date()
  })
}

// Gérer la sélection d'une option
const handleOptionSelect = (option: { label: string; value: string; nextQuestionId?: string }) => {
  // Ajouter le message utilisateur
  addUserMessage(option.label)

  // Sauvegarder dans le contexte
  if (currentQuestionId.value) {
    context.value[currentQuestionId.value] = option.value
  }

  // Passer à la question suivante ou terminer
  if (option.nextQuestionId) {
    currentQuestionId.value = option.nextQuestionId
    // Ajouter le message du bot pour la prochaine question
    nextTick(() => {
      const nextQuestion = chatConfig.value.questions.find(q => q.id === option.nextQuestionId)
      if (nextQuestion) {
        addBotMessage(nextQuestion.text)
      }
    })
  } else {
    // Dernière question complétée - afficher l'évaluation
    showAssessmentMessage()
  }
}

// Afficher le message d'évaluation
const showAssessmentMessage = () => {
  // Qualifier le lead
  const result = qualifyLead(context.value)
  qualificationResult.value = result

  // Passer directement au formulaire (le message sera affiché dans LeadCaptureForm)
  completeFlow()
}

// Terminer le flux
const completeFlow = () => {
  isComplete.value = true

  // Émettre l'événement avec le contexte formaté
  // Filtrer les valeurs undefined pour correspondre au type FaqWizardAnswers
  const answers: Record<string, string | number | boolean | string[]> = {}
  for (const [key, value] of Object.entries(context.value)) {
    if (value !== undefined) {
      answers[key] = value
    }
  }

  const leadContext: LeadContextType = {
    answers,
    completedAt: new Date().toISOString(),
    stepCount: messages.value.filter(m => m.type === 'bot').length,
    qualification: qualificationResult.value || undefined,
    metadata: {
      timestamp: new Date().toISOString(),
      ...(typeof window !== 'undefined' && {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined
      })
    }
  }

  emit('complete', leadContext)
}

// Réinitialiser le flux
const reset = () => {
  currentQuestionId.value = chatConfig.value.startQuestionId
  messages.value = []
  context.value = {}
  isComplete.value = false
  qualificationResult.value = null
  if (currentQuestion.value) {
    addBotMessage(currentQuestion.value.text)
  }
}

// Exposer la fonction reset pour le parent
defineExpose({
  reset
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="messages-container flex-1 overflow-y-auto p-4 space-y-4"
      style="scroll-behavior: smooth;"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex w-full"
        :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2.5 wrap-break-word"
          :class="message.type === 'user' ? 'bg-primary text-black' : 'bg-muted text-foreground'"
        >
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
        </div>
      </div>

      <!-- Options de réponse rapide -->
      <div v-if="currentQuestion && !isComplete" class="flex flex-wrap gap-2 mt-4 px-4 pb-2">
        <button
          v-for="option in currentQuestion.options"
          :key="option.value"
          type="button"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all bg-primary text-black hover:bg-muted/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
          @click="handleOptionSelect(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 0.5rem;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-muted));
  border-radius: 9999px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-muted) / 0.8);
}
</style>
