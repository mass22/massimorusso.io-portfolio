<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  // Pas de middleware admin ici : c'est la page d'accès.
  layout: 'default'
})

const route = useRoute()
const router = useRouter()

const next = computed(() => {
  const q = route.query.next
  return typeof q === 'string' && q.trim() ? q : '/lead'
})

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const submit = async () => {
  error.value = null
  isSubmitting.value = true

  try {
    const parsed = LoginSchema.safeParse({
      email: email.value.trim(),
      password: password.value
    })
    if (!parsed.success) {
      error.value = 'Email ou mot de passe invalide.'
      return
    }

    await $fetch('/api/admin/login', {
      method: 'POST',
      body: parsed.data
    })

    await router.push(next.value)
  } catch (err: any) {
    error.value = err?.data?.message || err?.statusMessage || 'Connexion impossible.'
  } finally {
    isSubmitting.value = false
  }
}

// SEO / robots
usePageSeo({
  title: 'Admin — Connexion',
  description: 'Connexion admin pour accéder au dashboard des leads.',
  ogType: 'website',
  titleFallbackKey: 'seo.pages.adminPodcast'
})

useSeoMeta({
  robots: 'noindex, nofollow'
})

useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Connexion admin"
      description="Accès au dashboard des leads."
    />

    <UPageSection>
      <div class="max-w-md mx-auto">
        <UCard>
          <form
            class="space-y-4"
            @submit.prevent="submit"
          >
            <div class="space-y-2">
              <label
                for="admin-email"
                class="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <UInput
                id="admin-email"
                v-model="email"
                type="email"
                placeholder="admin@exemple.com"
                autocomplete="username"
              />
            </div>

            <div class="space-y-2">
              <label
                for="admin-password"
                class="block text-sm font-medium text-foreground"
              >
                Mot de passe
              </label>
              <UInput
                id="admin-password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              title="Erreur"
              :description="error"
            />

            <UButton
              type="submit"
              :loading="isSubmitting"
              block
              color="primary"
              icon="i-lucide-log-in"
            >
              Se connecter
            </UButton>
          </form>
        </UCard>
      </div>
    </UPageSection>
  </UPage>
</template>
