import type { LocalePathFunction } from '#i18n'
import type { NavigationMenuItem } from '@nuxt/ui'

type NavLinkDefinition = {
  key: string
  to: string
  icon?: NavigationMenuItem['icon']
  // Routes personnalisées par locale (optionnel)
  customRoutes?: {
    fr?: string
    en?: string
  }
}

const NAV_LINKS: NavLinkDefinition[] = [
  {
    icon: 'i-lucide-home', key: 'navigation.home', to: '/'
  },
  {
    icon: 'i-lucide-folder', key: 'navigation.services', to: '/services'
  },
  {
    icon: 'i-lucide-user', key: 'navigation.about', to: '/about',
    customRoutes: {
      fr: '/a-propos',
      en: '/en/about'
    }
  },
  {
    icon: 'i-lucide-file-text', key: 'navigation.blog', to: '/blog'
  },
  {
    icon: 'i-lucide-mic', key: 'navigation.speaking', to: '/speaking',
    customRoutes: {
      fr: '/conferences',
      en: '/en/speaking'
    }
  },
  {
    icon: 'i-lucide-headphones', key: 'navigation.podcast', to: '/podcast'
  },
  {
    icon: 'i-lucide-mail', key: 'navigation.contact', to: '/contact'
  }
]

export function getNavLinks(
  t: (key: string) => string,
  localePath?: LocalePathFunction,
  locale?: { value: string }
): NavigationMenuItem[] {
  return NAV_LINKS.map(({ key, to, customRoutes, ...rest }) => {
    const label = t(key)

    // Utiliser la route personnalisée si disponible, sinon utiliser localePath
    let finalTo = to
    if (customRoutes && locale) {
      if (locale.value === 'fr' && customRoutes.fr) {
        finalTo = customRoutes.fr
      } else if (locale.value === 'en' && customRoutes.en) {
        finalTo = customRoutes.en
      } else {
        finalTo = localePath ? localePath(to) : to
      }
    } else {
      finalTo = localePath ? localePath(to) : to
    }

    return {
      ...rest,
      label,
      'to': finalTo,
      'aria-label': label // S'assurer que chaque lien a un aria-label accessible
    } as NavigationMenuItem
  })
}

export const navLinkDefinitions = NAV_LINKS
