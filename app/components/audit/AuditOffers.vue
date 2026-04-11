<script setup lang="ts">
type OfferId = 'clarite' | 'structure' | 'transformation'

interface TimelineStep {
  label: string
  title: string
  text: string
  isBonus: boolean
}

const { t } = useI18n()

const selectedOffer = ref<OfferId | null>('structure')

const toggleOffer = (id: OfferId) => {
  selectedOffer.value = selectedOffer.value === id ? null : id
}

const onOfferKeydown = (e: KeyboardEvent, id: OfferId) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleOffer(id)
  }
}

const getTimeline = (id: OfferId): TimelineStep[] => [
  {
    label: t(`audit.timeline.${id}.step1.label`),
    title: t(`audit.timeline.${id}.step1.title`),
    text: t(`audit.timeline.${id}.step1.text`),
    isBonus: false
  },
  {
    label: t(`audit.timeline.${id}.step2.label`),
    title: t(`audit.timeline.${id}.step2.title`),
    text: t(`audit.timeline.${id}.step2.text`),
    isBonus: false
  },
  {
    label: t(`audit.timeline.${id}.step3.label`),
    title: t(`audit.timeline.${id}.step3.title`),
    text: t(`audit.timeline.${id}.step3.text`),
    isBonus: false
  },
  {
    label: t(`audit.timeline.${id}.step4.label`),
    title: t(`audit.timeline.${id}.step4.title`),
    text: t(`audit.timeline.${id}.step4.text`),
    isBonus: true
  }
]

const currentTimeline = computed(() =>
  selectedOffer.value ? getTimeline(selectedOffer.value) : []
)

const offers = computed(() => [
  {
    id: 'clarite' as OfferId,
    name: t('audit.offers.clarite.name'),
    price: '$800',
    tagline: t('audit.offers.clarite.tagline'),
    deliverable: t('audit.offers.clarite.deliverable'),
    duration: t('audit.offers.clarite.duration'),
    badge: null as string | null
  },
  {
    id: 'structure' as OfferId,
    name: t('audit.offers.structure.name'),
    price: '$2 000',
    tagline: t('audit.offers.structure.tagline'),
    deliverable: t('audit.offers.structure.deliverable'),
    duration: t('audit.offers.structure.duration'),
    badge: t('audit.offers.recommended')
  },
  {
    id: 'transformation' as OfferId,
    name: t('audit.offers.transformation.name'),
    price: '$6 500',
    tagline: t('audit.offers.transformation.tagline'),
    deliverable: t('audit.offers.transformation.deliverable'),
    duration: t('audit.offers.transformation.duration'),
    badge: null as string | null
  }
])
</script>

<template>
  <section>
    <div class="mb-2 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4">
      <div
        v-for="offer in offers"
        :key="offer.id"
        role="button"
        tabindex="0"
        class="cursor-pointer rounded-2xl border p-6 transition-all sm:p-7 min-h-48 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default"
        :class="[
          offer.id === 'structure'
            ? 'z-10 border-primary bg-primary/10 shadow-lg shadow-primary/10 md:scale-[1.02]'
            : selectedOffer === offer.id
              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/35'
              : 'border-default bg-elevated/40 shadow-sm hover:border-muted hover:shadow-md'
        ]"
        :aria-expanded="selectedOffer === offer.id"
        :aria-label="offer.name"
        @click="toggleOffer(offer.id)"
        @keydown="onOfferKeydown($event, offer.id)"
      >
        <UBadge
          v-if="offer.badge"
          color="primary"
          variant="solid"
          size="sm"
          class="mb-3"
        >
          {{ offer.badge }}
        </UBadge>

        <h3 class="text-lg font-semibold text-foreground">
          {{ offer.name }}
        </h3>
        <p class="mt-1 text-2xl font-mono font-medium text-foreground">
          {{ offer.price }}
        </p>
        <p class="mb-4 mt-2 text-sm italic text-muted">
          {{ offer.tagline }}
        </p>

        <USeparator class="my-4" />

        <div class="space-y-2 text-sm text-muted">
          <p>
            <span class="font-medium text-foreground">
              {{ t('audit.offers.label.deliverable') }} :
            </span>
            {{ offer.deliverable }}
          </p>
          <p>
            <span class="font-medium text-foreground">
              {{ t('audit.offers.label.duration') }} :
            </span>
            {{ offer.duration }}
          </p>
        </div>

        <div
          class="mt-4 flex items-center gap-1.5 text-xs"
          :class="selectedOffer === offer.id ? 'text-primary' : 'text-muted'"
        >
          <UIcon
            :name="selectedOffer === offer.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-3.5"
          />
          <span>
            {{
              selectedOffer === offer.id
                ? t('audit.offers.hideTimeline')
                : t('audit.offers.showTimeline')
            }}
          </span>
        </div>
      </div>
    </div>

    <p class="mb-6 font-mono text-xs text-muted">
      {{ t('audit.offers.usdNote') }}
    </p>

    <Transition name="slide-down">
      <div
        v-if="selectedOffer"
        class="rounded-2xl border border-default bg-elevated/60 p-6 shadow-sm ring-1 ring-default/50 sm:p-8"
      >
        <h4 class="mb-6 font-mono text-xs uppercase tracking-wider text-muted">
          {{ t('audit.timeline.title') }}
        </h4>

        <div class="relative">
          <div class="absolute bottom-2 left-[11px] top-2 w-px bg-default" />

          <div
            v-for="(step, stepIndex) in currentTimeline"
            :key="`${selectedOffer}-${stepIndex}`"
            class="relative flex gap-4 pb-6 last:pb-0"
          >
            <div
              class="relative z-10 mt-0.5 size-6 shrink-0 rounded-full border-2 bg-elevated"
              :class="step.isBonus ? 'border-muted' : 'border-primary'"
            />
            <div>
              <span class="font-mono text-xs text-muted">{{ step.label }}</span>
              <h5 class="mt-0.5 text-sm font-medium text-foreground">
                {{ step.title }}
              </h5>
              <p
                class="mt-1 text-sm"
                :class="step.isBonus ? 'text-muted' : 'text-foreground/80'"
              >
                {{ step.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
