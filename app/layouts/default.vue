<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { useWindowScroll } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const navLinks = computed<NavigationMenuItem[]>(() => getNavLinks(t, localePath, locale))

// Détecter si le StickyCTA est visible pour ajouter du padding conditionnel
const isContactPage = computed(() => route.path.includes('/contact'))
const isLeadPage = computed(() => route.path.startsWith('/lead/'))
const isClient = typeof window !== 'undefined'
const { y } = isClient ? useWindowScroll() : { y: ref(0) }
const showStickyCTA = computed(() => isClient && y.value > 300 && !isContactPage.value && !isLeadPage.value)
</script>

<template>
  <div>
    <!-- Lien "Skip to main content" pour l'accessibilité -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-[#008B5A] focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      {{ t('accessibility.skipToContent') }}
    </a>
    <UContainer :class="['sm:border-x border-default pt-10', { 'pb-24 sm:pb-28': showStickyCTA }]">
      <AppHeader :links="navLinks" />
      <main
        id="main-content"
        tabindex="-1"
      >
        <slot />
      </main>
      <AppFooter />
    </UContainer>
    <StickyCTA v-if="!isLeadPage" />
    <BackToTop />
    <SpeedInsights />
  </div>
</template>
