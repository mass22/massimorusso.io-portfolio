<script setup lang="ts">
type Props = {
  content: string
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withAnimation: true
})
</script>

<template>
  <Motion
    v-if="withAnimation"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12'
      }"
    >
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <MDC :value="content" />
      </div>
    </UPageSection>
  </Motion>
  <UPageSection
    v-else
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 gap-8 sm:gap-12'
    }"
  >
    <div class="prose prose-lg dark:prose-invert max-w-none">
      <MDC :value="content" />
    </div>
  </UPageSection>
</template>

