<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

type EngagementPattern = {
  title: string
  description: string
}

type Company = {
  name: string
  logo?: string
  url?: string
  description?: string
}

type CompaniesSection = {
  title?: string
  description?: string
  companies?: Company[]
  patterns?: EngagementPattern[]
}

const { t } = useI18n()

defineProps<{
  page: IndexCollectionItem & { companies?: CompaniesSection }
}>()
</script>

<template>
  <Motion
    v-if="page?.companies?.companies && page.companies.companies.length > 0"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="page.companies?.title || t('homepage.companies.title')"
      :description="page.companies?.description"
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20',
        title: 'text-left text-2xl sm:text-3xl lg:text-4xl font-bold text-highlighted',
        description: 'text-left mt-3 text-base sm:text-lg text-muted max-w-3xl'
      }"
    >
      <div
        v-if="page.companies?.patterns && page.companies.patterns.length > 0"
        class="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div
          v-for="(item, i) in page.companies.patterns"
          :key="`${item.title}-${i}`"
          class="rounded-xl border border-default/20 bg-elevated/30 px-5 py-4"
        >
          <div class="text-sm font-semibold text-highlighted">
            {{ item.title }}
          </div>
          <div class="mt-1 text-sm text-muted leading-relaxed">
            {{ item.description }}
          </div>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Motion
          v-for="(company, index) in page.companies.companies"
          :key="index"
          :initial="{ opacity: 0, scale: 0.9 }"
          :while-in-view="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.1 * index, duration: 0.5 }"
          :in-view-options="{ once: true, margin: '-50px' }"
        >
          <ULink
            v-if="company.url"
            :to="company.url"
            target="_blank"
            :aria-label="`${company.name} - ${t('homepage.companies.visit')}`"
            class="group h-full rounded-xl border border-default/20 bg-elevated/30 px-5 py-4 transition-all duration-300 ease-out hover:border-primary/20 hover:bg-elevated/50"
          >
            <div
              v-if="company.logo"
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted/40"
            >
              <UIcon
                :name="company.logo"
                class="size-5 text-muted group-hover:text-primary transition-colors duration-300"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="company.name"
              class="text-sm font-semibold text-highlighted transition-colors duration-300"
            >
              {{ company.name }}
            </div>
            <div
              v-if="company.description"
              class="mt-1 text-sm leading-relaxed text-muted"
            >
              {{ company.description }}
            </div>
          </ULink>
          <div
            v-else
            class="group h-full rounded-xl border border-default/20 bg-muted/40 px-5 py-4 flex flex-col items-center"
          >
            <div
              v-if="company.logo"
              class="mb-4 flex h-10 items-center justify-center rounded-md"
            >
              <UIcon
                :name="company.logo"
                class="size-12 text-muted"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="company.name"
              class="text-sm font-semibold text-highlighted"
            >
              {{ company.name }}
            </div>
            <div
              v-if="company.description"
              class="mt-1 text-sm leading-relaxed text-muted text-center"
            >
              {{ company.description }}
            </div>
          </div>
        </Motion>
      </div>
    </UPageSection>
  </Motion>
</template>
