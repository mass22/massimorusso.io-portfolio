<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'
import type { Testimonial } from '~/types/content'
import { usePreferredReducedMotion } from '@vueuse/core'

const { t } = useI18n()
const prefersReducedMotion = usePreferredReducedMotion()

defineProps<{
  page: IndexCollectionItem & { testimonials?: Testimonial[] }
}>()

// UUser attend { name, description?, avatar?, to?, target? } — construit à partir des champs plats
const getAuthorProps = (t: Testimonial) => {
  if (!t?.authorName) return null
  return {
    name: t.authorName,
    description: t.authorDescription,
    avatar: t.authorAvatar ? { src: t.authorAvatar, alt: t.authorAvatarAlt || t.authorName } : undefined,
    ...(t.authorLinkedin && { to: t.authorLinkedin, target: '_blank' as const })
  }
}
</script>

<template>
  <Motion
    v-if="page.testimonials && page.testimonials.length > 0"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="t('homepage.testimonials.title')"
      :description="t('homepage.testimonials.description')"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20',
        title: 'text-center text-2xl sm:text-3xl font-bold text-highlighted',
        description: 'text-center mt-2 text-base text-muted max-w-2xl mx-auto'
      }"
    >
      <!-- Si l'utilisateur préfère moins de mouvement : grille statique -->
      <div
        v-if="prefersReducedMotion"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      >
        <Motion
          v-for="(testimonial, index) in page.testimonials"
          :key="index"
          :initial="{ opacity: 0, y: 20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.05 * index, duration: 0.4 }"
          :in-view-options="{ once: true }"
        >
          <UCard
            variant="subtle"
            class="h-full border-l-4 border-l-primary/60"
            :ui="{ root: 'h-full', body: 'flex flex-col flex-1' }"
          >
            <UIcon
              name="i-lucide-quote"
              class="size-8 text-primary/40 mb-2"
              aria-hidden="true"
            />
            <p class="text-[15px] leading-relaxed text-muted flex-1">
              {{ testimonial.quote }}
            </p>
            <div
              v-if="getAuthorProps(testimonial)"
              class="mt-4 pt-4 border-t border-default/50"
            >
              <UUser
                v-bind="getAuthorProps(testimonial)!"
                size="lg"
                :ui="{ description: 'text-sm text-muted' }"
              />
            </div>
          </UCard>
        </Motion>
      </div>

      <!-- Marquee double row : une ligne vers la droite, une vers la gauche -->
      <div
        v-else
        class="flex flex-col gap-4 w-full overflow-hidden"
      >
        <UMarquee
          pause-on-hover
          :overlay="false"
          :ui="{
            root: '[--gap:--spacing(4)] [--duration:35s]',
            content: 'w-auto py-2'
          }"
        >
          <UCard
            v-for="(testimonial, index) in page.testimonials"
            :key="`a-${index}`"
            variant="subtle"
            class="w-72 sm:w-80 shrink-0 border-l-4 border-l-primary/60 hover:border-l-primary transition-colors duration-300"
            :ui="{
              root: 'h-full',
              body: 'flex flex-col flex-1',
              footer: 'pt-4 mt-auto border-t-0'
            }"
          >
            <div class="flex flex-col h-full">
              <UIcon
                name="i-lucide-quote"
                class="size-8 text-primary/40 mb-2 shrink-0"
                aria-hidden="true"
              />
              <p
                class="text-[15px] leading-relaxed text-muted line-clamp-4 flex-1"
              >
                {{ testimonial.quote }}
              </p>
              <div
                v-if="getAuthorProps(testimonial)"
                class="mt-4 pt-4 border-t border-default/50"
              >
                <UUser
                  v-bind="getAuthorProps(testimonial)!"
                  size="lg"
                  :ui="{
                    description: 'text-sm text-muted line-clamp-1'
                  }"
                />
              </div>
            </div>
          </UCard>
        </UMarquee>

        <UMarquee
          pause-on-hover
          reverse
          :overlay="false"
          :ui="{
            root: '[--gap:--spacing(4)] [--duration:40s]',
            content: 'w-auto py-2'
          }"
        >
          <UCard
            v-for="(testimonial, index) in page.testimonials"
            :key="`b-${index}`"
            variant="subtle"
            class="w-72 sm:w-80 shrink-0 border-l-4 border-l-primary/40 hover:border-l-primary/80 transition-colors duration-300"
            :ui="{
              root: 'h-full',
              body: 'flex flex-col flex-1',
              footer: 'pt-4 mt-auto border-t-0'
            }"
          >
            <div class="flex flex-col h-full">
              <UIcon
                name="i-lucide-quote"
                class="size-8 text-primary/30 mb-2 shrink-0"
                aria-hidden="true"
              />
              <p
                class="text-[15px] leading-relaxed text-muted line-clamp-4 flex-1"
              >
                {{ testimonial.quote }}
              </p>
              <div
                v-if="getAuthorProps(testimonial)"
                class="mt-4 pt-4 border-t border-default/50"
              >
                <UUser
                  v-bind="getAuthorProps(testimonial)!"
                  size="lg"
                  :ui="{
                    description: 'text-sm text-muted line-clamp-1'
                  }"
                />
              </div>
            </div>
          </UCard>
        </UMarquee>
      </div>
    </UPageSection>
  </Motion>
</template>
