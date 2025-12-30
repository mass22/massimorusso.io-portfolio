<script setup lang="ts">
const { global } = useAppConfig()
const { t } = useI18n()

const linkedinUrl = 'https://www.linkedin.com/in/russomassimo-frontend-consultant'

useSeoMeta({
  description: () => t('contact.seo.description', { email: global.email }),
  ogDescription: () => t('contact.seo.description', { email: global.email }),
  ogTitle: () => t('contact.seo.title'),
  title: () => t('contact.seo.title')
})
</script>

<template>
  <UPage>
    <!-- Hero principal -->
    <UPageHero
      orientation="horizontal"
      :title="t('contact.hero.title')"
      :description="t('contact.hero.description')"
      :ui="{ root: 'mb-2', description: 'mt-3 text-xl text-primary/80 font-serif italic' }"
    />

    <!-- Indicateur de disponibilité -->
    <UPageSection
      :ui="{
        container: 'px-0 !pt-4 sm:!pt-6'
      }"
    >
      <UCard
        :class="[
          'w-full max-w-2xl mx-auto border-2 transition-all duration-300',
          global.available
            ? 'border-success/30 bg-success/5 dark:bg-success/10'
            : 'border-error/30 bg-error/5 dark:bg-error/10'
        ]"
      >
        <div class="flex items-center gap-4 p-4 sm:p-6">
          <div class="shrink-0">
            <span
              class="relative flex size-3"
              aria-hidden="true"
            >
              <span
                class="absolute inline-flex size-full rounded-full animate-pulse"
                :class="global.available ? 'bg-success opacity-75' : 'bg-error opacity-75'"
              />
              <span
                class="relative inline-flex size-3 rounded-full"
                :class="global.available ? 'bg-success' : 'bg-error'"
              />
            </span>
          </div>
          <div class="flex-1">
            <p
              class="text-sm sm:text-base font-semibold"
              :class="global.available ? 'text-success' : 'text-error'"
            >
              {{ global.available ? t('contact.availability.available.title') : t('contact.availability.unavailable.title') }}
            </p>
            <p class="text-xs sm:text-sm text-muted mt-1">
              {{ global.available ? t('contact.availability.available.description') : t('contact.availability.unavailable.description') }}
            </p>
          </div>
        </div>
      </UCard>
    </UPageSection>

    <!-- Section "Pourquoi me contacter ?" -->
    <LazyLandingContactWhy />

    <!-- Section principale : Cal.com + LinkedIn -->
    <UPageSection>
      <div class="flex flex-col items-center gap-8">
        <!-- Cal.com - Option principale -->
        <div
          id="calendar"
          class="w-full max-w-4xl scroll-mt-24"
        >
          <div class="text-center mb-6">
            <h2 class="text-2xl sm:text-3xl font-semibold mb-2">
              {{ t('contact.booking.title') }}
            </h2>
            <p class="text-muted text-sm sm:text-base">
              {{ t('contact.booking.description') }}
            </p>
          </div>
          <UCard class="w-full shadow-2xl p-0 overflow-hidden">
            <div class="flex flex-col items-center py-8 gap-3">
              <iframe
                :src="global.meetingLink"
                width="100%"
                style="min-height:630px; height:100%; border:0; background: white"
                allow="camera; microphone; fullscreen;"
                :title="t('contact.iframe.title')"
              />
            </div>
          </UCard>
        </div>

        <!-- Divider élégant -->
        <div class="flex items-center gap-4 w-full max-w-md">
          <div class="flex-1 h-px bg-border" />
          <span class="text-sm text-muted font-medium">{{ t('contact.divider') }}</span>
          <div class="flex-1 h-px bg-border" />
        </div>

        <!-- LinkedIn - Option alternative -->
        <div class="w-full max-w-2xl">
          <UCard class="w-full border-2 border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:to-primary/5">
            <div class="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
              <div class="shrink-0">
                <div class="size-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <UIcon
                    name="i-simple-icons-linkedin"
                    class="size-8 text-primary"
                  />
                </div>
              </div>
              <div class="flex-1 text-center sm:text-left">
                <h3 class="text-xl font-semibold mb-2">
                  {{ t('contact.linkedin.title') }}
                </h3>
                <p class="text-muted text-sm sm:text-base mb-4">
                  {{ t('contact.linkedin.description') }}
                </p>
                <UButton
                  :to="linkedinUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  size="lg"
                  icon="i-simple-icons-linkedin"
                  class="w-full sm:w-auto"
                  :label="t('contact.linkedin.cta')"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
