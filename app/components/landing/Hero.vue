<script setup lang="ts">
import type { IndexPage } from '~/types/content';

const { footer, global } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

defineProps<{
  page: IndexPage
}>()

// Mapper les liens du footer avec leurs aria-labels pour l'accessibilité
const footerLinksWithLabels = computed(() => footer?.links?.map(link => ({
  ...link,
  'aria-label': link.ariaLabelKey ? t(link.ariaLabelKey) : (link as any).label
})) ?? [])

// Désactiver les animations sur mobile pour améliorer les performances
const isMobile = ref(false)
onMounted(() => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
})
</script>

<template>
  <UPageHero
    orientation="horizontal"
    reverse
    :ui="{
      headline: 'flex flex-col items-center justify-center',
      title: 'text-shadow-md max-w-lg mx-auto',
      links: 'mt-4 flex-col justify-center items-center'
    }"
  >
    <template #headline>
      <Motion
        v-if="!isMobile"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
      >
        <!-- <UColorModeAvatar
          class="size-18 ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
          :light="global.picture?.light!"
          :dark="global.picture?.dark!"
          :alt="global.picture?.alt!"
        /> -->
            <p v-for="(tag, i) in page.hero.tags" :key="tag" class="inline-flex items-center">
              <span class="px-2 py-1 md:text-8xl text-5xl text-vue">
                {{ tag }}
              </span>
            </p>
      </Motion>
      <template v-else>
        <p v-for="(tag, i) in page.hero.tags" :key="tag" class="inline-flex items-center">
          <span class="px-2 py-1 md:text-8xl text-5xl text-vue">
            {{ tag }}
          </span>
        </p>
      </template>
    </template>

    <template #title>
      <Motion
        v-if="!isMobile"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
      >
        {{ page.title }}
      </Motion>
      <template v-else>{{ page.title }}</template>
    </template>

    <template #description>
      <Motion
        v-if="!isMobile"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
        }"
      >
        {{ page.description }}
      </Motion>
      <template v-else>{{ page.description }}</template>
    </template>

    <template #links>
      <Motion
        v-if="!isMobile"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.5
        }"
      >
        <div class="flex flex-col items-center gap-3 w-full">
          <!-- CTA Principal vers Services -->
          <UButton
            :to="localePath('/services')"
            color="primary"
            variant="solid"
            size="lg"
            class="font-semibold px-8 py-3"
            :label="t('hero.cta.services')"
          >
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
            </template>
          </UButton>

          <!-- CTA Secondaire vers Contact -->
          <UButton
            :to="localePath('/contact')"
            color="neutral"
            variant="outline"
            size="md"
            :label="t('hero.cta.contact')"
          />

          <div
            v-if="page.hero.links"
            class="flex items-center gap-2 mt-2"
          >
            <UButton
              :color="global.available ? 'success' : 'error'"
              variant="ghost"
              class="gap-2"
              :to="global.available ? global.meetingLink : ''"
              :label="global.available ? 'Available for new projects' : 'Not available at the moment'"
            >
              <template #leading>
                <span class="relative flex size-2" aria-hidden="true">
                  <span
                    class="absolute inline-flex size-full rounded-full opacity-75"
                    :class="global.available ? 'bg-success' : 'bg-error'"
                  />
                  <span
                    class="relative inline-flex size-2 scale-90 rounded-full"
                    :class="global.available ? 'bg-success' : 'bg-error'"
                  />
                </span>
              </template>
            </UButton>
            <UButton
              v-if="page.hero.isResourcesAvailable"
              v-bind="page.hero.links[0]"
              :aria-label="page.hero.links[0]?.label"
            />
            <UButton
              v-else
              v-bind="page.hero.links[1]"
              :aria-label="page.hero.links[1]?.label"
            />
          </div>
        </div>
      </Motion>
      <template v-else>
        <div class="flex flex-col items-center gap-3 w-full">
          <!-- CTA Principal vers Services -->
          <UButton
            :to="localePath('/services')"
            color="primary"
            variant="solid"
            size="lg"
            class="font-semibold px-8 py-3 w-full group"
            :label="t('hero.cta.services')"
          >
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </template>
          </UButton>

          <!-- CTA Secondaire vers Contact -->
          <UButton
            :to="localePath('/contact')"
            color="neutral"
            variant="outline"
            size="md"
            class="w-full group"
            :label="t('hero.cta.contact')"
          />

          <div
            v-if="page.hero.links"
            class="flex items-center gap-2 mt-2"
          >
            <UButton
              :color="global.available ? 'success' : 'error'"
              variant="ghost"
              class="gap-2"
              :to="global.available ? global.meetingLink : ''"
              :label="global.available ? 'Available for new projects' : 'Not available at the moment'"
            >
              <template #leading>
                <span class="relative flex size-2" aria-hidden="true">
                  <span
                    class="absolute inline-flex size-full rounded-full opacity-75"
                    :class="global.available ? 'bg-success' : 'bg-error'"
                  />
                  <span
                    class="relative inline-flex size-2 scale-90 rounded-full"
                    :class="global.available ? 'bg-success' : 'bg-error'"
                  />
                </span>
              </template>
            </UButton>
            <UButton
              v-if="page.hero.isResourcesAvailable"
              v-bind="page.hero.links[0]"
              :aria-label="page.hero.links[0]?.label"
            />
            <UButton
              v-else
              v-bind="page.hero.links[1]"
              :aria-label="page.hero.links[1]?.label"
            />
          </div>
        </div>
      </template>

      <div class="gap-x-4 inline-flex mt-4">
        <template v-if="!isMobile">
          <Motion
            v-for="(link, index) of footerLinksWithLabels"
            :key="index"
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.5 + index * 0.1
            }"
          >
            <UButton
              v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
            >
              <template v-if="link.icon" #leading>
                <UIcon :name="link.icon" aria-hidden="true" />
              </template>
            </UButton>
          </Motion>
        </template>
        <template v-else>
          <UButton
            v-for="(link, index) of footerLinksWithLabels"
            :key="index"
            v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
          >
            <template v-if="link.icon" #leading>
              <UIcon :name="link.icon" aria-hidden="true" />
            </template>
          </UButton>
        </template>
      </div>
    </template>

    <!-- <UMarquee
      pause-on-hover
      class="py-2 -mx-8 sm:-mx-12 lg:-mx-16 [--duration:40s]"
    >
      <Motion
        v-for="(img, index) in page.hero.images"
        :key="index"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: index * 0.1
        }"
      >
        <NuxtImg
          width="234"
          height="234"
          class="rounded-lg aspect-square object-cover"
          :class="index % 2 === 0 ? '-rotate-2' : 'rotate-2'"
          v-bind="img"
        />
      </Motion>
    </UMarquee> -->
    <ClientOnly>
      <img
        src="https://picsum.photos/seed/picsum/800/800"
        :alt="t('hero.image.alt')"
        width="800"
        height="800"
        loading="eager"
        fetchpriority="high"
        class="rounded-lg shadow-2xl ring ring-default"
      />
      <template #fallback>
        <div class="w-full h-[800px] bg-muted rounded-lg shadow-2xl ring ring-default animate-pulse" />
      </template>
    </ClientOnly>
  </UPageHero>
</template>
