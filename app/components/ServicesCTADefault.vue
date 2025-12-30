<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

type Props = {
  title?: string
  description?: string
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'naked'
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  variant: 'solid',
  withAnimation: true
})

// Utiliser computed pour les valeurs par défaut qui dépendent de t()
const title = computed(() => props.title ?? t('services.cta.title'))
const description = computed(() => props.description ?? t('services.cta.description'))

const links = computed(() => ([
  {
    label: t('services.cta.contact'),
    to: localePath('/contact'),
    trailingIcon: 'i-lucide-arrow-right',
    variant: 'solid' as const,
    color: 'primary' as const
  },
  {
    label: t('services.cta.booking'),
    to: localePath('/contact#calendar'),
    trailingIcon: 'i-lucide-calendar',
    variant: 'outline' as const,
    color: 'neutral' as const
  }
]))
</script>

<template>
  <Motion
    v-if="withAnimation"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :ui="{
        container: '!pt-16 sm:!pt-20 lg:!pt-24'
      }"
    >
      <UPageCTA
        :title="title"
        :description="description"
        :links="links"
        :variant="props.variant"
        :ui="{
          container: 'bg-elevated/50 dark:bg-elevated/30 rounded-2xl p-8 sm:p-12 lg:p-16 gap-6 sm:gap-8',
          title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
          description: 'text-base sm:text-lg lg:text-xl max-w-2xl mx-auto'
        }"
      />
    </UPageSection>
  </Motion>
  <UPageSection
    v-else
    :ui="{
      container: '!pt-16 sm:!pt-20 lg:!pt-24'
    }"
  >
    <UPageCTA
      :title="title"
      :description="description"
      :links="links"
      :variant="variant"
      :ui="{
        container: 'bg-elevated/50 dark:bg-elevated/30 rounded-2xl p-8 sm:p-12 lg:p-16 gap-6 sm:gap-8',
        title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
        description: 'text-base sm:text-lg lg:text-xl max-w-2xl mx-auto'
      }"
    />
  </UPageSection>
</template>
