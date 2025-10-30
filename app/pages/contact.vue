<script setup lang="ts">
import emailjs from 'emailjs-com'
import { ref } from 'vue'

const { global } = useAppConfig()
const config = useRuntimeConfig()
const SERVICE_ID = String(config.public.EMAILJS_SERVICE_ID)
const TEMPLATE_ID = String(config.public.EMAILJS_TEMPLATE_ID)
const PUBLIC_KEY = String(config.public.EMAILJS_PUBLIC_KEY)

const submitted = ref(false)
const submitting = ref(false)
const error = ref("")
const formState = ref({
  name: '',
  email: '',
  message: ''
})
const honeypot = ref("")
const showForm = ref(false)
const showIframe = ref(false)

const validate = (state: any) => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Le nom est requis.' })
  if (!state.email || !/\S+@\S+\.\S+/.test(state.email)) errors.push({ path: 'email', message: 'Email invalide.' })
  if (!state.message) errors.push({ path: 'message', message: 'Le message est requis.' })
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
  error.value = ""
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
        name: formState.value.name,
        email: formState.value.email,
        message: formState.value.message
      },
      PUBLIC_KEY
    )
    submitted.value = true
    showForm.value = false
  } catch (e) {
    error.value = "Erreur lors de l'envoi du message."
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: 'Contact — Massimo Russo',
  description: `Contactez-moi via le formulaire ou par mail : ${global.email}`
})
</script>
<template>
  <UPage>
    <!-- Hero principal moderne -->
    <UPageHero
      orientation="horizontal"
      :title="'Contact'"
      :description="'Le premier pas pour aller plus loin, c\'est d\'oser poser une question ou réserver un créneau. Parlons-en !'"
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
          >Prendre rendez-vous</UButton>
          <UButton
            color="neutral"
            variant="link"
            class="underline text-base p-0 h-auto py-0"
            @click="openForm"
            v-if="!showForm"
          >Ou m'écrire un message</UButton>
        </div>
      </template>
      <!-- Slot header/extra: avatar sur la droite -->
      <template #header>
        <div class="hidden lg:flex flex-col items-center justify-center min-h-[210px] animate-fade-in-up">
          <UColorModeAvatar
            class="size-40 ring ring-default ring-offset-2 mb-4 shadow-xl"
            :light="global.picture?.light!"
            :dark="global.picture?.dark!"
            :alt="global.picture?.alt!"
          />
        </div>
      </template>
    </UPageHero>
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
              title="Calendrier prise de rendez-vous"
            ></iframe>
            <UButton color="neutral" variant="ghost" icon="i-lucide-mail" size="md" class="mt-2" @click="openForm">
              Ou envoyez-moi un message
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
                      Ne pas remplir ce champ :
                      <input v-model="honeypot" name="website" autocomplete="off" tabindex="-1" />
                    </label>
                  </div>
                  <UFormField name="name" label="Nom" required>
                    <template #default="{ error }">
                      <UInput v-model="formState.name" placeholder="Votre nom" required size="md" :color="error ? 'error' : 'primary'" />
                    </template>
                  </UFormField>
                  <UFormField name="email" label="Email" required>
                    <template #default="{ error }">
                      <UInput v-model="formState.email" placeholder="Votre email" type="email" required size="md" :color="error ? 'error' : 'primary'" />
                    </template>
                  </UFormField>
                  <UFormField name="message" label="Message" required>
                    <template #default="{ error }">
                      <UTextarea v-model="formState.message" placeholder="Votre message" required size="md" :color="error ? 'error' : 'primary'" :rows="5" />
                    </template>
                  </UFormField>
                  <div v-if="error" class="text-error text-sm mt-2">{{ error }}</div>
                  <div class="flex justify-end">
                    <UButton :loading="submitting" type="submit" color="primary" size="md" class="mt-2 w-full">Envoyer</UButton>
                  </div>
                </UForm>
                <UButton color="secondary" variant="ghost" icon="i-lucide-calendar" size="md" class="mt-4 w-full" @click="openIframe">
                  Ou prendre rendez-vous
                </UButton>
              </UCard>
            </div>
            <!-- Colonne droite : visuel + texte d'accroche -->
            <div class="hidden lg:flex flex-col items-center justify-center px-10 bg-gradient-to-br from-blue-50/40 via-transparent to-blue-100/20 dark:from-gray-900/90 dark:to-gray-900/60 min-h-[420px] gap-6">
              <UColorModeAvatar
                class="size-40 ring ring-default ring-offset-2 mb-4 animate-fade-in-up shadow-xl"
                :light="global.picture?.light!"
                :dark="global.picture?.dark!"
                :alt="global.picture?.alt!"
              />
              <div class="text-xl font-serif italic text-muted text-center max-w-xs">« Je réponds à toutes les demandes sous 24h. Un projet, une question, ou juste un échange sur le design, n’hésite pas à me contacter ! »</div>
            </div>
          </div>
        </template>
        <UCard v-else-if="submitted" class="w-full max-w-md shadow-xl text-center py-10 animate-fade-in">
          <h2 class="text-xl font-bold mb-2">Merci pour votre message !</h2>
          <p>Je reviens rapidement vers vous.</p>
          <UButton class="mt-6" @click="resetContact">Retour</UButton>
        </UCard>
      </div>
    </UPageSection>
  </UPage>
</template>
