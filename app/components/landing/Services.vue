<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content';
import { computed } from 'vue';

type ServiceItem = {
  title: string
  description: string
  icon?: string
  imageAlt?: string
  slug?: string
}

type ServicesSection = {
  title?: string
  description?: string
  items?: ServiceItem[]
}

const { t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  page: IndexCollectionItem & { services?: ServicesSection }
}>()

// Fonction pour obtenir l'icône du service
const getServiceIcon = (service: ServiceItem): string => {
  if (service.icon) return service.icon
  const iconMap: Record<string, string> = {
    'architecture-frontend': 'i-ph-lightbulb',
    'frontend-architecture': 'i-ph-lightbulb',
    'aide-decision-technique': 'i-ph-chalkboard-teacher',
    'technical-decision-support': 'i-ph-chalkboard-teacher',
    'ia-pragmatique': 'i-ph-sparkle',
    'pragmatic-ai': 'i-ph-sparkle'
  }
  return service.slug ? (iconMap[service.slug] || 'i-ph-circle') : 'i-ph-circle'
}

// Fonction pour obtenir le chemin du service
const getServicePath = (service: ServiceItem) => {
  // Si le service a un slug, l'utiliser directement
  if (service.slug) {
    return localePath(`/services/${service.slug}`)
  }

  // Mapping des services vers leurs slugs (fallback si pas de slug dans les données)
  const serviceSlugs: Record<string, string> = {
    [t('services.items.consulting.title')]: 'consulting',
    [t('services.items.workshops.title')]: 'workshops',
    [t('services.items.audit.title')]: 'audit'
  }

  // Utiliser le mapping par titre
  const slug = serviceSlugs[service.title]
  if (slug) {
    return localePath(`/services/${slug}`)
  }

  // Fallback vers la page services générale
  return localePath('/services')
}

// Fallback vers les traductions si pas de données dans page
const serviceItems = computed(() => {
  if (props.page?.services?.items && props.page.services.items.length > 0) {
    return props.page.services.items
  }

  // Fallback vers les traductions avec slugs
  return [
    {
      title: t('services.items.consulting.title'),
      description: t('services.items.consulting.description'),
      icon: 'i-ph-lightbulb',
      imageAlt: t('services.items.consulting.imageAlt'),
      slug: 'consulting'
    },
    {
      title: t('services.items.workshops.title'),
      description: t('services.items.workshops.description'),
      icon: 'i-ph-chalkboard-teacher',
      imageAlt: t('services.items.workshops.imageAlt'),
      slug: 'workshops'
    },
    {
      title: t('services.items.audit.title'),
      description: t('services.items.audit.description'),
      icon: 'i-ph-sparkle',
      imageAlt: t('services.items.audit.imageAlt'),
      slug: 'audit'
    }
  ]
})
</script>

<template>
  <UPageSection
    :title="page.services?.title || t('services.hero.title')"
    :description="page.services?.description || t('services.hero.description')"
    :ui="{
      container: 'px-0 !pt-16 sm:!pt-20 lg:!pt-24 gap-6 sm:gap-8 bg-elevated/30 dark:bg-elevated/20 rounded-2xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16',
      title: 'text-left text-3xl sm:text-4xl lg:text-5xl font-bold text-highlighted',
      description: 'text-left mt-4 text-base sm:text-lg lg:text-xl text-muted max-w-3xl'
    }"
  >
    <UBlogPosts class="grid md:grid-cols-3 gap-6 mt-8">
      <Motion
        v-for="(service, index) in serviceItems"
        :key="service.title"
        :initial="{ opacity: 0, transform: 'translateY(30px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index, duration: 0.5 }"
        :in-view-options="{ once: true, margin: '-100px' }"
      >
        <UPageCard
          :title="service.title"
          :description="service.description"
          :icon="getServiceIcon(service)"
          orientation="vertical"
          reverse
          :to="getServicePath(service)"
          :aria-label="service.title"
          class="group hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
          :ui="{
            root: 'h-full',
            body: 'flex-1'
          }"
        >
        <template #footer>
          <UButton
            :to="getServicePath(service)"
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
            :src="`/services/service-${index + 1}.png`"
            :alt="service.imageAlt || service.title"
            width="400"
            height="300"
            loading="lazy"
            format="webp"
            quality="80"
            class="w-full h-48 object-cover rounded-lg"
            placeholder
            sizes="sm:400px md:400px lg:400px"
          />
          <template #fallback>
            <div class="w-full h-48 bg-muted rounded-lg animate-pulse" style="aspect-ratio: 4/3;" />
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

