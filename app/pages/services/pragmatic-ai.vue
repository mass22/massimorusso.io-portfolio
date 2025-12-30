<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceItemsCollectionItem } from '@nuxt/content'

definePageMeta({
  layout: 'service'
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Mapping des slugs par langue
const slugByLocale: Record<string, string> = {
  fr: 'ia-pragmatique',
  en: 'pragmatic-ai'
}

const slug = slugByLocale[locale.value] || slugByLocale.en

const { data: page } = await useAsyncData(
  () => `service-${slug}-${locale.value}`,
  async () => {
    const allServices = await queryCollection('serviceItems').all()
    return allServices.find(service =>
      service.slug === slug && service.locale === locale.value
    ) || allServices.find(service => service.slug === slug) || null
  },
  {
    watch: [locale]
  }
)

// Render markdown content reactively
const htmlContent = computed(() => {
  if (!page.value?.content) return ''
  return markdownToHtml(page.value.content)
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('common.pageNotFound'),
    fatal: true
  })
}

const { global } = useAppConfig()
const siteUrl = useRequestURL().origin

if (page.value?.images && page.value.images.length > 0 && page.value.images[0]?.src) {
  defineOgImage({ url: page.value.images[0].src })
} else if (global.picture?.light) {
  defineOgImage({ url: global.picture.light })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  description,
  ogDescription: description,
  ogTitle: title,
  ogType: 'website',
  ogImage: page.value?.images?.[0]?.src || global.picture?.light,
  title
})

const serviceStructuredData = computed(() => {
  if (!page.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    image: page.value.images?.[0]?.src || [],
    provider: {
      '@type': 'Person',
      name: 'Massimo Russo',
      url: siteUrl,
      email: global.email,
      jobTitle: 'Senior Frontend Consultant'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Worldwide'
    }
  }
})

const breadcrumb = computed(() => [
  {
    label: t('navigation.home'),
    to: localePath('/'),
    icon: 'i-lucide-home'
  },
  {
    label: t('services.hero.title'),
    to: localePath('/services'),
    icon: 'i-lucide-briefcase'
  },
  {
    label: page.value?.title || ''
  }
])

const breadcrumbStructuredData = computed(() => {
  if (!breadcrumb.value || breadcrumb.value.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.value.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `${siteUrl}${item.to}` } : {})
    }))
  }
})

useHead({
  script: [
    ...(serviceStructuredData.value ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(serviceStructuredData.value)
      }
    ] : []),
    ...(breadcrumbStructuredData.value ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbStructuredData.value)
      }
    ] : [])
  ]
})
</script>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.markdown-content :deep(ul) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(a) {
  color: rgb(var(--color-primary-500));
  text-decoration: underline;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
</style>

<template>
  <UPage v-if="page">
    <div class="mb-6">
      <UButton
        :to="localePath('/services')"
        variant="ghost"
        color="neutral"
        size="sm"
        :label="t('blog.back')"
        icon="i-lucide-arrow-left"
        :ui="{
          label: 'text-muted hover:text-default transition-colors'
        }"
      />
    </div>
    <UPageHero
      :title="page.title"
      :description="page.description"
      :ui="{
        title: 'text-3xl md:text-5xl font-bold',
        description: 'mt-6 text-base md:text-xl text-muted'
      }"
    >
      <template #headline>
        <div class="flex items-center gap-2">
          <UIcon
            v-if="page.icon"
            :name="page.icon"
            class="size-6 text-primary"
            aria-hidden="true"
          />
          <span class="text-sm font-medium text-primary">
            {{ t('services.hero.title') }}
          </span>
        </div>
      </template>
    </UPageHero>

    <UPageBody class="max-w-4xl mx-auto">
      <div
        v-if="page.images && page.images.length > 0 && page.images[0]"
        class="mb-8"
      >
        <NuxtImg
          :src="page.images[0]?.src"
          :alt="page.images[0]?.alt || page.title"
          class="rounded-lg w-full h-[400px] object-cover object-center"
          width="1200"
          height="400"
          loading="eager"
          format="webp"
          quality="85"
        />
      </div>

      <div
        v-if="htmlContent"
        class="markdown-content prose prose-neutral dark:prose-invert max-w-none"
        v-html="htmlContent"
      />
    </UPageBody>

    <ServicesCTADefault />
  </UPage>
</template>

