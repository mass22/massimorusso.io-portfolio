<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useWindowScroll()
const showButton = computed(() => y.value > 400)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-90"
  >
    <div
      v-if="showButton"
      class="fixed bottom-[25%] right-6 z-50"
    >
      <div class="p-2 bg-default/80 backdrop-blur-sm border border-default/50 rounded-lg shadow-lg">
        <UButton
          icon="i-lucide-arrow-up"
          color="neutral"
          variant="soft"
          size="lg"
          class="rounded-lg"
          :aria-label="$t('backToTop.ariaLabel')"
          @click="scrollToTop"
        />
      </div>
    </div>
  </Transition>
</template>
