<script setup lang="ts">
const { t } = useI18n()

const stats = [
  {
    icon: 'i-ph-users',
    valueKey: 'services.stats.clients.value',
    labelKey: 'services.stats.clients.label'
  },
  {
    icon: 'i-ph-folder-open',
    valueKey: 'services.stats.projects.value',
    labelKey: 'services.stats.projects.label'
  },
  {
    icon: 'i-ph-graduation-cap',
    valueKey: 'services.stats.training.value',
    labelKey: 'services.stats.training.label'
  },
  {
    icon: 'i-ph-star',
    valueKey: 'services.stats.satisfaction.value',
    labelKey: 'services.stats.satisfaction.label'
  }
]
</script>

<template>
  <UPageSection
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-8 sm:gap-12'
    }"
  >
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      <Motion
        v-for="(stat, index) in stats"
        :key="stat.valueKey"
        :initial="{ opacity: 0, transform: 'translateY(20px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index, duration: 0.5 }"
        :in-view-options="{ once: true, margin: '-100px' }"
        class="text-center"
      >
        <div class="flex flex-col items-center gap-3 p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-colors duration-300">
          <div class="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
            <UIcon
              :name="stat.icon"
              class="size-6 text-primary"
            />
          </div>
          <div class="text-3xl sm:text-4xl font-bold text-highlighted">
            {{ t(stat.valueKey) }}
          </div>
          <div class="text-sm text-muted">
            {{ t(stat.labelKey) }}
          </div>
        </div>
      </Motion>
    </div>
  </UPageSection>
</template>

