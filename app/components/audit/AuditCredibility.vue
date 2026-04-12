<script setup lang="ts">
const { t } = useI18n()
const { global } = useAppConfig()
</script>

<template>
  <section aria-labelledby="lp-audit-cred-heading">
    <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
      <div class="flex justify-center md:justify-start">
        <NuxtImg
          provider="none"
          :src="global.picture?.light || '/hero/photo.webp'"
          :alt="t('global.picture.alt')"
          width="400"
          height="480"
          class="w-full max-w-sm rounded-2xl object-cover shadow-sm ring-1 ring-default md:max-w-full"
        />
      </div>

      <div>
        <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
          {{ t('audit.cred.eyebrow') }}
        </p>
        <h2
          id="lp-audit-cred-heading"
          class="mb-6 text-balance text-2xl font-bold text-highlighted sm:text-3xl"
        >
          {{ t('audit.cred.title') }}
        </h2>

        <div class="space-y-4 text-base leading-relaxed text-foreground/80">
          <p>{{ t('audit.cred.p1') }}</p>
          <p>{{ t('audit.cred.p2') }}</p>
          <p class="font-medium text-foreground">
            {{ t('audit.cred.p3') }}
          </p>
          <p>{{ t('audit.cred.p4') }}</p>
        </div>

        <div
          class="mt-6 inline-flex max-w-md items-start gap-3 rounded-lg border border-default px-4 py-3 text-sm text-muted"
        >
          <UIcon
            name="i-lucide-layers"
            class="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{{ t('audit.cred.badge') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
