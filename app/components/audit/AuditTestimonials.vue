<script setup lang="ts">
const { t } = useI18n()

const testimonialKeys = [0, 1] as const

const testimonials = computed(() =>
  testimonialKeys.map(i => ({
    id: String(i),
    quote: t(`audit.testimonials.${i}.quote`),
    author: t(`audit.testimonials.${i}.author`),
    role: t(`audit.testimonials.${i}.role`)
  }))
)
</script>

<template>
  <section aria-labelledby="lp-audit-testimonials-heading">
    <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
      {{ t('audit.testimonials.eyebrow') }}
    </p>
    <h2
      id="lp-audit-testimonials-heading"
      class="mb-8 text-balance text-2xl font-bold text-highlighted sm:text-3xl"
    >
      {{ t('audit.testimonials.title') }}
    </h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UCard
        v-for="item in testimonials"
        :key="item.id"
        class="flex h-full min-h-0 flex-col gap-4 p-6"
      >
        <UIcon
          name="i-lucide-quote"
          class="size-6 shrink-0 text-primary/40"
          aria-hidden="true"
        />
        <p class="text-pretty text-base italic leading-relaxed text-default">
          “{{ item.quote }}”
        </p>
        <div class="mt-auto border-t border-default/40 pt-4">
          <p class="text-sm font-medium text-highlighted">
            {{ item.author }}
          </p>
          <p class="mt-0.5 text-xs text-muted">
            {{ item.role }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
