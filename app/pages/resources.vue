<script setup lang="ts">
import type { RessourcesCollectionItem } from '@nuxt/content'

const { t, locale } = useI18n()

// Rediriger vers /ressources si on est en français
if (locale.value === 'fr') {
  await navigateTo('/ressources', { redirectCode: 301 })
}

const { data: page } = await useAsyncData(`ressources-${locale.value}`, async () => {
  const allPages = await queryCollection('ressources').all()
  const found = allPages.find(p => p.locale === locale.value)
  return found || allPages.find(p => p.locale === 'fr') || null
})

if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

useSeoMeta({
  description: page.value?.description ?? '', title: page.value?.title ?? t('ressources.title')
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{ container: 'pb-0' }"
    />
    <UPageSection :ui="{ container: 'grid grid-cols-1 md:grid-cols-3 gap-6 py-12' }">
      <UCard
        v-for="(r, i) in page.ressources"
        :key="i"
        class="flex flex-col justify-between"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="r.icon" size="24" />
            <span class="font-bold text-primary">{{ r.title }}</span>
          </div>
        </template>
        <div class="grow text-muted-foreground mb-4">{{ r.description }}</div>
        <template #footer>
          <UButton
            :to="r.url"
            :target="r.download?.target"
            :icon="r.download?.icon"
            :label="r.download?.label"
            :color="r.download?.color"
            :variant="r.download?.variant"
            block
          />
        </template>
      </UCard>
    </UPageSection>
  </UPage>
  <template v-else>
    <div class="text-muted text-center py-16">{{ t('ressources.noneAvailable') }}</div>
  </template>
</template>

