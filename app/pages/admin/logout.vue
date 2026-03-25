<script setup lang="ts">
definePageMeta({
  // Accessible sans auth.
  layout: 'default'
})

const router = useRouter()

const logout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  } finally {
    await router.push('/admin/login')
  }
}

await logout()
</script>

<template>
  <UPage>
    <UPageSection>
      <div class="max-w-md mx-auto text-center py-16">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 animate-spin text-muted"
        />
        <p class="mt-4 text-muted">
          Déconnexion...
        </p>
      </div>
    </UPageSection>
  </UPage>
</template>
