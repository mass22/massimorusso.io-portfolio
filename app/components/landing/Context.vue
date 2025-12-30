<script setup lang="ts">
const { t } = useI18n()

const lines = computed(() => [
  t('context.lines.1'),
  t('context.lines.2'),
  t('context.lines.3'),
  t('context.lines.4'),
  t('context.lines.5'),
  t('context.lines.6'),
  t('context.lines.7')
])
</script>

<template>
  <UContainer class="py-12 sm:py-24">
    <div class="mx-auto max-w-5xl">
      <div class="relative px-8 sm:px-12">
        <!-- Vertical accent -->
        <div
          class="absolute left-0 top-0 h-full w-px bg-primary/30"
          aria-hidden="true"
        />

        <!-- Quote content -->
        <div class="space-y-3 text-center">
          <p
            v-for="(line, index) in lines"
            :key="index"
            class="text-lg sm:text-xl leading-relaxed text-highlighted"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
