<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const navLinks = computed<NavigationMenuItem[]>(() => getNavLinks(t, localePath, locale))
</script>

<template>
  <div>
    <UContainer class="sm:border-x border-default pt-10">
      <AppHeader
        :links="navLinks"
        no-lang-switcher
      />
      <slot />
      <AppFooter />
    </UContainer>
    <BackToTop />
  </div>
</template>
