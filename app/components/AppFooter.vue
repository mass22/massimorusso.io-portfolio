<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const { footer: footerConfig } = useAppConfig()

const { t } = useI18n()
// Utiliser une valeur constante pour éviter les problèmes d'hydratation
const currentYear = new Date().getFullYear()

const isAdminAuthenticated = ref(false)

const route = useRoute()

const loadAdminAuth = async () => {
  try {
    const res = await $fetch<{ authenticated: boolean }>('/api/admin/session', {
      credentials: 'include'
    })
    isAdminAuthenticated.value = Boolean(res?.authenticated)
  } catch {
    isAdminAuthenticated.value = false
  }
}

onMounted(loadAdminAuth)

watch(
  () => route.fullPath,
  () => {
    void loadAdminAuth()
  }
)

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
      <UButton
        v-if="isAdminAuthenticated"
        to="/admin/logout"
        size="md"
        color="neutral"
        variant="ghost"
        icon="i-lucide-log-out"
      >
        Logout
      </UButton>

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
