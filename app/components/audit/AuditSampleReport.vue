<script setup lang="ts">
const { t } = useI18n()

const issues = computed(() => [
  {
    num: '#1',
    text: t('audit.sample.issue1.text'),
    severity: 'critical' as const,
    label: t('audit.sample.severity.critical')
  },
  {
    num: '#2',
    text: t('audit.sample.issue2.text'),
    severity: 'medium' as const,
    label: t('audit.sample.severity.medium')
  },
  {
    num: '#3',
    text: t('audit.sample.issue3.text'),
    severity: 'low' as const,
    label: t('audit.sample.severity.low')
  }
])

const recommendations = computed(() => [
  t('audit.sample.reco1'),
  t('audit.sample.reco2'),
  t('audit.sample.reco3')
])
</script>

<template>
  <section aria-labelledby="lp-audit-sample-heading">
    <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
      {{ t('audit.sample.eyebrow') }}
    </p>
    <h2
      id="lp-audit-sample-heading"
      class="mb-3 text-balance text-2xl font-bold text-highlighted sm:text-3xl"
    >
      {{ t('audit.sample.title') }}
    </h2>
    <p class="mb-8 text-muted sm:text-lg">
      {{ t('audit.sample.subtitle') }}
    </p>

    <UCard class="overflow-hidden p-0 shadow-sm ring-1 ring-default/40">
      <div class="flex items-center gap-2 border-b border-default bg-elevated px-4 py-3">
        <div class="flex gap-1.5">
          <div
            class="size-3 rounded-full bg-red-400"
            aria-hidden="true"
          />
          <div
            class="size-3 rounded-full bg-yellow-400"
            aria-hidden="true"
          />
          <div
            class="size-3 rounded-full bg-green-400"
            aria-hidden="true"
          />
        </div>
        <span class="ml-2 font-mono text-xs text-muted">
          {{ t('audit.sample.filename') }}
        </span>
      </div>

      <div class="p-6 sm:p-8">
        <div class="mb-8 flex flex-col gap-4 border-b border-default pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
              {{ t('audit.sample.reportLabel') }}
            </p>
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t('audit.sample.reportTitle') }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ t('audit.sample.reportMeta') }}
            </p>
          </div>
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
            class="w-fit shrink-0"
          >
            {{ t('audit.sample.badge') }}
          </UBadge>
        </div>

        <div class="mb-8">
          <p class="mb-4 font-mono text-xs uppercase tracking-wider text-muted">
            {{ t('audit.sample.issuesTitle') }}
          </p>
          <div class="space-y-3">
            <div
              v-for="issue in issues"
              :key="issue.num"
              class="flex gap-3 rounded-lg border border-default bg-elevated/40 p-4"
            >
              <span
                class="mt-0.5 h-fit shrink-0 rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary"
              >
                {{ issue.num }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm leading-relaxed text-default">
                  {{ issue.text }}
                </p>
                <UBadge
                  class="mt-2"
                  :color="issue.severity === 'critical' ? 'error' : issue.severity === 'medium' ? 'warning' : 'success'"
                  variant="subtle"
                  size="xs"
                >
                  {{ issue.label }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <USeparator class="mb-8" />

        <div>
          <p class="mb-4 font-mono text-xs uppercase tracking-wider text-muted">
            {{ t('audit.sample.recoTitle') }}
          </p>
          <ol class="space-y-3">
            <li
              v-for="(reco, i) in recommendations"
              :key="i"
              class="flex gap-3 text-sm leading-relaxed text-muted"
            >
              <span class="mt-0.5 shrink-0 font-mono text-xs text-muted">{{ i + 1 }}.</span>
              <span>{{ reco }}</span>
            </li>
          </ol>
        </div>

        <div class="mt-8 border-t border-default pt-6 text-center">
          <p class="font-mono text-xs text-muted/60">
            {{ t('audit.sample.watermark') }}
          </p>
        </div>
      </div>
    </UCard>
  </section>
</template>
