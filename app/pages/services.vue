<script setup lang="ts">
const { data: page } = await useAsyncData('services', () => {
  return queryCollection('services').first()
})
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

const { global } = useAppConfig()

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
const services = [
  {
    icon: 'i-ph-lightbulb',
    title: 'Consulting',
    description: 'Conseil stratégique en Vue, Nuxt et architecture front-end. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum maximus.'
  },
  {
    icon: 'i-ph-chalkboard-teacher',
    title: 'Workshops',
    description: 'Ateliers pour faire monter votre équipe en compétence sur Vue, Nuxt, TypeScript, Testing, etc. Lorem ipsum dolor sit amet, consectetur.'
  },
  {
    icon: 'i-ph-sparkle',
    title: 'Audit & Refonte',
    description: 'Audit de performances, modernisation, design system. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.'
  }
]
const links = ref([
  {
    label: 'Contactez-moi',
    to: '/contact',
    variant: 'solid' as const,
    trailingIcon: 'i-lucide-arrow-right'
  }
])
</script>

<template>
  <UPage>
    <UPageHero
      title="Services"
      description="Des solutions modulaires et un accompagnement sur-mesure pour faire grandir vos projets front-end, équipe ou produit."
      :ui="{
        title: 'text-3xl md:text-5xl font-bold',
        description: 'mt-6 text-base md:text-xl text-muted'
      }"
    />
      <UBlogPosts class="grid md:grid-cols-3 gap-8 mt-12">
        <UPageCard
          v-for="service in services" :key="service.title"
          title="Tailwind CSS"
          description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
          icon="i-simple-icons-"
          orientation="vertical"
          reverse
          to="/services/#"
        >
          <img src="https://picsum.photos/200" alt="Tailwind CSS" class="w-full" />
        </UPageCard>
      </UBlogPosts>
    <UPageSection>
     <UPageCTA
        title="Un projet, une question ?"
        description="Discutons : conseils, audits, ou accompagnement dédié à vos besoins. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        :links="links"
        variant="solid"
      />
  </UPageSection>
  <LandingTestimonials :page />
  <LandingFAQ :page />
  </UPage>
</template>