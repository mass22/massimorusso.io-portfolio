<script setup lang="ts">
const { t, locale } = useI18n()

const { data: page } = await useAsyncData(`about-${locale.value}`, async () => {
  const allPages = await queryCollection('about').all()
  const found = allPages.find((p: any) => p.locale === locale.value)
  return found || allPages.find((p: any) => p.locale === 'fr') || null
})

if (!page.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t('common.pageNotFound')
  })
}

const { global } = useAppConfig()

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      orientation="horizontal"
      :ui="{
        container: 'lg:flex sm:flex-row items-center',
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <UColorModeAvatar
        class="sm:rotate-0 size-36 rounded-lg ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
        :light="global.picture?.light!"
        :dark="global.picture?.dark!"
        :alt="t(global.picture?.altKey ?? 'global.picture.alt')"
      />
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <div class="prose prose-neutral dark:prose-invert max-w-none">
        <MDC v-if="page.content" :value="page.content" />
      </div>
    </UPageSection>
  </UPage>
</template>

