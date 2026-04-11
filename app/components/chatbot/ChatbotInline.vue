<script setup lang="ts">
import type { LeadContext as LeadContextType } from '~/types/content'
import ChatFlow from './ChatFlow.vue'
import type { ChatConfig } from './chatConfig'
import type { Locale } from './i18n'
import { t } from './i18n'

import LeadCaptureForm from './LeadCaptureForm.vue'

const props = withDefaults(defineProps<{
  config?: ChatConfig
  /** Sans marge haute ni cadre fort — à utiliser dans un conteneur déjà encadré (ex. LP audit). */
  embedded?: boolean
}>(), {
  embedded: false
})

const chatFlowRef = ref<InstanceType<typeof ChatFlow> | null>(null)
const leadContext = ref<LeadContextType | null>(null)
const showSuccess = ref(false)

const i18n = useI18n()
const route = useRoute()

const locale = computed<Locale>(() => {
  const localeValue = i18n.locale.value
  if (typeof localeValue === 'string' && localeValue.startsWith('fr')) {
    return 'fr'
  }
  const path = route.path || ''
  if (path.startsWith('/fr')) {
    return 'fr'
  }
  return 'en'
})

/** État séparé du widget flottant du site (pas de collision avec la modal globale). */
const chatState = useState('chatbot-inline-lp-audit', () => ({
  leadContext: null as LeadContextType | null,
  showSuccess: false
}))

watch(() => chatState.value.leadContext, (val) => {
  leadContext.value = val
}, { immediate: true })

watch(() => chatState.value.showSuccess, (val) => {
  showSuccess.value = val
}, { immediate: true })

const handleFlowComplete = (context: LeadContextType) => {
  leadContext.value = context
  chatState.value.leadContext = context
}

const handleFormSuccess = () => {
  showSuccess.value = true
  chatState.value.showSuccess = true
}

const resetWidget = () => {
  leadContext.value = null
  showSuccess.value = false
  chatState.value.leadContext = null
  chatState.value.showSuccess = false
  if (chatFlowRef.value) {
    chatFlowRef.value.reset()
  }
}
</script>

<template>
  <div
    class="mx-auto w-full max-w-2xl flex flex-col overflow-hidden rounded-xl border border-default bg-elevated shadow-sm min-h-[min(60vh,32rem)] max-h-[min(70vh,40rem)]"
    :class="embedded ? 'mt-0' : 'mt-8'"
    role="region"
    :aria-label="t(locale, 'widget.chatAssistance')"
  >
    <div class="flex shrink-0 items-start justify-between gap-4 border-b border-default p-4 sm:p-5">
      <div class="min-w-0 flex-1">
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t(locale, 'widget.title') }}
        </h2>
        <p class="mt-0.5 text-sm text-muted">
          {{ t(locale, 'widget.subtitle') }}
        </p>
      </div>
      <UButton
        v-if="leadContext && !showSuccess"
        color="neutral"
        icon="i-lucide-refresh-cw"
        size="sm"
        variant="ghost"
        :aria-label="t(locale, 'widget.restart')"
        @click="resetWidget"
      />
    </div>

    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        v-if="showSuccess"
        class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <UIcon
          class="size-12 text-success"
          name="i-lucide-check-circle"
        />
        <h3 class="text-xl font-semibold text-highlighted">
          {{ t(locale, 'success.title') }}
        </h3>
        <p class="max-w-sm text-muted">
          {{ t(locale, 'success.message') }}
        </p>
        <UButton
          color="primary"
          variant="outline"
          @click="resetWidget"
        >
          {{ t(locale, 'widget.restart') }}
        </UButton>
      </div>

      <div
        v-else-if="leadContext && leadContext.qualification"
        class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5"
      >
        <LeadCaptureForm
          :qualification="leadContext.qualification"
          :context="leadContext"
          :locale="locale"
          @success="handleFormSuccess"
        />
      </div>

      <div
        v-else
        class="flex min-h-[18rem] flex-1 flex-col overflow-hidden sm:min-h-[22rem]"
      >
        <ChatFlow
          ref="chatFlowRef"
          :config="props.config"
          :locale="locale"
          @complete="handleFlowComplete"
        />
      </div>
    </div>
  </div>
</template>
