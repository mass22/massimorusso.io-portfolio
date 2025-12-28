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

const gridClasses = computed(() => {
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return colsMap[props.columns] || 'grid-cols-1 md:grid-cols-3'
})

const getItemIcon = (item: CardItem): string => {
  if (props.getIcon) return props.getIcon(item)
  return item.icon || 'i-ph-circle'
}

const getItemImage = (item: CardItem): string => {
  if (props.getImage) return props.getImage(item)
  return item.image || 'https://picsum.photos/200'
}

const getItemLink = (item: CardItem): string => {
  if (props.getLink) return props.getLink(item)
  if (item.to) return localePath(item.to)
  if (item.href) return item.href
  if (item.slug) return localePath(`/${item.slug}`)
  return '#'
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
      <UBlogPosts :class="`grid ${gridClasses} gap-8`">
        <Motion
          v-for="(item, index) in items"
          :key="item.slug || item.title || index"
          :initial="{ opacity: 0, transform: 'translateY(20px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <UPageCard
            :title="item.title"
            :description="item.description"
            :icon="getItemIcon(item)"
            orientation="vertical"
            reverse
            :to="getItemLink(item)"
            :aria-label="item.title"
            class="group h-full hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
            :ui="{
              root: 'h-full',
              body: 'flex-1'
            }"
          >
            <template #footer>
              <UButton
                :to="getItemLink(item)"
                variant="link"
                size="sm"
                class="px-0 gap-1 text-primary"
                :label="linkLabelText"
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
                :src="getItemImage(item)"
                :alt="item.imageAlt || item.title"
                width="200"
                height="200"
                loading="lazy"
                format="webp"
                quality="80"
                class="w-full"
              />
              <template #fallback>
                <div class="w-full h-[200px] bg-muted rounded-lg animate-pulse" />
              </template>
            </ClientOnly>
          </UPageCard>
        </Motion>
      </UBlogPosts>
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
    <UBlogPosts :class="`grid ${gridClasses} gap-8`">
      <UPageCard
        v-for="(item, index) in items"
        :key="item.slug || item.title || index"
        :title="item.title"
        :description="item.description"
        :icon="getItemIcon(item)"
        orientation="vertical"
        reverse
        :to="getItemLink(item)"
        :aria-label="item.title"
        class="group h-full hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-out"
        :ui="{
          root: 'h-full',
          body: 'flex-1'
        }"
      >
        <template #footer>
          <UButton
            :to="getItemLink(item)"
            variant="link"
            size="sm"
            class="px-0 gap-1 text-primary"
            label="En savoir plus"
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
            :src="getItemImage(item)"
            :alt="item.imageAlt || item.title"
            width="200"
            height="200"
            loading="lazy"
            format="webp"
            quality="80"
            class="w-full"
          />
          <template #fallback>
            <div class="w-full h-[200px] bg-muted rounded-lg animate-pulse" />
          </template>
        </ClientOnly>
      </UPageCard>
    </UBlogPosts>
  </UPageSection>
</template>

