<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const { y } = useWindowScroll()
const isContactPage = computed(() => route.path.includes('/contact'))
const isLeadPage = computed(() => route.path.startsWith('/lead/'))
const showStickyCTA = computed(() => y.value > 300 && !isContactPage.value && !isLeadPage.value)

const ctaLinks = computed(() => ([
  {
    label: t('homepage.cta.button'),
    to: localePath('/contact'),
    variant: 'solid' as const,
    color: 'primary' as const
  }
]))
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showStickyCTA"
      role="banner"
      aria-label="Call to action"
      class="fixed bottom-0 left-0 right-0 z-50 bg-default/95 backdrop-blur-md border-t border-default shadow-lg"
    >
      <UContainer class="py-3 sm:py-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-12">
          <div class="flex-1 text-center sm:text-left">
            <p class="text-sm sm:text-base font-medium text-highlighted">
              {{ t('homepage.cta.title') }}
            </p>
            <p class="text-xs sm:text-sm text-muted mt-1 hidden sm:block">
              {{ t('homepage.cta.description') }}
            </p>
          </div>
          <div class="shrink-0">
            <UButton
              v-for="link in ctaLinks"
              :key="link.label"
              v-bind="link"
              size="md"
              class="font-semibold"
            >
              <template #trailing>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4"
                  aria-hidden="true"
                />
              </template>
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>
  </Transition>
</template>

<style scoped>
/* Assure que le sticky CTA ne chevauche pas le contenu */
:deep(body) {
  padding-bottom: 0;
}
</style>
