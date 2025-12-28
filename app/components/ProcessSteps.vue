<script setup lang="ts">
import type { ProcessStep } from '~/types/services'

type Props = {
  title: string
  description: string
  steps: ProcessStep[]
  icons?: string[]
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icons: () => ['i-ph-magnifying-glass', 'i-ph-paint-brush', 'i-ph-code', 'i-ph-rocket'],
  withAnimation: true
})

const getStepIcon = (index: number, step: ProcessStep): string => {
  return step.icon || props.icons?.[index] || 'i-ph-circle'
}
</script>

<template>
  <Motion
    v-if="steps?.length && withAnimation"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="title"
      :description="description"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12',
        title: 'text-left text-2xl sm:text-3xl lg:text-4xl font-bold',
        description: 'text-left mt-3 text-base sm:text-lg text-muted max-w-3xl'
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
        <Motion
          v-for="(step, index) in steps"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(30px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-100px' }"
          class="group relative"
        >
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-colors duration-300 h-full">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <UIcon
                    :name="getStepIcon(index, step)"
                    class="size-6 text-primary"
                  />
                </div>
                <span class="text-2xl font-bold text-muted" aria-hidden="true">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-highlighted mb-2">
                {{ step.title }}
              </h3>
              <p class="text-sm text-muted leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-default"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="absolute -right-2 top-1/2 -translate-y-1/2 size-4 text-muted"
            />
          </div>
        </Motion>
      </div>
    </UPageSection>
  </Motion>
  <UPageSection
    v-else
    :title="title"
    :description="description"
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12',
      title: 'text-left text-2xl sm:text-3xl lg:text-4xl font-bold',
      description: 'text-left mt-3 text-base sm:text-lg text-muted max-w-3xl'
    }"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="group relative flex flex-col gap-4 p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-colors duration-300 h-full"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
              <UIcon
                :name="getStepIcon(index, step)"
                class="size-6 text-primary"
              />
            </div>
            <span class="text-2xl font-bold text-muted" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-highlighted mb-2">
            {{ step.title }}
          </h3>
          <p class="text-sm text-muted leading-relaxed">
            {{ step.description }}
          </p>
        </div>
        <div
          v-if="index < steps.length - 1"
          class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-default"
        >
          <UIcon
            name="i-lucide-arrow-right"
            class="absolute -right-2 top-1/2 -translate-y-1/2 size-4 text-muted"
          />
        </div>
      </div>
    </div>
  </UPageSection>
</template>

