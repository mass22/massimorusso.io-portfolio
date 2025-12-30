<script setup lang="ts">
import type { LeadContext as LeadContextType } from '~/types/content'
import ChatFlow from './ChatFlow.vue'
import type { Locale } from './i18n'
import { t } from './i18n'

import LeadCaptureForm from './LeadCaptureForm.vue'

const { y } = useWindowScroll()

// État du widget
const isOpen = ref(false)
const chatFlowRef = ref<InstanceType<typeof ChatFlow> | null>(null)
const leadContext = ref<LeadContextType | null>(null)
const showSuccess = ref(false)
const isContactPage = computed(() => route.path.includes('/contact'))
const showStickyWidget = computed(() => y.value > 300 && !isContactPage.value)

// Locale du site web : utiliser useI18n() si disponible, sinon détecter depuis la route
// Appeler useI18n() et useRoute() au niveau du setup (pas dans un computed)
const i18n = useI18n()
const route = useRoute()

// Computed réactif pour la locale du chatbot qui suit automatiquement les changements
const locale = computed<Locale>(() => {
  // Priorité 1 : utiliser @nuxtjs/i18n
  const localeValue = i18n.locale.value
  // @nuxtjs/i18n peut retourner 'fr' ou 'fr-FR', normaliser à 'fr'
  if (typeof localeValue === 'string' && localeValue.startsWith('fr')) {
    return 'fr'
  }

  // Fallback : détecter depuis le préfixe de route si i18n ne fonctionne pas
  const path = route.path || ''
  if (path.startsWith('/fr')) {
    return 'fr'
  }

  // Par défaut : anglais
  return 'en'
})

// Persistance de l'état avec useState (survive à la navigation)
const chatState = useState('chatbot-state', () => ({
  isOpen: false,
  leadContext: null as LeadContextType | null,
  showSuccess: false
}))

// Synchroniser l'état local avec l'état persistant
watch(() => chatState.value.isOpen, (val) => {
  isOpen.value = val
}, { immediate: true })

watch(() => chatState.value.leadContext, (val) => {
  leadContext.value = val
}, { immediate: true })

watch(() => chatState.value.showSuccess, (val) => {
  showSuccess.value = val
}, { immediate: true })

// Ouvrir/fermer le widget
const toggleWidget = () => {
  chatState.value.isOpen = !chatState.value.isOpen
  // Si on ferme, ne pas réinitialiser l'état (pour permettre de reprendre)
  // L'utilisateur peut utiliser le bouton "Restart" pour réinitialiser
}

const closeWidget = () => {
  chatState.value.isOpen = false
  // Ne pas réinitialiser l'état ici pour permettre de reprendre la conversation
}

// Gérer la complétion du flux
const handleFlowComplete = (context: LeadContextType) => {
  leadContext.value = context
  chatState.value.leadContext = context
}

// Gérer le succès du formulaire
const handleFormSuccess = () => {
  showSuccess.value = true
  chatState.value.showSuccess = true
}

// Réinitialiser le widget
const resetWidget = () => {
  leadContext.value = null
  showSuccess.value = false
  chatState.value.leadContext = null
  chatState.value.showSuccess = false
  if (chatFlowRef.value) {
    chatFlowRef.value.reset()
  }
}

// Gérer la touche ESC pour fermer
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeWidget()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="showStickyWidget"
    class="fixed bottom-25 right-10 md:bottom-4 md:right-4 z-[9999]"
  >
    <!-- Bouton flottant -->
    <button
      v-if="!isOpen"
      type="button"
      class="w-14 h-14 rounded-full bg-primary text-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
      :aria-label="t(locale, 'widget.openChat')"
      @click="toggleWidget"
    >
      <UIcon
        name="i-lucide-message-circle"
        class="size-6"
      />
    </button>

    <!-- Panneau de chat -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="chatbot-panel fixed bottom-4 right-4 w-full max-w-[380px] max-h-[70vh] bg-black border border-default rounded-lg shadow-2xl flex flex-col overflow-hidden md:max-w-[380px] z-[10000]"
        role="dialog"
        :aria-label="t(locale, 'widget.chatAssistance')"
        aria-modal="true"
      >
        <!-- En-tête -->
        <div class="flex items-start justify-between p-4 border-b border-default bg-black">
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-white">
              {{ t(locale, 'widget.title') }}
            </h2>
            <p class="text-sm text-muted mt-0.5">
              {{ t(locale, 'widget.subtitle') }}
            </p>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <button
              v-if="leadContext && !showSuccess"
              type="button"
              class="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              :aria-label="t(locale, 'widget.restart')"
              @click="resetWidget"
            >
              <UIcon
                name="i-lucide-refresh-cw"
                class="size-4"
              />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              :aria-label="t(locale, 'widget.close')"
              @click="closeWidget"
            >
              <UIcon
                name="i-lucide-x"
                class="size-5"
              />
            </button>
          </div>
        </div>

        <!-- Contenu -->
        <div class="flex-1 overflow-hidden flex flex-col">
          <!-- Message de succès -->
          <div
            v-if="showSuccess"
            class="flex flex-col items-center justify-center p-8 text-center min-h-[300px]"
          >
            <div class="mb-4">
              <UIcon
                name="i-lucide-check-circle"
                class="size-12 text-success"
              />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-foreground">
              {{ t(locale, 'success.title') }}
            </h3>
            <p class="text-muted mb-6 max-w-sm">
              {{ t(locale, 'success.message') }}
            </p>
            <UButton
              color="primary"
              variant="outline"
              @click="closeWidget"
            >
              {{ t(locale, 'widget.close') }}
            </UButton>
          </div>

          <!-- Formulaire de capture -->
          <div
            v-else-if="leadContext && leadContext.qualification"
            class="flex-1 overflow-y-auto"
          >
            <LeadCaptureForm
              :qualification="leadContext.qualification"
              :context="leadContext"
              :locale="locale"
              @success="handleFormSuccess"
            />
          </div>

          <!-- Flux de conversation -->
          <div
            v-else
            class="flex-1 overflow-scroll"
          >
            <ChatFlow
              ref="chatFlowRef"
              :locale="locale"
              @complete="handleFlowComplete"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Overlay pour mobile -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20 z-[9998] md:hidden"
        @click="closeWidget"
      />
    </Transition>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .chatbot-panel {
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    max-width: none;
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
    z-index: 10000;
  }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
