<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, fr } from '@nuxt/ui/locale'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const { footer } = useAppConfig()
const { t, locale, setLocale, locales: availableLocales } = useI18n()

const socialLinks = computed(() => footer?.links?.map(link => ({
  ...link,
  'aria-label': t(link.ariaLabelKey)
})) ?? [])

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
    void setLocale(targetLocale as 'fr' | 'en').finally(() => {
      // Réinitialiser après un court délai pour permettre la navigation
      setTimeout(() => {
        isSwitchingLocale.value = false
      }, 100)
    })
  }
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
          <UNavigationMenu
            :items="links"
            orientation="vertical"
            variant="link"
            color="neutral"
            :ui="{ link: 'px-2 py-1 text-lg', linkLeadingIcon: 'size-5' }"
          />
        </template>
        <template #footer>
          <div class="flex flex-row gap-2">
            <UButton
              v-for="(link, index) of socialLinks"
              :key="index"
              v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
            >
              <template v-if="link.icon" #leading>
                <UIcon :name="link.icon" aria-hidden="true" />
              </template>
            </UButton>
            <UButton
              v-if="showLocaleSwitcher && inactiveLocale"
              :label="inactiveLocale.code.toUpperCase()"
              size="sm"
              color="neutral"
              variant="ghost"
              block
              @click.stop="switchLocale(inactiveLocale.code, $event)"
            />
            <ColorModeButton />
          </div>
        </template>
      </USlideover>
    </div>
  </ClientOnly>
</template>
