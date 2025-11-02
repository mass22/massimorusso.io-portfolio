import type { NavigationMenuItem } from '@nuxt/ui'
import type { LocalePathFunction } from '#i18n'

type NavLinkDefinition = {
  key: string
  to: string
  icon?: NavigationMenuItem['icon']
}

const NAV_LINKS: NavLinkDefinition[] = [
  {
    key: 'navigation.home',
    icon: 'i-lucide-home',
    to: '/'
  },
  {
    key: 'navigation.services',
    icon: 'i-lucide-folder',
    to: '/services'
  },
  {
    key: 'navigation.blog',
    icon: 'i-lucide-file-text',
    to: '/blog'
  },
  {
    key: 'navigation.speaking',
    icon: 'i-lucide-mic',
    to: '/speaking'
  },
  {
    key: 'navigation.about',
    icon: 'i-lucide-user',
    to: '/about'
  },
  {
    key: 'navigation.contact',
    icon: 'i-lucide-mail',
    to: '/contact'
  }
]

export function getNavLinks (
  t: (key: string) => string,
  localePath?: LocalePathFunction
): NavigationMenuItem[] {
  return NAV_LINKS.map(({ key, to, ...rest }) => ({
    ...rest,
    label: t(key),
    to: localePath ? localePath(to) : to
  }))
}

export const navLinkDefinitions = NAV_LINKS
