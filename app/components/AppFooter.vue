<script setup lang="ts">
import { computed } from 'vue'

const { footer: footerConfig } = useAppConfig()

const { t } = useI18n()
// Utiliser une valeur constante pour éviter les problèmes d'hydratation
const currentYear = 2025

// Mapper les liens du footer avec leurs aria-labels pour l'accessibilité
const footerLinksWithLabels = computed(() => footerConfig?.links?.map(link => ({
  ...link,
  'aria-label': link.ariaLabelKey ? t(link.ariaLabelKey) : (link as any).label
})) ?? [])
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-muted text-xs', center: 'text-muted text-xs' }"
  >
    <template #left>
      {{ t("footer.credits", { year: currentYear }) }}
    </template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span
      class="footer-license"
      v-html="t('footer.license')"
    />

    <template #right>
      <template v-if="footerLinksWithLabels.length > 0">
        <UButton
          v-for="(link, index) of footerLinksWithLabels"
          :key="index"
          v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
        >
          <template
            v-if="link.icon"
            #leading
          >
            <UIcon
              :name="link.icon"
              aria-hidden="true"
            />
          </template>
        </UButton>
      </template>
    </template>
  </UFooter>
</template>
