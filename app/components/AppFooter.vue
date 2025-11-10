<script setup lang="ts">
const { footer: footerConfig } = useAppConfig()

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-muted text-xs', center: 'text-muted text-xs' }"
  >
    <template #left>
      {{ t("footer.credits", { year: currentYear }) }}
    </template>

    <span class="footer-license" v-html="t('footer.license')" />

    <template #right>
      <template v-if="footerConfig?.links">
        <UButton
          v-for="(link, index) of footerConfig?.links"
          :key="index"
          v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>