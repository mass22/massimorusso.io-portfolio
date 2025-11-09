<script setup lang="ts">
const { t } = useI18n()

const benefits = [
  {
    icon: 'i-ph-stack',
    titleKey: 'contact.why.benefits.expertise.title',
    descriptionKey: 'contact.why.benefits.expertise.description'
  },
  {
    icon: 'i-ph-lightning',
    titleKey: 'contact.why.benefits.reactivity.title',
    descriptionKey: 'contact.why.benefits.reactivity.description'
  },
  {
    icon: 'i-ph-handshake',
    titleKey: 'contact.why.benefits.collaboration.title',
    descriptionKey: 'contact.why.benefits.collaboration.description'
  },
  {
    icon: 'i-ph-chart-line-up',
    titleKey: 'contact.why.benefits.results.title',
    descriptionKey: 'contact.why.benefits.results.description'
  }
]
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="t('contact.why.title')"
      :description="t('contact.why.description')"
      :ui="{
        container: 'px-0 !pt-8 sm:!pt-12 gap-6 sm:gap-8',
        title: 'text-left text-2xl sm:text-3xl lg:text-4xl font-bold',
        description: 'text-left mt-3 text-base sm:text-lg text-muted max-w-3xl'
      }"
    >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-8">
      <Motion
        v-for="(benefit, index) in benefits"
        :key="benefit.titleKey"
        :initial="{ opacity: 0, transform: 'translateY(30px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index, duration: 0.5 }"
        :in-view-options="{ once: true, margin: '-100px' }"
        class="group p-6 rounded-lg bg-elevated/50 hover:bg-elevated/80 transition-all duration-300 hover:scale-[1.02]"
      >
        <div class="flex items-start gap-4">
          <div class="shrink-0 p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
            <UIcon
              :name="benefit.icon"
              class="size-6 text-primary"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-highlighted mb-2">
              {{ t(benefit.titleKey) }}
            </h3>
            <p class="text-sm text-muted leading-relaxed">
              {{ t(benefit.descriptionKey) }}
            </p>
          </div>
        </div>
      </Motion>
    </div>
  </UPageSection>
  </Motion>
</template>

