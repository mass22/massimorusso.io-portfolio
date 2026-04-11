<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { t } = useI18n()

type MarqueeLogo = {
  name: string
  icon?: string
  /** Image logo : string (path) ou { src, alt }. Formats: JPEG, PNG, SVG, WebP */
  image?: string | { src: string, alt: string }
  color?: string
  url?: string
}

const getImageProps = (logo: MarqueeLogo) => {
  if (!logo.image) {
    return null
  }
  if (typeof logo.image === 'string') {
    return { alt: logo.name, src: logo.image }
  }
  return logo.image
}

const props = defineProps<{
  page?: IndexCollectionItem & { marquee?: { title?: string, logos?: MarqueeLogo[] } }
}>()

const logos = computed(() => props.page?.marquee?.logos ?? [])

const title = computed(() => props.page?.marquee?.title || t('homepage.marquee.title'))

const getColorStyle = (color?: string): Record<string, string> | undefined =>
  color && color.startsWith('#')
    ? { color }
    : undefined

const getColorClass = (color?: string) =>
  color && !color.startsWith('#') ? color : ''

const hasLogos = computed(() => logos.value.length > 0)

const logoShellClass
  = 'flex items-center justify-center rounded-lg bg-white px-4 py-2 ring-1 ring-zinc-200/90 dark:ring-zinc-600/50'
</script>

<template>
  <Motion
    v-if="hasLogos"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="title"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20',
        title: 'text-center text-2xl sm:text-3xl font-bold text-highlighted'
      }"
    >
      <UMarquee
        pause-on-hover
        :repeat="4"
        :ui="{
          root: '[--gap:--spacing(12)]',
          content: 'w-auto py-4'
        }"
      >
        <template
          v-for="(logo, index) in logos"
          :key="index"
        >
          <ULink
            v-if="logo.url"
            :to="logo.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${logo.name} - ${t('homepage.companies.visit')}`"
            class="group flex min-h-18 shrink-0 items-center justify-center gap-3 rounded-xl border border-default/40 bg-default/30 px-4 py-3 transition-colors hover:border-default"
          >
            <div
              v-if="getImageProps(logo)"
              :class="logoShellClass"
            >
              <div class="marquee-logo-wrap flex h-10 w-28 shrink-0 items-center justify-center">
                <img
                  :src="getImageProps(logo)!.src"
                  :alt="getImageProps(logo)!.alt"
                  width="96"
                  height="40"
                  class="marquee-logo-img max-h-8 max-w-24 object-contain object-center"
                  loading="lazy"
                >
              </div>
            </div>
            <div
              v-else-if="logo.icon"
              :class="logoShellClass"
            >
              <UIcon
                :name="logo.icon"
                :class="['size-8 shrink-0', getColorClass(logo.color) || 'text-zinc-700']"
                :style="getColorStyle(logo.color)"
              />
            </div>
            <span class="marquee-logo-name max-w-28 truncate text-sm font-medium text-highlighted">{{ logo.name }}</span>
          </ULink>
          <div
            v-else
            class="flex min-h-18 shrink-0 items-center justify-center gap-3 rounded-xl border border-default/40 bg-default/30 px-4 py-3"
            :aria-label="logo.name"
          >
            <div
              v-if="getImageProps(logo)"
              :class="logoShellClass"
            >
              <div class="marquee-logo-wrap flex h-10 w-28 shrink-0 items-center justify-center">
                <img
                  :src="getImageProps(logo)!.src"
                  :alt="getImageProps(logo)!.alt"
                  width="96"
                  height="40"
                  class="marquee-logo-img max-h-8 max-w-24 object-contain object-center"
                  loading="lazy"
                >
              </div>
            </div>
            <div
              v-else-if="logo.icon"
              :class="logoShellClass"
            >
              <UIcon
                :name="logo.icon"
                :class="['size-8 shrink-0', getColorClass(logo.color) || 'text-zinc-700']"
                :style="getColorStyle(logo.color)"
              />
            </div>
          </div>
        </template>
      </UMarquee>
    </UPageSection>
  </Motion>
</template>

<style scoped>
.marquee-logo-wrap {
  min-height: 2.5rem;
  min-width: 7rem;
}

.marquee-logo-img {
  filter: none;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.group:hover .marquee-logo-img {
  filter: none;
  opacity: 1;
}
</style>
