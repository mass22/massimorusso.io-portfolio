import type { LocalePathFunction } from '#i18n'
import type { NavigationMenuItem } from '@nuxt/ui'

type NavLinkDefinition = {
  key: string
  to: string
  icon?: NavigationMenuItem['icon']
}

const NAV_LINKS: NavLinkDefinition[] = [
  {
    icon: 'i-lucide-home', key: 'navigation.home', to: '/'
  },
  {
    icon: 'i-lucide-folder', key: 'navigation.services', to: '/services'
  },
  {
    icon: 'i-lucide-user', key: 'navigation.about', to: '/about'
  },
  {
    icon: 'i-lucide-file-text', key: 'navigation.blog', to: '/blog'
  },
  {
    icon: 'i-lucide-mic', key: 'navigation.speaking', to: '/speaking'
  },
  {
    icon: 'i-lucide-mail', key: 'navigation.contact', to: '/contact'
  }
]

export function getNavLinks(
  t: (key: string) => string,
  localePath?: LocalePathFunction
): NavigationMenuItem[] {
  return NAV_LINKS.map(({ key, to, ...rest }) => {
    const label = t(key)
    return {
      ...rest,
      label,
      'to': localePath ? localePath(to) : to,
      'aria-label': label // S'assurer que chaque lien a un aria-label accessible
    } as NavigationMenuItem
  })
}

export const navLinkDefinitions = NAV_LINKS
