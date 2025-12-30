<script setup lang="ts">
import { computed } from 'vue'
import type { CTALink } from '~/types/services'

type CTALinkExtended = CTALink & {
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'
  icon?: string
}

type Props = {
  title: string
  description: string
  primary?: CTALinkExtended
  secondary?: CTALinkExtended
  links?: CTALinkExtended[]
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'naked'
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  withAnimation: true
})

const localePath = useLocalePath()

// Transformation des données CTA pour UPageCTA
const ctaLinks = computed(() => {
  if (props.links && props.links.length > 0) {
    return props.links.map(link => ({
      label: link.label,
      to: localePath(link.href),
      trailingIcon: link.icon || 'i-lucide-arrow-right',
      variant: (link.variant || 'solid') as 'solid' | 'outline' | 'ghost' | 'soft' | 'link',
      color: (link.color || 'primary') as 'primary' | 'gray' | 'neutral'
    }))
  }

  const links = []
  if (props.primary) {
    links.push({
      label: props.primary.label,
      to: localePath(props.primary.href),
      trailingIcon: props.primary.icon || 'i-lucide-arrow-right',
      variant: (props.primary.variant || 'solid') as 'solid' | 'outline' | 'ghost' | 'soft' | 'link',
      color: (props.primary.color || 'primary') as 'primary' | 'gray' | 'neutral'
    })
  }
  if (props.secondary) {
    links.push({
      label: props.secondary.label,
      to: localePath(props.secondary.href),
      trailingIcon: props.secondary.icon || 'i-lucide-calendar',
      variant: (props.secondary.variant || 'outline') as 'solid' | 'outline' | 'ghost' | 'soft' | 'link',
      color: (props.secondary.color || 'neutral') as 'primary' | 'gray' | 'neutral'
    })
  }
  return links
})
</script>

<template>
  <Motion
    v-if="withAnimation && ctaLinks.length > 0"
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
        :links="ctaLinks"
        :variant="variant"
        :ui="{
          container: 'bg-elevated/50 dark:bg-elevated/30 rounded-2xl p-8 sm:p-12 lg:p-16 gap-6 sm:gap-8',
          title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
          description: 'text-base sm:text-lg lg:text-xl max-w-2xl mx-auto'
        }"
      />
    </UPageSection>
  </Motion>
  <UPageSection
    v-else-if="ctaLinks.length > 0"
    :ui="{
      container: '!pt-16 sm:!pt-20 lg:!pt-24'
    }"
  >
    <UPageCTA
      :title="title"
      :description="description"
      :links="ctaLinks"
      :variant="variant"
      :ui="{
        container: 'bg-elevated/50 dark:bg-elevated/30 rounded-2xl p-8 sm:p-12 lg:p-16 gap-6 sm:gap-8',
        title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
        description: 'text-base sm:text-lg lg:text-xl max-w-2xl mx-auto'
      }"
    />
  </UPageSection>
</template>
