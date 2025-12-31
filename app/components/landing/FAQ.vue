<script setup lang="ts">
import { computed } from 'vue'
import type { IndexCollectionItem } from '@nuxt/content'
import type { FAQ } from '~/types/content'
import { markdownToHtml } from '~/utils/markdown'

const props = defineProps<{
  page: IndexCollectionItem & { faq?: FAQ }
}>()

// Helper pour convertir le contenu markdown en HTML
const renderMarkdown = (content: string) => {
  if (!content) return ''
  return markdownToHtml(content)
}

const items = computed(() => {
  if (!props.page?.faq?.categories) {
    return []
  }
  return props.page.faq.categories.map((faq) => {
    return {
      label: faq.title,
      questions: faq.questions.map(q => ({
        label: q.label,
        content: q.content
      }))
    }
  })
})

const ui = {
  indicator: 'absolute top-[4px] duration-200 ease-out focus:outline-none rounded-lg bg-elevated/60', label: 'truncate', list: 'relative flex bg-transparent dark:bg-transparent gap-2 px-0', root: 'flex items-center gap-4 w-full', trigger: 'px-3 py-2 rounded-lg hover:bg-muted/50 data-[state=active]:text-highlighted data-[state=inactive]:text-muted'
}
</script>

<template>
  <Motion
    v-if="page?.faq"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
      :ui="{
        container: 'px-0 !pt-0 gap-4 sm:gap-4',
        title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
        description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
      }"
    >
      <UTabs
        v-if="items.length > 0"
        :items
        orientation="horizontal"
        :unmount-on-hide="false"
        :ui
      >
        <template #content="{ item: tabItem }">
          <UAccordion
            v-if="tabItem?.questions && tabItem.questions.length > 0"
            trailing-icon="lucide:plus"
            :items="tabItem.questions"
            :unmount-on-hide="false"
            :ui="{
              item: 'border-none',
              trigger: 'mb-2 border-0 group px-4 transform-gpu rounded-lg bg-elevated/60 will-change-transform hover:bg-muted/50 text-base',
              trailingIcon: 'group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-135 text-base text-muted',
              body: 'px-4 text-sm text-muted'
            }"
          >
            <template #body="{ item: accordionItem }">
              <div
                v-if="accordionItem?.content"
                class="prose prose-sm dark:prose-invert max-w-none"
                v-html="renderMarkdown(accordionItem.content)"
              />
            </template>
          </UAccordion>
        </template>
      </UTabs>
    </UPageSection>
  </Motion>
</template>
