<template>
  <div>
    <!-- Overlay foncé avec "lampe poursuite" -->
    <div
      v-if="isHoveringInteractive"
      class="custom-cursor-spotlight"
      :style="spotlightStyle"
    />
    <!-- Le point du curseur -->
    <div
      ref="cursor"
      class="custom-cursor"
      :style="cursorStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// useMouse: coordonnées relatives à la fenêtre (viewport)
const { x, y } = useMouse({ touch: false })
const scrollX = ref(typeof window !== 'undefined' ? window.scrollX : 0)
const scrollY = ref(typeof window !== 'undefined' ? window.scrollY : 0)

function updateScroll() {
  if (typeof window !== 'undefined') {
    scrollX.value = window.scrollX
    scrollY.value = window.scrollY
  }
}

// Suit la scroll position en live
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', updateScroll, { passive: true })
  }
})
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateScroll)
  }
})

const sizeNormal = 30
const sizeHover = 40
const sizeClick = 22
const spotlightRadius = 88

const isHoveringInteractive = ref(false)
const isClicking = ref(false)

const cursorStyle = computed(() => {
  let size = sizeNormal
  if (isHoveringInteractive.value) {
    size = sizeHover
  }
  if (isClicking.value) {
    size = sizeClick
  }
  if (isClicking.value && isHoveringInteractive.value) {
    size = sizeClick
  }
  return {
    // Position du point : coordonnées souris + scroll
    height: size + 'px',
    transform: `translate3d(${x.value + scrollX.value - size / 2}px, ${y.value + scrollY.value - size / 2}px, 0)`,
    width: size + 'px'
  }
})

// Lampe poursuite : coordonnées souris + scroll
const spotlightStyle = computed(() => {
  const left = x.value + scrollX.value - spotlightRadius
  const top = y.value + scrollY.value - spotlightRadius
  return {
    height: `${spotlightRadius * 2}px`,
    left: `${left}px`,
    top: `${top}px`,
    width: `${spotlightRadius * 2}px`
  }
})

const isInteractive = (el: HTMLElement | null) => {
  if (!el) {
    return false
  }
  const t = el.tagName?.toLowerCase()
  if (t === 'a' || t === 'button' || t === 'input' || t === 'textarea' || el.hasAttribute('tabindex')) {
    return true
  }
  if (el.getAttribute && [
    'button', 'link', 'checkbox', 'radio', 'switch', 'tab']
    .includes(el.getAttribute('role') || '')) {
    return true
  }
  return false
}

function mouseOverHandler(e: MouseEvent) {
  let el: HTMLElement | null = e.target as HTMLElement
  while (el && el !== document.body) {
    if (isInteractive(el)) {
      isHoveringInteractive.value = true
      return
    }
    el = el.parentElement
  }
  isHoveringInteractive.value = false
}

function mouseOutHandler(e: MouseEvent) {
  let el: HTMLElement | null = e.relatedTarget as HTMLElement
  while (el && el !== document.body) {
    if (isInteractive(el)) {
      isHoveringInteractive.value = true
      return
    }
    el = el.parentElement
  }
  isHoveringInteractive.value = false
}

function mouseDownHandler() {
  isClicking.value = true
}
function mouseUpHandler() {
  isClicking.value = false
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('mouseover', mouseOverHandler, true)
    document.addEventListener('mouseout', mouseOutHandler, true)
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('mousedown', mouseDownHandler, { passive: true })
    window.addEventListener('mouseup', mouseUpHandler, { passive: true })
  }
})
onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mouseover', mouseOverHandler, true)
    document.removeEventListener('mouseout', mouseOutHandler, true)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousedown', mouseDownHandler)
    window.removeEventListener('mouseup', mouseUpHandler)
  }
})
</script>

<style scoped>
.custom-cursor {
  position: absolute;
  top: 0; left: 0;
  border-radius: 50%;
  background: rgba(40,218,130,0.92);
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  pointer-events: none;
  z-index: 9999;
  transition: width .16s cubic-bezier(.4,1.4,.6,1),
              height .16s cubic-bezier(.4,1.4,.6,1),
              background 0.13s, transform 0.13s cubic-bezier(.24,.92,.62,1.7);
  mix-blend-mode: difference;
}
.custom-cursor-spotlight {
  position: absolute;
  pointer-events: none;
  z-index: 9998;
  border-radius: 50%;
  box-shadow: 0 0 0 4096px rgba(15,15,21,0.6);
  transition: left .08s, top .08s, width .16s, height .16s;
  mix-blend-mode: multiply;
  will-change: left, top, width, height;
}
</style>

<style>
/* disabled by default
to enable, add the class "custom-cursor-enabled" to the body
*/
/* html, body, #__nuxt { cursor: none !important; } */
</style>
