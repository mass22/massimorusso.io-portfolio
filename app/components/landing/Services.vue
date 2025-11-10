<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const serviceItems = [
  {
    descriptionKey: 'services.items.consulting.description',
    icon: 'i-ph-lightbulb',
    imageAltKey: 'services.items.consulting.imageAlt',
    titleKey: 'services.items.consulting.title'
  },
  {
    descriptionKey: 'services.items.workshops.description',
    icon: 'i-ph-chalkboard-teacher',
    imageAltKey: 'services.items.workshops.imageAlt',
    titleKey: 'services.items.workshops.title'
  },
  {
    descriptionKey: 'services.items.audit.description',
    icon: 'i-ph-sparkle',
    imageAltKey: 'services.items.audit.imageAlt',
    titleKey: 'services.items.audit.title'
  }
]
</script>

<template>
  <UPageSection
    :title="t('services.hero.title')"
    :description="t('services.hero.description')"
    :ui="{
      container: 'px-0 !pt-16 sm:!pt-20 lg:!pt-24 gap-6 sm:gap-8 bg-elevated/30 dark:bg-elevated/20 rounded-2xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16',
      title: 'text-left text-3xl sm:text-4xl lg:text-5xl font-bold text-highlighted',
      description: 'text-left mt-4 text-base sm:text-lg lg:text-xl text-muted max-w-3xl'
    }"
  >
    <UBlogPosts class="grid md:grid-cols-3 gap-6 mt-8">
      <Motion
        v-for="(service, index) in serviceItems"
        :key="service.titleKey"
        :initial="{ opacity: 0, transform: 'translateY(30px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index, duration: 0.5 }"
        :in-view-options="{ once: true, margin: '-100px' }"
      >
        <UPageCard
          :title="t(service.titleKey)"
          :description="t(service.descriptionKey)"
          :icon="service.icon"
          orientation="vertical"
          reverse
          :to="localePath('/services')"
          :aria-label="t(service.titleKey)"
          class="group hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
          :ui="{
            root: 'h-full',
            body: 'flex-1'
          }"
        >
        <template #footer>
          <UButton
            :to="localePath('/services')"
            variant="link"
            size="sm"
            class="px-0 gap-1 text-primary"
            :label="t('services.cta.learnMore')"
          >
            <template #trailing>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-all duration-300 ease-out opacity-0 group-hover:translate-x-2 group-hover:opacity-100"
                aria-hidden="true"
              />
            </template>
          </UButton>
        </template>
        <ClientOnly>
          <NuxtImg
            src="https://picsum.photos/400/300"
            :alt="t(service.imageAltKey)"
            width="400"
            height="300"
            loading="lazy"
            format="webp"
            quality="80"
            class="w-full h-48 object-cover rounded-lg"
          />
          <template #fallback>
            <div class="w-full h-48 bg-muted rounded-lg animate-pulse" />
          </template>
        </ClientOnly>
        </UPageCard>
      </Motion>
    </UBlogPosts>

    <div class="flex justify-center mt-8">
      <UButton
        :to="localePath('/services')"
        color="primary"
        variant="solid"
        size="lg"
        class="font-semibold px-8 group"
        :label="t('hero.cta.services')"
      >
        <template #trailing>
          <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
        </template>
      </UButton>
    </div>
  </UPageSection>
</template>

