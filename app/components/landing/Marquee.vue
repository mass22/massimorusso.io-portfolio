<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { t } = useI18n()

type MarqueeLogo = {
  name: string
  icon?: string
  /** Image logo — string (path) ou { src, alt }. Formats: JPEG, PNG, SVG, WebP */
  image?: string | { src: string, alt: string }
  color?: string
  url?: string
}

const getImageProps = (logo: MarqueeLogo) => {
  if (!logo.image) return null
  if (typeof logo.image === 'string') {
    return { src: logo.image, alt: logo.name }
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
        :aria-label="t('homepage.marquee.ariaLabel')"
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
            class="group flex shrink-0 items-center justify-center gap-3 rounded-xl border border-default/30 px-8 py-4 min-h-20 marquee-card transition-colors"
          >
            <div
              v-if="getImageProps(logo)"
              class="marquee-logo-wrap flex h-12 w-28 shrink-0 items-center justify-center"
            >
              <img
                :src="getImageProps(logo)!.src"
                :alt="getImageProps(logo)!.alt"
                class="marquee-logo-img max-h-10 max-w-24 object-contain object-center"
                loading="lazy"
              >
            </div>
            <UIcon
              v-else-if="logo.icon"
              :name="logo.icon"
              :class="['size-10 shrink-0', getColorClass(logo.color) || 'text-muted']"
              :style="getColorStyle(logo.color)"
            />
            <span class="marquee-logo-name">{{ logo.name }}</span>
          </ULink>
          <div
            v-else
            class="flex shrink-0 items-center justify-center gap-3 rounded-xl border border-default/30 px-8 py-4 min-h-20 marquee-card"
            :aria-label="logo.name"
          >
            <div
              v-if="getImageProps(logo)"
              class="marquee-logo-wrap flex h-12 w-28 shrink-0 items-center justify-center"
            >
              <img
                :src="getImageProps(logo)!.src"
                :alt="getImageProps(logo)!.alt"
                class="marquee-logo-img max-h-10 max-w-24 object-contain object-center"
                loading="lazy"
              >
            </div>
            <UIcon
              v-else-if="logo.icon"
              :name="logo.icon"
              :class="['size-10 shrink-0', getColorClass(logo.color) || 'text-muted']"
              :style="getColorStyle(logo.color)"
            />
            <span class="marquee-logo-name">{{ logo.name }}</span>
          </div>
        </template>
      </UMarquee>
    </UPageSection>
  </Motion>
</template>

<style scoped>
/* Conteneur standardisé : taille fixe pour tous les logos */
.marquee-logo-wrap {
  min-height: 3rem;
  min-width: 7rem;
}

/* Noms des logos : noir pour lisibilité (évite l'héritage bleu des liens) */
.marquee-logo-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(24 24 27);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .marquee-logo-name {
  color: rgb(244 244 245);
}

/* Logo images : noir et blanc, fond zinc pour bonne visibilité */
.marquee-logo-img {
  filter: grayscale(100%) brightness(1.2) contrast(1.15);
  transition: filter 0.3s ease;
}

.group:hover .marquee-logo-img {
  filter: grayscale(0%) brightness(1) contrast(1);
}

/* Fond cohérent avec le site, contraste optimisé pour logos clairs et foncés */
.marquee-card {
  background-color: rgb(228 228 231 / 0.95); /* zinc-200, contraste pour logos blancs */
}

.dark .marquee-card {
  background-color: rgb(39 39 42 / 0.95); /* zinc-800, contraste pour logos clairs */
}

.group:hover.marquee-card {
  background-color: rgb(212 212 216 / 0.98); /* zinc-300 au survol */
}

.dark .group:hover.marquee-card {
  background-color: rgb(63 63 70 / 0.98); /* zinc-700 au survol */
}
</style>
