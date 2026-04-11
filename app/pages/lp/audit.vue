<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'
import AuditCredibility from '~/components/audit/AuditCredibility.vue'
import AuditOffers from '~/components/audit/AuditOffers.vue'
import AuditSampleReport from '~/components/audit/AuditSampleReport.vue'
import AuditTestimonials from '~/components/audit/AuditTestimonials.vue'
import ChatbotInline from '~/components/chatbot/ChatbotInline.vue'
import { getAuditChatConfig } from '~/components/chatbot/chatConfig'

definePageMeta({
  layout: false
})

const { t, locale } = useI18n()

const auditConfig = computed(() => {
  const loc = locale.value?.toString().startsWith('fr') ? 'fr' : 'en'
  return getAuditChatConfig(loc)
})
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()
const { global } = useAppConfig()

/** Si la base Nuxt Content est indisponible ou vide, la LP s’affiche quand même (sans marquee). */
const { data: page } = await usePageData<IndexCollectionItem>('index')

const seoTitle = computed(() => t('lpAudit.seo.title'))
const seoDescription = computed(() => t('lpAudit.seo.description'))

usePageSeo({
  description: seoDescription,
  image: () => global.picture?.light,
  ogType: 'website',
  title: seoTitle,
  titleFallbackKey: 'seo.pages.lpAudit'
})

useSeoMeta({
  robots: 'noindex'
})

const painItems = computed(() => [
  t('lpAudit.pain.items.0'),
  t('lpAudit.pain.items.1'),
  t('lpAudit.pain.items.2'),
  t('lpAudit.pain.items.3')
])

const switchLang = async (code: 'fr' | 'en') => {
  if (locale.value === code) {
    return
  }
  const path = switchLocalePath(code)
  if (path) {
    await router.push(path)
  }
}

const scrollToContact = () => {
  if (import.meta.client) {
    document.getElementById('calendar')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<template>
  <div class="min-h-dvh scroll-smooth bg-default text-default">
    <UContainer class="border-default sm:border-x px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
      <!-- Colonne de lecture unique : tout s’aligne sur la même grille -->
      <div class="mx-auto w-full max-w-6xl">
        <header class="mb-12 flex flex-wrap items-center justify-between gap-4 sm:mb-16">
          <NuxtLink
            class="flex items-center gap-3 rounded-lg outline-none ring-primary/30 transition-opacity hover:opacity-90 focus-visible:ring-2"
            :to="localePath('/')"
            :aria-label="t('lpAudit.header.logoAria')"
          >
            <NuxtImg
              class="size-10 shrink-0 rounded-full object-cover ring-1 ring-default"
              height="40"
              :src="global.picture?.light || '/hero/photo.webp'"
              width="40"
              :alt="t('global.picture.alt')"
            />
            <span class="text-lg font-semibold tracking-tight text-highlighted">
              {{ t('seo.siteName') }}
            </span>
          </NuxtLink>

          <div class="flex items-center gap-1 sm:gap-2">
            <UButton
              :color="locale === 'fr' ? 'primary' : 'neutral'"
              size="sm"
              :variant="locale === 'fr' ? 'solid' : 'ghost'"
              :aria-current="locale === 'fr' ? 'true' : undefined"
              @click="switchLang('fr')"
            >
              FR
            </UButton>
            <UButton
              :color="locale === 'en' ? 'primary' : 'neutral'"
              size="sm"
              :variant="locale === 'en' ? 'solid' : 'ghost'"
              :aria-current="locale === 'en' ? 'true' : undefined"
              @click="switchLang('en')"
            >
              EN
            </UButton>
            <ColorModeButton />
          </div>
        </header>

        <main id="main-content">
          <!-- Hero -->
          <section class="mb-16 sm:mb-24">
            <div
              class="mx-auto w-full max-w-6xl rounded-2xl border border-default bg-elevated/70 p-6 shadow-sm ring-1 ring-default/40 sm:p-10"
            >
              <div>
                <p class="mb-4 text-sm font-medium leading-snug text-primary sm:text-base">
                  {{ t('lpAudit.hero.eyebrow') }}
                </p>
                <h1 class="space-y-2 text-balance text-4xl font-bold leading-tight tracking-tight text-highlighted sm:space-y-3 sm:text-5xl md:text-6xl md:leading-[1.08]">
                  <span class="block">{{ t('lpAudit.hero.line1') }}</span>
                  <span class="block">{{ t('lpAudit.hero.line2') }}</span>
                </h1>
                <div class="mt-8 space-y-4 border-l-2 border-primary/50 pl-5 text-lg text-muted sm:text-xl">
                  <p class="text-pretty leading-relaxed">
                    {{ t('lpAudit.hero.pitch1') }}
                  </p>
                  <p class="text-pretty leading-relaxed">
                    {{ t('lpAudit.hero.pitch2') }}
                  </p>
                </div>
                <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <UButton
                    color="primary"
                    size="lg"
                    class="w-full justify-center shadow-md shadow-primary/15 sm:w-auto sm:min-w-56"
                    @click="scrollToContact"
                  >
                    {{ t('lpAudit.hero.cta') }}
                  </UButton>
                  <p class="text-center text-sm text-muted sm:text-left">
                    {{ t('lpAudit.hero.ctaHint') }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Douleur -->
          <section class="mb-16 sm:mb-24">
            <div class="mx-auto max-w-3xl">
              <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
                {{ t('lpAudit.pain.eyebrow') }}
              </p>
              <h2 class="mb-8 text-balance text-2xl font-bold text-highlighted sm:text-3xl">
                {{ t('lpAudit.pain.title') }}
              </h2>
              <ul
                class="space-y-0 rounded-2xl border border-default bg-elevated/50 p-5 shadow-sm sm:p-8"
                role="list"
              >
                <li
                  v-for="(item, i) in painItems"
                  :key="i"
                  class="flex gap-4 border-b border-default/60 py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <UIcon
                    name="i-lucide-alert-circle"
                    class="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span class="text-base leading-relaxed text-default sm:text-lg">{{ item }}</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Offres : grille un peu plus large que le texte -->
          <section
            class="mb-16 sm:mb-24"
            aria-labelledby="lp-audit-offers-heading"
          >
            <div class="mx-auto mb-10 max-w-3xl">
              <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
                {{ t('audit.offers.sectionEyebrow') }}
              </p>
              <h2
                id="lp-audit-offers-heading"
                class="text-balance text-2xl font-bold text-highlighted sm:text-3xl"
              >
                {{ t('audit.offers.sectionTitle') }}
              </h2>
              <p class="mt-3 text-pretty text-muted sm:text-lg">
                {{ t('audit.offers.sectionSubtitle') }}
              </p>
            </div>
            <AuditOffers />
          </section>

          <USeparator class="my-16 sm:my-24" />

          <section class="mb-16 sm:mb-24">
            <div class="mx-auto max-w-3xl">
              <AuditSampleReport />
            </div>
          </section>

          <!-- Crédibilité + logos -->
          <section class="mb-16 sm:mb-24">
            <AuditCredibility />
            <div class="mt-12 sm:mt-16">
              <LazyLandingMarquee
                v-if="page"
                :page="page"
              />
            </div>
          </section>

          <section class="mb-16 sm:mb-24">
            <div class="mx-auto max-w-3xl">
              <AuditTestimonials />
            </div>
          </section>

          <USeparator class="my-16 sm:my-24" />

          <section
            class="mt-12 sm:mt-16"
            aria-labelledby="lp-audit-calendar-heading"
          >
            <div
              id="calendar"
              class="w-full max-w-6xl scroll-mt-24"
            >
              <div class="text-center mb-6">
                <h2 class="text-2xl sm:text-3xl font-semibold mb-2">
                  {{ t('contact.booking.title') }}
                </h2>
                <p class="text-muted text-sm sm:text-base">
                  {{ t('contact.booking.description') }}
                </p>
              </div>
              <UCard class="w-full shadow-2xl p-0 overflow-hidden">
                <div class="flex flex-col items-center py-8 gap-3">
                  <iframe
                    :src="global.meetingLink"
                    width="100%"
                    style="min-height:630px; height:100%; border:0; background: white"
                    allow="camera; microphone; fullscreen;"
                    :title="t('contact.iframe.title')"
                  />
                </div>
              </UCard>
            </div>
          </section>

          <!-- Chat -->
          <section
            id="lp-audit-contact"
            class="mt-12 scroll-mt-8 pb-12 sm:mt-16 sm:pb-16"
            aria-labelledby="lp-audit-chat-heading"
          >
            <div class="mx-auto max-w-3xl text-center">
              <p class="mb-2 text-xs font-mono uppercase tracking-wider text-primary">
                {{ t('lpAudit.chat.eyebrow') }}
              </p>
              <h2
                id="lp-audit-chat-heading"
                class="mx-auto max-w-2xl text-balance text-2xl font-bold text-highlighted sm:text-3xl"
              >
                {{ t('lpAudit.chat.title') }}
              </h2>
            </div>
            <div
              class="mx-auto mt-8 max-w-3xl rounded-2xl border border-default bg-elevated/50 p-6 shadow-sm sm:p-8"
            >
              <ClientOnly>
                <ChatbotInline
                  embedded
                  :config="auditConfig"
                />
              </ClientOnly>
            </div>
          </section>
        </main>
      </div>

      <footer class="border-t border-default/40 pt-8 text-center text-xs text-muted">
        {{ t('footer.credits', { year: new Date().getFullYear() }) }}
      </footer>
    </UContainer>
  </div>
</template>
