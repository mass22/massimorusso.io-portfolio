<script setup lang="ts">
import { computed } from 'vue'
import type { Stat } from '~/types/services'

type Props = {
  stats: Stat[]
  icons?: string[]
  columns?: 2 | 4
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icons: () => ['i-ph-users', 'i-ph-folder-open', 'i-ph-graduation-cap', 'i-ph-star'],
  columns: 4,
  withAnimation: true
})

const gridClasses = computed(() => {
  return props.columns === 2
    ? 'grid-cols-2'
    : 'grid-cols-2 lg:grid-cols-4'
})

const getStatIcon = (index: number, stat: Stat): string => {
  return stat.icon || props.icons?.[index] || 'i-ph-circle'
}
</script>

<template>
  <Motion
    v-if="withAnimation && stats?.length"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-8 sm:gap-12'
      }"
    >
      <div :class="`grid ${gridClasses} gap-6 sm:gap-8`">
        <Motion
          v-for="(stat, index) in stats"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-100px' }"
          class="text-center"
        >
          <div class="flex flex-col items-center gap-3 p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-colors duration-300">
            <div class="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
              <UIcon
                :name="getStatIcon(index, stat)"
                class="size-6 text-primary"
              />
            </div>
            <div class="text-3xl sm:text-4xl font-bold text-highlighted">
              {{ stat.value }}
            </div>
            <div class="text-sm text-muted">
              {{ stat.label }}
            </div>
          </div>
        </Motion>
      </div>
    </UPageSection>
  </Motion>
  <UPageSection
    v-else-if="stats?.length"
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-8 sm:gap-12'
    }"
  >
    <div :class="`grid ${gridClasses} gap-6 sm:gap-8`">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="text-center flex flex-col items-center gap-3 p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-colors duration-300"
      >
        <div class="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
          <UIcon
            :name="getStatIcon(index, stat)"
            class="size-6 text-primary"
          />
        </div>
        <div class="text-3xl sm:text-4xl font-bold text-highlighted">
          {{ stat.value }}
        </div>
        <div class="text-sm text-muted">
          {{ stat.label }}
        </div>
      </div>
    </div>
  </UPageSection>
</template>
