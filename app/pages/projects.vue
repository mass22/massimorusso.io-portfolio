<script setup lang="ts">
const { t, locale } = useI18n()

if (process.env.NODE_ENV === 'production') {
  throw createError({ message: t('common.pageNotFound'), statusCode: 404 })
}

const { data: page } = await useAsyncData(`projects-page-${locale.value}`, async () => {
  const allPages = await queryCollection('pages').all()
  const projectsPage = allPages.find((p: any) =>
    p.path === '/projects' || p.path === '/en/projects' ||
    (p.path?.includes('projects') && p.locale === locale.value)
  )
  if (projectsPage && projectsPage.locale === locale.value) {
    return projectsPage
  }
  const fallback = allPages.find((p: any) =>
    (p.path === '/projects' || p.path?.includes('projects')) && p.locale === 'fr'
  )
  return fallback || null
})
if (!page.value) {
  throw createError({
    fatal: true, statusCode: 404, statusMessage: t('common.pageNotFound')
  })
}

const { data: projects } = await useAsyncData('projects', () => {
  return queryCollection('projects').all()
})

const { global } = useAppConfig()

useSeoMeta({
  description: page.value?.seo?.description || page.value?.description, ogDescription: page.value?.seo?.description || page.value?.description, ogTitle: page.value?.seo?.title || page.value?.title, title: page.value?.seo?.title || page.value?.title
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <template #links>
        <div
          v-if="page.links"
          class="flex items-center gap-2"
        >
          <UButton
            :label="page.links[0]?.label"
            :to="global.meetingLink"
            v-bind="page.links[0]"
          />
          <UButton
            :to="`mailto:${global.email}`"
            v-bind="page.links[1]"
            :aria-label="page.links[1]?.label || t('contact.hero.cta.contact')"
          />
        </div>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <Motion
        v-for="(project, index) in projects"
        :key="project.title"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.2 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :description="project.description"
          :to="project.url"
          :aria-label="project.title"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last'
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>
          <template #footer>
            <ULink
              :to="project.url"
              class="text-sm text-primary flex items-center"
            >
              {{ t('projects.viewProject') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                aria-hidden="true"
              />
            </ULink>
          </template>
          <NuxtImg
            :src="project.image"
            :alt="project.title"
            width="800"
            height="400"
            loading="lazy"
            format="webp"
            quality="80"
            class="object-cover w-full h-48 rounded-lg"
          />
        </UPageCard>
      </Motion>
    </UPageSection>
  </UPage>
</template>
