<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'
import { useScroll } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

definePageMeta({
  layout: 'blog'
})

const route = useRoute()
const { t, locale, defaultLocale } = useI18n()
const localePath = useLocalePath()

const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug as string

const buildPathForLocale = (targetLocale: string) => {
  if (!targetLocale || targetLocale === 'fr') {
    return `/blog/${slug}`
  }
  return `/${targetLocale}/blog/${slug}`
}

const matchPost = (post: any, targetLocale?: string) => {
  if (!post) {
    return false
  }
  if (targetLocale && post.locale !== targetLocale) {
    return false
  }
  return post.slug === slug || post.path?.endsWith(`/${slug}`) || post.path?.includes(`/${slug}`)
}

const { data: page } = await useAsyncData(`blog-${locale.value}-${slug}`, async () => {
  const allPosts = await queryCollection('blog').all()

  const pathMatch = await queryCollection('blog')
    .path(buildPathForLocale(locale.value))
    .first()
  if (pathMatch && matchPost(pathMatch, locale.value)) {
    return pathMatch
  }

  const currentLocaleMatch = allPosts.find(post => matchPost(post, locale.value))
  if (currentLocaleMatch) {
    return currentLocaleMatch
  }

  const fallbackLocaleCode = defaultLocale.value || 'fr'
  const defaultLocaleMatch = allPosts.find(post => matchPost(post, fallbackLocaleCode))
  if (defaultLocaleMatch) {
    return defaultLocaleMatch
  }

  return allPosts.find(post => matchPost(post)) || null
})

if (!page.value) throw createError({ statusCode: 404, statusMessage: t('common.pageNotFound'), fatal: true })
const { data: surround } = await useAsyncData(`${route.path}-surround-${locale.value}`, async () => {
  if (!page.value) return undefined
  const items = await queryCollectionItemSurroundings('blog', page.value.path, {
    fields: ['description']
  })
  if (!items) return undefined
  return items.filter((item: any) => item?.locale === locale.value)
})

const navigation = inject<Ref<ContentNavigationItem[] | null>>('navigation', ref([]))
const blogNavigation = computed(() => navigation.value?.find(item => item.path === '/blog')?.children || [])

const breadcrumb = computed(() => {
  const breadcrumbResult = findPageBreadcrumb(blogNavigation?.value, page.value?.path)
  if (!breadcrumbResult) return []
  return mapContentNavigation(breadcrumbResult).map(({ icon, ...link }) => link)
})

if (page.value.image) {
  defineOgImage({ url: page.value.image })
} else {
  defineOgImageComponent('Blog', {
    headline: breadcrumb.value.map(item => item.label).join(' > ')
  }, {
    fonts: ['Geist:400', 'Geist:600']
  })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  description,
  ogDescription: description,
  ogTitle: title
})

const articleLink = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const scrollEl = ref<HTMLElement | Window>()
const isClient = typeof window !== 'undefined'
const pageHeight = ref(0)

onMounted(() => {
  if (isClient) {
    scrollEl.value = window
    const updateHeight = () => {
      pageHeight.value = document.documentElement.scrollHeight - window.innerHeight
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
  }
})

const { y } = useScroll(scrollEl)
const scrollPercent = computed(() => (pageHeight.value > 0 ? (y.value / pageHeight.value) * 100 : 0))
</script>

<template>
  <div>
    <div
      style="position: fixed; left: 0; top: 0; height: 4px; background: #00b894; z-index: 10004; transition: width 0.15s;"
      :style="{ width: scrollPercent + '%' }"
    ></div>
    <UMain class="mt-20 px-2">
      <UContainer class="relative min-h-screen">
        <UPage v-if="page">
          <ULink
            :to="localePath('/blog')"
            class="text-sm flex items-center gap-1"
          >
            <UIcon name="lucide:chevron-left" />
            {{ t('blog.title') }}
          </ULink>
          <div class="flex flex-col gap-3 mt-8">
            <div class="flex text-xs text-muted items-center justify-center gap-2">
              <span v-if="page.date">
                {{ formatDate(page.date) }}
              </span>
              <span v-if="page.date && page.minRead">
                -
              </span>
              <span v-if="page.minRead">
                {{ page.minRead }} {{ t('blog.minRead') }}
              </span>
            </div>
            <NuxtImg
              :src="page.image"
              :alt="page.title"
              class="rounded-lg w-full h-[300px] object-cover object-center"
            />
            <h1 class="text-4xl text-center font-medium max-w-3xl mx-auto mt-4">
              {{ page.title }}
            </h1>
            <p class="text-muted text-center max-w-2xl mx-auto">
              {{ page.description }}
            </p>
            <div class="flex items-center justify-center gap-2 mt-2">
              <UUser
                orientation="vertical"
                color="neutral"
                variant="outline"
                class="justify-center items-center text-center"
                v-if="page.author"
                v-bind="page.author"
              />
            </div>
          </div>
          <UPageBody class="max-w-3xl mx-auto">
            <ContentRenderer
              v-if="page.body"
              :value="page"
            />

            <div class="flex items-center justify-end gap-2 text-sm text-muted">
              <UButton
                size="sm"
                variant="link"
                color="neutral"
                :label="t('blog.copyLink')"
                @click="copyToClipboard(articleLink, t('blog.linkCopied'))"
              />
            </div>
            <UContentSurround v-if="surround" :surround="surround" />
          </UPageBody>
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
