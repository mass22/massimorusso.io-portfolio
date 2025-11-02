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
    slideoverOpen.value = false
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
    name: en.name,
    code: en.code,
    dir: en.dir,
    messages: en.messages ?? {}
  },
  fr: {
    name: fr.name,
    code: fr.code,
    dir: fr.dir,
    messages: fr.messages ?? {}
  }
}

const uiLocales = computed<UiLocale[]>(() => {
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
          code: item.code
        }
      }

      return {
        name: item.name ?? item.code,
        code: item.code,
        dir: (item.dir as 'ltr' | 'rtl') ?? 'ltr',
        messages: {}
      }
    })
    .filter((locale): locale is UiLocale => Boolean(locale))
})

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    if (value && value !== locale.value) {
      void setLocale(value)
    }
  }
})

const props = withDefaults(defineProps<{ links: NavigationMenuItem[], noLangSwitcher?: boolean }>(), {
  noLangSwitcher: false
})

const showLocaleSwitcher = computed(() => !props.noLangSwitcher && uiLocales.value.length > 0)
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
            <ULocaleSelect
              v-if="showLocaleSwitcher"
              v-model="selectedLocale"
              :locales="uiLocales"
              size="sm"
              color="neutral"
              variant="soft"
              class="w-32"
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
        @click="slideoverOpen = true"
      />

      <USlideover v-model:open="slideoverOpen" side="right" close>
        <template #body>
          <UNavigationMenu
            :items="links"
            orientation="vertical"
            variant="link"
            color="neutral"
            :ui="{ link: 'px-2 py-1 text-lg', linkLeadingIcon: 'hidden' }"
          />
        </template>
        <template #footer>
          <div class="flex flex-col gap-2">
            <UButton
              v-for="(link, index) of socialLinks"
              :key="index"
              v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
            />
            <ULocaleSelect
              v-if="showLocaleSwitcher"
              v-model="selectedLocale"
              :locales="uiLocales"
              size="sm"
              color="neutral"
              variant="soft"
              class="w-full"
            />
            <ColorModeButton />
          </div>
        </template>
      </USlideover>
    </div>
  </ClientOnly>
</template>
