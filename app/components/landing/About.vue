<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

defineProps<{
  page: IndexCollectionItem
}>()
</script>

<template>
  <Motion
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="page.about.title"
      :description="page.about.description"
      :ui="{
        container: '!p-0',
        title: 'text-left text-lg sm:text-xl lg:text-xl font-normal text-muted',
        description: 'text-left mt-2 text-sm sm:text-sm lg:text-sm text-muted leading-relaxed'
      }"
    />
  </Motion>
</template>

<style scoped>

</style>
