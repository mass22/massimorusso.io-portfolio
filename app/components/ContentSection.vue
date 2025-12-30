<script setup lang="ts">
type Props = {
  content: string
  withAnimation?: boolean
}

withDefaults(defineProps<Props>(), {
  withAnimation: true
})
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
          <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-highlighted prose-headings:leading-tight prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-6 prose-h1:mt-0 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted prose-p:mb-6 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-strong:text-highlighted prose-strong:font-semibold prose-ul:my-6 prose-ul:space-y-3 prose-li:text-muted prose-li:leading-relaxed prose-li:marker:text-primary/60 prose-ol:my-6 prose-ol:space-y-3 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted prose-code:text-sm prose-code:bg-default/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-default/50 prose-pre:rounded-xl prose-pre:p-6 prose-pre:border prose-pre:border-default/20 prose-hr:border-default/20 prose-hr:my-8">
            <MDC :value="content" />
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
        <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-highlighted prose-headings:leading-tight prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-6 prose-h1:mt-0 prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted prose-p:mb-6 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-strong:text-highlighted prose-strong:font-semibold prose-ul:my-6 prose-ul:space-y-3 prose-li:text-muted prose-li:leading-relaxed prose-li:marker:text-primary/60 prose-ol:my-6 prose-ol:space-y-3 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted prose-code:text-sm prose-code:bg-default/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-default/50 prose-pre:rounded-xl prose-pre:p-6 prose-pre:border prose-pre:border-default/20 prose-hr:border-default/20 prose-hr:my-8">
          <MDC :value="content" />
        </div>
      </div>
    </div>
  </UPageSection>
</template>
