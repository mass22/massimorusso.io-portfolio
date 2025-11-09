<script setup lang="ts">
import emailjs from 'emailjs-com'
import { ref } from 'vue'

const { global } = useAppConfig()
const config = useRuntimeConfig()
const SERVICE_ID = String(config.public.EMAILJS_SERVICE_ID)
const TEMPLATE_ID = String(config.public.EMAILJS_TEMPLATE_ID)
const PUBLIC_KEY = String(config.public.EMAILJS_PUBLIC_KEY)

const { t } = useI18n()

const submitted = ref(false)
const submitting = ref(false)
const error = ref('')
const formState = ref({
  email: '', message: '', name: ''
})
const honeypot = ref('')
const showForm = ref(false)
const showIframe = ref(false)

const validate = (state: any) => {
  const errors = []
  if (!state.name) {errors.push({ path: 'name', message: t('contact.validation.nameRequired') })}
  if (!state.email || !/\S+@\S+\.\S+/.test(state.email)) {errors.push({ path: 'email', message: t('contact.validation.emailInvalid') })}
  if (!state.message) {errors.push({ path: 'message', message: t('contact.validation.messageRequired') })}
  return errors
}

const openForm = () => {
  showForm.value = true
  showIframe.value = false
}
const openIframe = () => {
  showIframe.value = true
  showForm.value = false
}
const resetContact = () => {
  showForm.value = false
  showIframe.value = false
  submitted.value = false
}

const handleSubmit = async () => {
  error.value = ''
  submitting.value = true
  // anti-spam simple
  if (honeypot.value) {
    submitted.value = true
    submitting.value = false
    showForm.value = false
    return
  }
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        email: formState.value.email, message: formState.value.message, name: formState.value.name
      },
      PUBLIC_KEY
    )
    submitted.value = true
    showForm.value = false
  } catch (e) {
    error.value = t('contact.errors.submit')
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  description: () => t('contact.seo.description', { email: global.email }),
  ogDescription: () => t('contact.seo.description', { email: global.email }),
  ogTitle: () => t('contact.seo.title'),
  title: () => t('contact.seo.title')
})
</script>
<template>
  <UPage>
    <!-- Hero principal moderne -->
    <UPageHero
      orientation="horizontal"
      :title="t('contact.hero.title')"
      :description="t('contact.hero.description')"
      :ui="{root: 'mb-2', description: 'mt-3 text-xl text-primary/80 font-serif italic'}"
    >
      <!-- Slot links : les deux boutons toggle -->
      <template #links>
        <div class="flex gap-3 flex-col sm:flex-row sm:justify-start items-center w-full mt-4 animate-fade-in">
          <UButton
            color="primary"
            icon="i-lucide-calendar"
            size="lg"
            class="font-semibold px-8 py-4"
            @click="openIframe"
            :variant="showIframe ? 'solid' : 'soft'"
            :label="t('contact.hero.cta.booking')"
          />
          <UButton
            color="neutral"
            variant="link"
            class="underline text-base p-0 h-auto py-0"
            @click="openForm"
            v-if="!showForm"
            :label="t('contact.hero.cta.write')"
          />
        </div>
      </template>
      <!-- Slot header/extra: avatar sur la droite -->
      <template #header>
        <div class="hidden lg:flex flex-col items-center justify-center min-h-[210px] animate-fade-in-up">
          <UColorModeAvatar
            class="size-40 ring ring-default ring-offset-2 mb-4 shadow-xl"
            :light="global.picture?.light!"
            :dark="global.picture?.dark!"
            :alt="t(global.picture?.altKey ?? 'global.picture.alt')"
          />
        </div>
      </template>
    </UPageHero>
    <!-- Indicateur de disponibilité -->
    <UPageSection
      :ui="{
        container: 'px-0 !pt-4 sm:!pt-6'
      }"
    >
      <UCard
        :class="[
          'w-full max-w-2xl mx-auto border-2 transition-all duration-300',
          global.available
            ? 'border-success/30 bg-success/5 dark:bg-success/10'
            : 'border-error/30 bg-error/5 dark:bg-error/10'
        ]"
      >
        <div class="flex items-center gap-4 p-4 sm:p-6">
          <div class="shrink-0">
            <span class="relative flex size-3" aria-hidden="true">
              <span
                class="absolute inline-flex size-full rounded-full animate-pulse"
                :class="global.available ? 'bg-success opacity-75' : 'bg-error opacity-75'"
              />
              <span
                class="relative inline-flex size-3 rounded-full"
                :class="global.available ? 'bg-success' : 'bg-error'"
              />
            </span>
          </div>
          <div class="flex-1">
            <p
              class="text-sm sm:text-base font-semibold"
              :class="global.available ? 'text-success' : 'text-error'"
            >
              {{ global.available ? t('contact.availability.available.title') : t('contact.availability.unavailable.title') }}
            </p>
            <p class="text-xs sm:text-sm text-muted mt-1">
              {{ global.available ? t('contact.availability.available.description') : t('contact.availability.unavailable.description') }}
            </p>
          </div>
          <div class="shrink-0" v-if="global.available">
            <UButton
              :to="global.meetingLink"
              target="_blank"
              color="success"
              variant="soft"
              size="sm"
              icon="i-lucide-calendar"
              :label="t('contact.availability.cta')"
            />
          </div>
        </div>
      </UCard>
    </UPageSection>
    <!-- Section "Pourquoi me contacter ?" -->
    <LazyLandingContactWhy />
    <!-- Bloc iframe RDV Cal.com -->
    <UPageSection v-if="showIframe && !submitted">
      <div class="flex flex-col items-center justify-center">
        <UCard class="w-full max-w-2xl shadow-2xl p-0 overflow-hidden">
          <div class="flex flex-col items-center py-8 gap-3">
            <iframe
              :src="global.meetingLink"
              width="100%"
              style="min-height:630px; border:0; border-radius:1rem; background: white"
              allow="camera; microphone; fullscreen;"
              :title="t('contact.iframe.title')"
            ></iframe>
            <UButton color="neutral" variant="ghost" icon="i-lucide-mail" size="md" class="mt-2" @click="openForm">
              {{ t('contact.iframe.button') }}
            </UButton>
          </div>
        </UCard>
      </div>
    </UPageSection>
    <!-- Bloc principal du formulaire (avec colonne avatar) -->
    <UPageSection>
      <div class="flex justify-center">
        <template v-if="showForm && !submitted">
          <div class="w-full max-w-4xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <!-- Colonne gauche : Formulaire -->
            <div class="p-8 flex flex-col justify-center min-h-[420px]">
              <UCard class="border-none shadow-none p-0 bg-transparent">
                <UForm :state="formState" :validate="validate" class="space-y-4" @submit.prevent="handleSubmit">
                  <!-- Champ invisible anti-spam/honeypot -->
                  <div style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;">
                    <label aria-hidden="true" tabindex="-1">
                      {{ t('contact.form.honeypotLabel') }}
                      <input v-model="honeypot" name="website" autocomplete="off" tabindex="-1" />
                    </label>
                  </div>
                  <UFormField name="name" :label="t('contact.form.nameLabel')" required>
                    <template #default="{ error }">
                      <UInput v-model="formState.name" :placeholder="t('contact.form.namePlaceholder')" required size="md" :color="error ? 'error' : 'primary'" />
                    </template>
                  </UFormField>
                  <UFormField name="email" :label="t('contact.form.emailLabel')" required>
                    <template #default="{ error }">
                      <UInput v-model="formState.email" :placeholder="t('contact.form.emailPlaceholder')" type="email" required size="md" :color="error ? 'error' : 'primary'" />
                    </template>
                  </UFormField>
                  <UFormField name="message" :label="t('contact.form.messageLabel')" required>
                    <template #default="{ error }">
                      <UTextarea v-model="formState.message" :placeholder="t('contact.form.messagePlaceholder')" required size="md" :color="error ? 'error' : 'primary'" :rows="5" />
                    </template>
                  </UFormField>
                  <div v-if="error" class="text-error text-sm mt-2" role="alert" aria-live="polite">{{ error }}</div>
                  <div class="flex justify-end">
                    <UButton :loading="submitting" type="submit" color="primary" size="md" class="mt-2 w-full" :label="t('contact.form.submit')" />
                  </div>
                </UForm>
                <UButton color="secondary" variant="ghost" icon="i-lucide-calendar" size="md" class="mt-4 w-full" @click="openIframe" :label="t('contact.form.toggleBooking')" />
              </UCard>
            </div>
            <!-- Colonne droite : visuel + texte d'accroche -->
            <div class="hidden lg:flex flex-col items-center justify-center px-10 bg-gradient-to-br from-blue-50/40 via-transparent to-blue-100/20 dark:from-gray-900/90 dark:to-gray-900/60 min-h-[420px] gap-6">
              <UColorModeAvatar
                class="size-40 ring ring-default ring-offset-2 mb-4 animate-fade-in-up shadow-xl"
                :light="global.picture?.light!"
                :dark="global.picture?.dark!"
                :alt="t(global.picture?.altKey ?? 'global.picture.alt')"
              />
              <div class="text-xl font-serif italic text-muted text-center max-w-xs">{{ t('contact.quote') }}</div>
            </div>
          </div>
        </template>
        <UCard v-else-if="submitted" class="w-full max-w-md shadow-xl text-center py-10 animate-fade-in">
          <h2 class="text-xl font-bold mb-2">{{ t('contact.success.title') }}</h2>
          <p>{{ t('contact.success.description') }}</p>
          <UButton class="mt-6" @click="resetContact" :label="t('contact.success.back')" />
        </UCard>
      </div>
    </UPageSection>
  </UPage>
</template>
