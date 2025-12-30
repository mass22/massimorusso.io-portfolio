<script setup lang="ts">
const { t } = useI18n()

const processSteps = [
  {
    icon: 'i-ph-magnifying-glass',
    titleKey: 'services.process.steps.discovery.title',
    descriptionKey: 'services.process.steps.discovery.description',
    number: '01'
  },
  {
    icon: 'i-ph-paint-brush',
    titleKey: 'services.process.steps.design.title',
    descriptionKey: 'services.process.steps.design.description',
    number: '02'
  },
  {
    icon: 'i-ph-code',
    titleKey: 'services.process.steps.development.title',
    descriptionKey: 'services.process.steps.development.description',
    number: '03'
  },
  {
    icon: 'i-ph-rocket',
    titleKey: 'services.process.steps.optimization.title',
    descriptionKey: 'services.process.steps.optimization.description',
    number: '04'
  }
]
</script>

<template>
  <UPageSection
    :title="t('services.process.title')"
    :description="t('services.process.description')"
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12',
      title: 'text-left text-2xl sm:text-3xl lg:text-4xl font-bold',
      description: 'text-left mt-3 text-base sm:text-lg text-muted max-w-3xl'
    }"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
      <Motion
        v-for="(step, index) in processSteps"
        :key="step.titleKey"
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
                  :name="step.icon"
                  class="size-6 text-primary"
                />
              </div>
              <span
                class="text-2xl font-bold text-muted"
                aria-hidden="true"
              >
                {{ step.number }}
              </span>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-highlighted mb-2">
              {{ t(step.titleKey) }}
            </h3>
            <p class="text-sm text-muted leading-relaxed">
              {{ t(step.descriptionKey) }}
            </p>
          </div>
        </div>
        <div
          v-if="index < processSteps.length - 1"
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
</template>
