<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
const { footer } = useAppConfig()

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = ref(false);
const slideoverOpen = ref(false);
const isReady = ref(false); // Hydratation client

onMounted(() => {
  isReady.value = true;
  // Utilisation de watchEffect pour le breakpoint mobile
  watchEffect(() => {
    isMobile.value = breakpoints.smaller('md').value
  })
  // Fermeture du menu mobile dès la navigation (au changement de page)
  const router = useRouter();
  router.afterEach(() => {
    slideoverOpen.value = false;
  });
});

defineProps<{ links: NavigationMenuItem[] }>();
</script>

<template>
  <!-- Affichage protégé SSR pour éviter le flash -->
  <ClientOnly>
    <div v-if="isReady" class="flex justify-end-safe">
      <!-- Menu desktop : affiché uniquement si non mobile -->
      <UNavigationMenu
        v-if="!isMobile"
        :items="links"
        variant="link"
        color="neutral"
        :ui="{
          link: 'px-2 py-1 text-lg',
          linkLeadingIcon: 'hidden',
        }"
      >
        <template #list-trailing>
          <ColorModeButton />
        </template>
      </UNavigationMenu>

      <!-- Bouton menu mobile et slideover -->
      <UButton
        v-if="isMobile"
        icon="i-lucide-menu"
        color="neutral"
        variant="subtle"
        @click="slideoverOpen = true"
        class="ml-2"
      />
      <USlideover v-model:open="slideoverOpen" side="right" close>
        <template #body>
          <UNavigationMenu
            :items="links"
            orientation="vertical"
            variant="link"
            color="neutral"
            :ui="{ link: 'px-2 py-1 text-lg', linkLeadingIcon: 'hidden' }"
          />
        </template>
        <template #footer>
          <template v-if="footer?.links">
            <UButton
              v-for="(link, index) of footer?.links"
              :key="index"
              v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
            />
            <ColorModeButton />
          </template>
        </template>
      </USlideover>
    </div>
  </ClientOnly>
</template>
