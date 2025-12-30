<script setup lang="ts">
interface Props {
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: undefined,
  height: undefined
})

// Extraire les dimensions de l'URL si présentes, sinon utiliser des valeurs par défaut
const imageWidth = computed(() => {
  if (props.width) return Number(props.width)
  // Valeur par défaut pour les images de blog
  return 1200
})

const imageHeight = computed(() => {
  if (props.height) return Number(props.height)
  // Ratio 16:9 par défaut
  return Math.round(imageWidth.value * 0.5625)
})
</script>

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    :width="imageWidth"
    :height="imageHeight"
    loading="lazy"
    format="webp"
    quality="80"
    class="rounded-lg w-full h-auto object-cover"
  />
</template>
