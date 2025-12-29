<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, fr } from '@nuxt/ui/locale'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { footer } = useAppConfig()
const { t, locale, locales: availableLocales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const socialLinks = computed(() => footer?.links?.map(link => ({
  ...link,
  'aria-label': t(link.ariaLabelKey)
})) ?? [])

const route = useRoute()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = ref(false)
const slideoverOpen = ref(false)
const isReady = ref(false)

onMounted(() => {
  isReady.value = true
  watchEffect(() => {
    isMobile.value = breakpoints.smaller('md').value
  })

  const router = useRouter()
  router.afterEach(() => {
    if (!isSwitchingLocale.value) {
      slideoverOpen.value = false
    }
  })
})

type UiLocale = {
  name: string
  code: string
  dir: 'ltr' | 'rtl'
  messages: Record<string, any>
}

const baseUiLocales: Record<string, UiLocale> = {
  en: {
    code: en.code, dir: en.dir, messages: en.messages ?? {}, name: en.name
  },
  fr: {
    code: fr.code, dir: fr.dir, messages: fr.messages ?? {}, name: fr.name
  }
}

const uiLocales = computed(() => {
  const list = Array.isArray(availableLocales.value) ? availableLocales.value : []

  if (!list.length) {
    return Object.values(baseUiLocales)
  }

  const seen = new Set<string>()

  return list
    .map((item) => {
      if (!item?.code || seen.has(item.code)) {
        return null
      }
      seen.add(item.code)

      const base = baseUiLocales[item.code]

      if (base) {
        return {
          ...base,
          name: item.name ?? base.name,
          code: item.code as string
        }
      }

      return {
        code: item.code as string, dir: (item.dir as 'ltr' | 'rtl') ?? 'ltr', messages: {}, name: item.name ?? item.code
      }
    })
    .filter((locale): locale is UiLocale => Boolean(locale))
})


const props = withDefaults(defineProps<{ links: NavigationMenuItem[], noLangSwitcher?: boolean }>(), {
  noLangSwitcher: false
})

const showLocaleSwitcher = computed(() => !props.noLangSwitcher && uiLocales.value.length > 0)

const inactiveLocale = computed(() => {
  return uiLocales.value.find(loc => loc.code !== locale.value)
})

const isSwitchingLocale = ref(false)

const switchLocale = (targetLocale: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  if (targetLocale && targetLocale !== locale.value) {
    isSwitchingLocale.value = true
    const targetPath = switchLocalePath(targetLocale)
    if (targetPath) {
      void router.push(targetPath).finally(() => {
        // Réinitialiser après un court délai pour permettre la navigation
        setTimeout(() => {
          isSwitchingLocale.value = false
        }, 100)
      })
    } else {
      isSwitchingLocale.value = false
    }
  }
}

// Fonction pour déterminer si un lien est prioritaire (Services ou Contact)
const isPriorityLink = (link: NavigationMenuItem) => {
  const to = String(link.to || '')
  return to === '/services' || to === '/contact' || to.includes('/services') || to.includes('/contact')
}

// Séparation des liens en prioritaires et secondaires
const priorityLinks = computed(() => props.links.filter(link => isPriorityLink(link)))
const secondaryLinks = computed(() => props.links.filter(link => !isPriorityLink(link)))

// Fonction pour vérifier si un lien est actif
const isLinkActive = (link: NavigationMenuItem) => {
  return link.to && (route.path === String(link.to) || (String(link.to) !== '/' && route.path.startsWith(String(link.to))))
}

// Fonction pour déterminer le style du widget selon l'état actif/inactif et la priorité
const getWidgetClass = (link: NavigationMenuItem, isPriority: boolean) => {
  const isActive = isLinkActive(link)

  if (isActive) {
    // Style sobre pour l'item actif : fond subtil avec bordure et ring
    return 'bg-elevated/40 text-default border border-primary/30 ring-1 ring-primary/20'
  }

  // Style pour les items inactifs
  if (isPriority) {
    // Items prioritaires : style plus visible mais sobre
    return 'bg-elevated/20 text-default border border-default/20 hover:bg-elevated/35 hover:border-primary/30 hover:ring-1 hover:ring-primary/20'
  }

  // Items secondaires : style plus discret
  return 'bg-elevated/20 text-default/80 border border-default/10 hover:bg-elevated/35 hover:border-default/20'
}
</script>

<template>
  <ClientOnly>
    <div v-if="isReady" class="flex justify-end-safe">
      <UNavigationMenu
        v-if="!isMobile"
        :items="links"
        variant="link"
        color="neutral"
        :ui="{
          link: 'px-2 py-1 text-lg',
          linkLeadingIcon: 'hidden'
        }"
      >
        <template #list-trailing>
          <div class="flex items-center gap-2">
            <UButton
              v-if="showLocaleSwitcher && inactiveLocale"
              :label="inactiveLocale.code.toUpperCase()"
              size="sm"
              color="neutral"
              variant="ghost"
              @click="switchLocale(inactiveLocale.code)"
            />
            <ColorModeButton />
          </div>
        </template>
      </UNavigationMenu>

      <UButton
        v-if="isMobile"
        icon="i-lucide-menu"
        color="neutral"
        variant="subtle"
        class="ml-2"
        :aria-label="t('navigation.menu')"
        @click="slideoverOpen = true"
      />

      <USlideover v-model:open="slideoverOpen" side="right" close>
        <template #body>
          <div class="p-6">
            <!-- Liens prioritaires (Services, Contact) -->
            <div v-if="priorityLinks.length > 0" class="grid grid-cols-2 gap-4 mb-4">
              <ULink
                v-for="(link, index) in priorityLinks"
                :key="index"
                :to="link.to"
                :aria-label="link['aria-label'] || link.label"
                :aria-current="isLinkActive(link) ? 'page' : undefined"
                class="group relative flex flex-col items-start justify-between p-5 rounded-2xl transition-all duration-300 ease-out active:scale-95 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none min-h-[120px]"
                :class="getWidgetClass(link, true)"
                @click="slideoverOpen = false"
              >
                <div class="flex items-start justify-between w-full mb-3">
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="size-8 text-primary/90 group-hover:text-primary transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <div class="flex flex-col gap-1 w-full">
                  <span class="text-base font-medium leading-tight tracking-normal">
                    {{ link.label }}
                  </span>
                </div>
              </ULink>
            </div>

            <!-- Liens secondaires -->
            <div v-if="secondaryLinks.length > 0" class="grid grid-cols-2 gap-3">
              <ULink
                v-for="(link, index) in secondaryLinks"
                :key="index"
                :to="link.to"
                :aria-label="link['aria-label'] || link.label"
                :aria-current="isLinkActive(link) ? 'page' : undefined"
                class="group relative flex flex-col items-start justify-between p-5 rounded-2xl transition-all duration-300 ease-out active:scale-95 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none min-h-[100px]"
                :class="getWidgetClass(link, false)"
                @click="slideoverOpen = false"
              >
                <div class="flex items-start justify-between w-full mb-3">
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="size-7 opacity-80 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </div>
                <div class="flex flex-col gap-1 w-full">
                  <span class="text-base font-medium leading-tight tracking-normal">
                    {{ link.label }}
                  </span>
                </div>
              </ULink>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex flex-row gap-2 h-14 px-6 w-full items-center border-t border-default/10">
            <UButton
              v-for="(link, index) of socialLinks"
              :key="index"
              v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
              class="opacity-80 hover:opacity-100 transition-opacity"
            >
              <template v-if="link.icon" #leading>
                <UIcon :name="link.icon" aria-hidden="true" class="size-5" />
              </template>
            </UButton>
            <UButton
              v-if="showLocaleSwitcher && inactiveLocale"
              :label="inactiveLocale.code.toUpperCase()"
              size="sm"
              color="neutral"
              variant="ghost"
              block
              class="text-base opacity-80 hover:opacity-100 transition-opacity"
              @click.stop="switchLocale(inactiveLocale.code, $event)"
            />
            <ColorModeButton size="sm" class="opacity-80 hover:opacity-100 transition-opacity"/>
          </div>
        </template>
      </USlideover>
    </div>
  </ClientOnly>
</template>
