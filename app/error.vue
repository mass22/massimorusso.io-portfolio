<script setup lang="ts">
import type { NuxtError } from '#app'
import { computed } from 'vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const navLinks = computed(() => getNavLinks(t, localePath, locale))

defineProps({
  error: {
    required: true, type: Object as PropType<NuxtError>
  }
})

useHead({
  htmlAttrs: {
    lang: locale.value
  }
})

useSeoMeta({
  description: t('error.description'), title: t('error.title')
})

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData('navigation', () => {
    return Promise.all([
      queryCollectionNavigation('blog')
    ])
  }, {
    transform: data => data.flat()
  }),
  useLazyAsyncData('search', () => {
    return Promise.all([
      queryCollectionSearchSections('blog')
    ])
  }, {
    server: false,
    transform: data => data.flat()
  })
])
</script>

<template>
  <div>
    <AppHeader :links="navLinks" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="navLinks"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
