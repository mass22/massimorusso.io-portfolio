<script setup lang="ts">
import { computed } from 'vue'

type CardItem = {
  slug?: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  icon?: string
  to?: string
  href?: string
}

type Props = {
  items: CardItem[]
  title?: string
  description?: string
  columns?: 1 | 2 | 3 | 4
  getIcon?: (item: CardItem) => string
  getImage?: (item: CardItem) => string
  getLink?: (item: CardItem) => string
  linkLabel?: string
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  withAnimation: true
})

const { t } = useI18n()
const localePath = useLocalePath()

const linkLabelText = computed(() => props.linkLabel || t('services.cta.learnMore'))

const getItemIcon = (item: CardItem): string => {
  if (props.getIcon) return props.getIcon(item)
  return item.icon || 'i-ph-circle'
}

const getItemImage = (item: CardItem): string => {
  if (props.getImage) return props.getImage(item)
  return item.image || ''
}

const isWebPImage = (imagePath: string): boolean => {
  return imagePath?.endsWith('.webp') ?? false
}

const getItemLink = (item: CardItem): string => {
  if (props.getLink) return props.getLink(item)
  if (item.to) return localePath(item.to)
  if (item.href) return item.href
  if (item.slug) return localePath(`/${item.slug}`)
  return '#'
}

const isLinkDisabled = (link: string): boolean => {
  return link === '#'
}
</script>

<template>
  <Motion
    v-if="items?.length && withAnimation"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="title"
      :description="description"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12'
      }"
    >
      <div class="flex flex-col gap-6 md:gap-8">
        <Motion
          v-for="(item, index) in items"
          :key="item.slug || item.title || index"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <component
            :is="isLinkDisabled(getItemLink(item)) ? 'div' : 'NuxtLink'"
            :to="isLinkDisabled(getItemLink(item)) ? undefined : getItemLink(item)"
            :aria-label="item.title"
            :class="[
              'group relative block rounded-2xl border border-default/20 bg-elevated/50 dark:bg-elevated/30 backdrop-blur-sm',
              'px-8 py-8 md:px-10 md:py-10',
              'transition-all duration-500 ease-out overflow-hidden',
              isLinkDisabled(getItemLink(item))
                ? 'cursor-default'
                : 'cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background'
            ]"
          >
            <!-- Right: Image Preview (Desktop only, hover reveal) - Positioned relative to parent -->
            <div
              v-if="getItemImage(item)"
              class="hidden md:block absolute right-0 top-0 bottom-0 w-[400px] opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-700 ease-out pointer-events-none z-0"
              style="clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%);"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent z-10" />
              <div class="absolute inset-0 image-blur">
                <!-- Utiliser <img> pour les fichiers WebP statiques déjà optimisés -->
                <img
                  v-if="isWebPImage(getItemImage(item))"
                  :src="getItemImage(item)"
                  :alt="item.imageAlt || item.title"
                  width="400"
                  height="400"
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
                <!-- Utiliser NuxtImg pour les autres images qui nécessitent traitement -->
                <ClientOnly v-else>
                  <NuxtImg
                    :src="getItemImage(item)"
                    :alt="item.imageAlt || item.title"
                    width="400"
                    height="400"
                    loading="lazy"
                    format="webp"
                    quality="85"
                    class="w-full h-full object-cover"
                  />
                  <template #fallback>
                    <div class="w-full h-full bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50" />
                  </template>
                </ClientOnly>
              </div>
            </div>

            <!-- Placeholder gradient si pas d'image -->
            <div
              v-else
              class="hidden md:block absolute right-0 top-0 bottom-0 w-[400px] opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-700 ease-out pointer-events-none z-0"
              style="clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%);"
            >
              <div class="w-full h-full bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50" />
            </div>

            <div class="relative flex flex-col md:flex-row items-stretch min-h-[200px] z-10">
              <!-- Left: Content -->
              <div class="flex flex-col gap-4 md:max-w-[calc(100%-400px)]">
                <!-- Icon Badge -->
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 mb-2 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300">
                  <UIcon
                    :name="getItemIcon(item)"
                    class="size-6 text-primary"
                    aria-hidden="true"
                  />
                </div>

                <!-- Title -->
                <h3 class="text-xl md:text-2xl font-bold text-highlighted leading-tight group-hover:text-primary transition-colors duration-300">
                  {{ item.title }}
                </h3>

                <!-- Description -->
                <p class="text-base text-muted leading-relaxed line-clamp-3 mt-2">
                  {{ item.description }}
                </p>

                <!-- CTA Link -->
                <div class="mt-4">
                  <NuxtLink
                    v-if="!isLinkDisabled(getItemLink(item))"
                    :to="getItemLink(item)"
                    class="inline-flex items-center gap-2 text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors duration-300 hover:underline"
                    @click.stop
                  >
                    {{ linkLabelText }}
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="size-4 transition-all duration-300 ease-out opacity-70 group-hover:translate-x-1 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </NuxtLink>
                  <span
                    v-else
                    class="inline-flex items-center gap-2 text-sm font-semibold text-primary/80 cursor-default opacity-50"
                  >
                    {{ linkLabelText }}
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="size-4 opacity-0"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </div>

            <!-- Decorative accent line -->
            <div
              v-if="!isLinkDisabled(getItemLink(item))"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 rounded-b-2xl"
            />
          </component>
        </Motion>
      </div>
    </UPageSection>
  </Motion>
  <UPageSection
    v-else
    :title="title"
    :description="description"
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12'
    }"
  >
    <div class="flex flex-col gap-6 md:gap-8">
      <component
        v-for="(item, index) in items"
        :key="item.slug || item.title || index"
        :is="isLinkDisabled(getItemLink(item)) ? 'div' : 'NuxtLink'"
        :to="isLinkDisabled(getItemLink(item)) ? undefined : getItemLink(item)"
        :aria-label="item.title"
        :class="[
          'group relative block rounded-2xl border border-default/20 bg-elevated/50 dark:bg-elevated/30 backdrop-blur-sm',
          'px-8 py-8 md:px-10 md:py-10',
          'transition-all duration-500 ease-out overflow-hidden',
          isLinkDisabled(getItemLink(item))
            ? 'cursor-default'
            : 'cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background'
        ]"
      >
        <!-- Right: Image Preview (Desktop only, hover reveal) - Positioned relative to parent -->
        <div
          v-if="getItemImage(item)"
          class="hidden md:block absolute right-0 top-0 bottom-0 w-[400px] opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-700 ease-out pointer-events-none z-0"
          style="clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%);"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent z-10" />
          <div class="absolute inset-0 image-blur">
            <!-- Utiliser <img> pour les fichiers WebP statiques déjà optimisés -->
            <img
              v-if="isWebPImage(getItemImage(item))"
              :src="getItemImage(item)"
              :alt="item.imageAlt || item.title"
              width="400"
              height="400"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <!-- Utiliser NuxtImg pour les autres images qui nécessitent traitement -->
            <ClientOnly v-else>
              <NuxtImg
                :src="getItemImage(item)"
                :alt="item.imageAlt || item.title"
                width="400"
                height="400"
                loading="lazy"
                format="webp"
                quality="85"
                class="w-full h-full object-cover"
              />
              <template #fallback>
                <div class="w-full h-full bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50" />
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Placeholder gradient si pas d'image -->
        <div
          v-else
          class="hidden md:block absolute right-0 top-0 bottom-0 w-[400px] opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-700 ease-out pointer-events-none z-0"
          style="clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%);"
        >
          <div class="w-full h-full bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50" />
        </div>

        <div class="relative flex flex-col md:flex-row items-stretch min-h-[200px] z-10">
          <!-- Left: Content -->
          <div class="flex flex-col gap-4 md:max-w-[calc(100%-400px)]">
            <!-- Icon Badge -->
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 mb-2 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300">
              <UIcon
                :name="getItemIcon(item)"
                class="size-6 text-primary"
                aria-hidden="true"
              />
            </div>

            <!-- Title -->
            <h3 class="text-xl md:text-2xl font-bold text-highlighted leading-tight group-hover:text-primary transition-colors duration-300">
              {{ item.title }}
            </h3>

            <!-- Description -->
            <p class="text-base text-muted leading-relaxed line-clamp-3 mt-2">
              {{ item.description }}
            </p>

            <!-- CTA Link -->
            <div class="mt-4">
              <NuxtLink
                v-if="!isLinkDisabled(getItemLink(item))"
                :to="getItemLink(item)"
                class="inline-flex items-center gap-2 text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors duration-300 hover:underline"
                @click.stop
              >
                {{ linkLabelText }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 transition-all duration-300 ease-out opacity-70 group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </NuxtLink>
              <span
                v-else
                class="inline-flex items-center gap-2 text-sm font-semibold text-primary/80 cursor-default opacity-50"
              >
                {{ linkLabelText }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 opacity-0"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>

        <!-- Decorative accent line -->
        <div
          v-if="!isLinkDisabled(getItemLink(item))"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 rounded-b-2xl"
        />
      </component>
    </div>
  </UPageSection>
</template>

<style scoped>
.image-blur {
  filter: blur(20px);
  transition: filter 700ms ease-out;
}
.group:hover .image-blur,
.group:focus-within .image-blur {
  filter: blur(0);
}
</style>

