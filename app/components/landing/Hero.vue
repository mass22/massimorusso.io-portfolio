<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content';

const { footer, global } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  page: IndexCollectionItem
}>()

// Transformer les liens du hero pour appliquer localePath
const heroLinks = computed(() => {
  if (!props.page?.hero?.links) return []
  return props.page.hero.links.map(link => ({
    ...link,
    to: link.to ? localePath(link.to) : link.to
  }))
})

// Construire le chemin vers le calendrier avec le hash de manière SSR-safe
// Toujours retourner le chemin sans hash pour éviter les problèmes d'hydratation
// Le hash sera géré par le navigateur lors du clic
const calendarLink = computed(() => {
  if (!global.available) return undefined
  return localePath('/contact')
})

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
      headline: 'flex flex-col items-start justify-start',
      title: 'text-shadow-md max-w-lg text-left mx-0',
      description: 'text-left',
      links: 'mt-4 flex-col justify-center items-center'
    }"
  >
    <template #headline>
      <ClientOnly>
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
            <div class="flex flex-col items-start">
              <p v-for="(tag, i) in page.hero.tags" :key="tag" class="flex items-center">
                <span class="px-2 py-1 md:text-6xl text-5xl text-vue">
                  {{ tag }}
                </span>
              </p>
            </div>
      </Motion>
      <div v-else class="flex flex-col items-start">
        <p v-for="(tag, i) in page.hero.tags" :key="tag" class="flex items-center">
          <span class="px-2 py-1 md:text-6xl text-5xl text-vue">
            {{ tag }}
          </span>
        </p>
      </div>
        <template #fallback>
          <div class="flex flex-col items-start">
            <p v-for="(tag, i) in page.hero.tags" :key="tag" class="flex items-center">
              <span class="px-2 py-1 md:text-6xl text-5xl text-vue">
                {{ tag }}
              </span>
            </p>
          </div>
        </template>
      </ClientOnly>
    </template>

    <template #title>
      <div class="text-left w-full">
        <ClientOnly>
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
          <template #fallback>{{ page.title }}</template>
        </ClientOnly>
      </div>
    </template>

    <template #description>
      <div class="text-left w-full">
        <ClientOnly>
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
          <template #fallback>{{ page.description }}</template>
        </ClientOnly>
      </div>
    </template>

    <template #links>
      <ClientOnly>
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
          <!-- CTA Principaux côte à côte -->
          <div class="flex items-center gap-3 w-full">
            <UButton
              :to="localePath('/services')"
              color="primary"
              variant="solid"
              size="lg"
              class="font-semibold px-8 py-3 flex-1 group justify-center"
              :label="t('hero.cta.services')"
              :ui="{ base: 'justify-center' }"
            >
              <template #trailing>
                <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
              </template>
            </UButton>

            <UButton
              :to="localePath('/contact')"
              color="neutral"
              variant="outline"
              size="lg"
              class="font-semibold px-8 py-3 flex-1 group justify-center"
              :label="t('hero.cta.contact')"
              :ui="{ base: 'justify-center' }"
            />
          </div>

          <!-- Boutons secondaires empilés -->
          <div
            v-if="heroLinks.length > 0"
            class="flex flex-col items-center gap-2 w-full mt-2"
          >
            <ClientOnly>
              <UButton
                :color="global.available ? 'success' : 'error'"
                variant="ghost"
                class="gap-2 w-full justify-center"
                :to="global.available ? calendarLink : undefined"
                :disabled="!global.available"
                :label="global.available ? t('contact.availability.available.title') : t('contact.availability.unavailable.title')"
                :ui="{ base: 'justify-center' }"
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
              <template #fallback>
                <UButton
                  color="error"
                  variant="ghost"
                  class="gap-2 w-full justify-center"
                  disabled
                  :label="t('contact.availability.unavailable.title')"
                  :ui="{ base: 'justify-center' }"
                >
                  <template #leading>
                    <span class="relative flex size-2" aria-hidden="true">
                      <span class="absolute inline-flex size-full rounded-full opacity-75 bg-error" />
                      <span class="relative inline-flex size-2 scale-90 rounded-full bg-error" />
                    </span>
                  </template>
                </UButton>
              </template>
            </ClientOnly>
            <UButton
              v-if="page.hero.isResourcesAvailable"
              v-bind="heroLinks[0]"
              class="w-full justify-center"
              :aria-label="heroLinks[0]?.label"
              :ui="{ base: 'justify-center' }"
            />
            <UButton
              v-else
              v-bind="heroLinks[1]"
              class="w-full justify-center"
              :aria-label="heroLinks[1]?.label"
              :ui="{ base: 'justify-center' }"
            />
          </div>
        </div>
      </Motion>
      <div v-else class="flex flex-col items-center gap-3 w-full">
        <!-- CTA Principaux empilés verticalement -->
        <div class="flex flex-col items-center gap-3 w-full">
          <UButton
            :to="localePath('/services')"
            color="primary"
            variant="solid"
            size="lg"
            class="font-semibold px-8 py-3 w-full group justify-center"
            :label="t('hero.cta.services')"
            :ui="{ base: 'justify-center' }"
          >
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </template>
          </UButton>

          <UButton
            :to="localePath('/contact')"
            color="neutral"
            variant="outline"
            size="lg"
            class="font-semibold px-8 py-3 w-full group justify-center"
            :label="t('hero.cta.contact')"
            :ui="{ base: 'justify-center' }"
          />
        </div>

        <!-- Boutons secondaires empilés -->
        <div
          v-if="heroLinks.length > 0"
          class="flex flex-col items-center gap-2 w-full mt-2"
        >
          <ClientOnly>
            <UButton
              :color="global.available ? 'success' : 'error'"
              variant="ghost"
              class="gap-2 w-full justify-center"
              :to="global.available ? calendarLink : undefined"
              :disabled="!global.available"
              :label="global.available ? t('contact.availability.available.title') : t('contact.availability.unavailable.title')"
              :ui="{ base: 'justify-center' }"
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
            <template #fallback>
              <UButton
                color="error"
                variant="ghost"
                class="gap-2 w-full justify-center"
                disabled
                :label="t('contact.availability.unavailable.title')"
                :ui="{ base: 'justify-center' }"
              >
                <template #leading>
                  <span class="relative flex size-2" aria-hidden="true">
                    <span class="absolute inline-flex size-full rounded-full opacity-75 bg-error" />
                    <span class="relative inline-flex size-2 scale-90 rounded-full bg-error" />
                  </span>
                </template>
              </UButton>
            </template>
          </ClientOnly>
          <UButton
            v-if="page.hero.isResourcesAvailable"
            v-bind="heroLinks[0]"
            class="w-full justify-center"
            :aria-label="heroLinks[0]?.label"
            :ui="{ base: 'justify-center' }"
          />
          <UButton
            v-else
            v-bind="heroLinks[1]"
            class="w-full justify-center"
            :aria-label="heroLinks[1]?.label"
            :ui="{ base: 'justify-center' }"
          />
        </div>
      </div>
        <template #fallback>
          <div class="flex flex-col items-center gap-3 w-full">
            <!-- CTA Principaux empilés verticalement -->
            <div class="flex flex-col items-center gap-3 w-full">
              <UButton
                :to="localePath('/services')"
                color="primary"
                variant="solid"
                size="lg"
                class="font-semibold px-8 py-3 w-full group justify-center"
                :label="t('hero.cta.services')"
                :ui="{ base: 'justify-center' }"
              >
                <template #trailing>
                  <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
                </template>
              </UButton>

              <UButton
                :to="localePath('/contact')"
                color="neutral"
                variant="outline"
                size="lg"
                class="font-semibold px-8 py-3 w-full group justify-center"
                :label="t('hero.cta.contact')"
                :ui="{ base: 'justify-center' }"
              />
            </div>

            <!-- Boutons secondaires empilés -->
            <div
              v-if="heroLinks.length > 0"
              class="flex flex-col items-center gap-2 w-full mt-2"
            >
              <ClientOnly>
                <UButton
                  :color="global.available ? 'success' : 'error'"
                  variant="ghost"
                  class="gap-2 w-full justify-center"
                  :to="global.available ? calendarLink : undefined"
                  :disabled="!global.available"
                  :label="global.available ? t('contact.availability.available.title') : t('contact.availability.unavailable.title')"
                  :ui="{ base: 'justify-center' }"
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
                <template #fallback>
                  <UButton
                    color="error"
                    variant="ghost"
                    class="gap-2 w-full justify-center"
                    disabled
                    :label="t('contact.availability.unavailable.title')"
                    :ui="{ base: 'justify-center' }"
                  >
                    <template #leading>
                      <span class="relative flex size-2" aria-hidden="true">
                        <span class="absolute inline-flex size-full rounded-full opacity-75 bg-error" />
                        <span class="relative inline-flex size-2 scale-90 rounded-full bg-error" />
                      </span>
                    </template>
                  </UButton>
                </template>
              </ClientOnly>
              <UButton
                v-if="page.hero.isResourcesAvailable"
                v-bind="heroLinks[0]"
                class="w-full justify-center"
                :aria-label="heroLinks[0]?.label"
                :ui="{ base: 'justify-center' }"
              />
              <UButton
                v-else
                v-bind="heroLinks[1]"
                class="w-full justify-center"
                :aria-label="heroLinks[1]?.label"
                :ui="{ base: 'justify-center' }"
              />
            </div>
          </div>
        </template>
      </ClientOnly>

      <ClientOnly>
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
        <template #fallback>
          <div class="gap-x-4 inline-flex mt-4">
            <UButton
              v-for="(link, index) of footerLinksWithLabels"
              :key="index"
              v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
            >
              <template v-if="link.icon" #leading>
                <UIcon :name="link.icon" aria-hidden="true" />
              </template>
            </UButton>
          </div>
        </template>
      </ClientOnly>
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
      <NuxtImg
        src="https://picsum.photos/seed/picsum/800/800"
        :alt="t('hero.image.alt')"
        width="800"
        height="800"
        loading="eager"
        fetchpriority="high"
        format="webp"
        quality="80"
        class="rounded-lg shadow-2xl ring ring-default"
        placeholder
        sizes="(max-width: 768px) 100vw, 800px"
      />
      <template #fallback>
        <div class="w-full bg-muted rounded-lg shadow-2xl ring ring-default animate-pulse" style="aspect-ratio: 1/1; max-width: 800px; margin: 0 auto;" />
      </template>
    </ClientOnly>
  </UPageHero>
</template>
