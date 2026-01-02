<script setup lang="ts">
import { markdownToHtml } from '~/utils/markdown'

type Props = {
  content: string
  withAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withAnimation: true
})

// Convertir le markdown en HTML côté serveur et client
const htmlContent = computed(() => markdownToHtml(props.content))
</script>

<template>
  <Motion
    v-if="withAnimation"
    :initial="{ opacity: 0, transform: 'translateY(30px)' }"
    :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
    :transition="{ duration: 0.6 }"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <UPageSection
      :ui="{
        container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-8 sm:gap-12'
      }"
    >
      <div class="relative">
        <!-- Ligne décorative verticale à gauche -->
        <div class="hidden lg:block absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-transparent rounded-full" />

        <!-- Conteneur premium -->
        <div class="relative rounded-2xl border border-default/20 bg-elevated/50 dark:bg-elevated/30 backdrop-blur-sm p-8 md:p-10 lg:p-12 ml-0 lg:ml-8">
          <!-- Accent décoratif en haut à gauche -->
          <div class="absolute top-0 left-0 w-16 h-0.5 bg-gradient-to-r from-primary/50 via-primary/30 to-transparent rounded-full" />

          <!-- Contenu markdown avec typographie premium -->
          <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-highlighted prose-headings:leading-tight prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-0 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mb-5 prose-h3:mt-10 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted prose-p:mb-8 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-strong:text-highlighted prose-strong:font-semibold prose-ul:my-8 prose-ul:space-y-4 prose-li:text-muted prose-li:leading-relaxed prose-li:marker:text-primary/60 prose-ol:my-8 prose-ol:space-y-4 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:my-8 prose-code:text-sm prose-code:bg-default/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-default/50 prose-pre:rounded-xl prose-pre:p-6 prose-pre:border prose-pre:border-default/20 prose-pre:my-8 prose-hr:border-default/20 prose-hr:my-12">
            <div v-html="htmlContent" />
          </div>
        </div>
      </div>
    </UPageSection>
  </Motion>
  <UPageSection
    v-else
    :ui="{
      container: 'px-0 !pt-12 sm:!pt-16 lg:!pt-20 gap-8 sm:gap-12'
    }"
  >
    <div class="relative">
      <!-- Ligne décorative verticale à gauche -->
      <div class="hidden lg:block absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-transparent rounded-full" />

      <!-- Conteneur premium -->
      <div class="relative rounded-2xl border border-default/20 bg-elevated/50 dark:bg-elevated/30 backdrop-blur-sm p-8 md:p-10 lg:p-12 ml-0 lg:ml-8">
        <!-- Accent décoratif en haut à gauche -->
        <div class="absolute top-0 left-0 w-16 h-0.5 bg-gradient-to-r from-primary/50 via-primary/30 to-transparent rounded-full" />

        <!-- Contenu markdown avec typographie premium -->
        <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-highlighted prose-headings:leading-tight prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-0 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mb-5 prose-h3:mt-10 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted prose-p:mb-8 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-strong:text-highlighted prose-strong:font-semibold prose-ul:my-8 prose-ul:space-y-4 prose-li:text-muted prose-li:leading-relaxed prose-li:marker:text-primary/60 prose-ol:my-8 prose-ol:space-y-4 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:my-8 prose-code:text-sm prose-code:bg-default/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-default/50 prose-pre:rounded-xl prose-pre:p-6 prose-pre:border prose-pre:border-default/20 prose-pre:my-8 prose-hr:border-default/20 prose-hr:my-12">
          <div v-html="htmlContent" />
        </div>
      </div>
    </div>
  </UPageSection>
</template>

<style scoped>
/* Espacement amélioré pour le contenu markdown */
:deep(.prose) p {
  margin-bottom: 2rem !important;
  margin-top: 0;
  font-size: 1rem;
}

:deep(.prose) p + p {
  margin-top: 0;
}

:deep(.prose) h2 {
  margin-top: 3rem !important;
  margin-bottom: 1.5rem !important;
  font-size: 1.5rem;
}

:deep(.prose) h3 {
  margin-top: 2.5rem !important;
  margin-bottom: 1.25rem !important;
}

:deep(.prose) h2 + p,
:deep(.prose) h3 + p {
  margin-top: 0;
}

:deep(.prose) ul,
:deep(.prose) ol {
  margin-top: 2rem !important;
  margin-bottom: 2rem !important;
}

:deep(.prose) li {
  margin-bottom: 0.75rem !important;
}

:deep(.prose) ul + p,
:deep(.prose) ol + p {
  margin-top: 2rem !important;
}

:deep(.prose) p + ul,
:deep(.prose) p + ol {
  margin-top: 1.5rem !important;
}
</style>
