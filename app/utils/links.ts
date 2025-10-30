import type { NavigationMenuItem } from '@nuxt/ui'

export const navLinks: NavigationMenuItem[] = [{
  label: 'Home',
  icon: 'i-lucide-home',
  to: '/'
},
// {
//   label: 'Projects',
//   icon: 'i-lucide-folder',
//   to: '/projects'
// },
{
  label: 'Services',
  icon: 'i-lucide-folder',
  to: '/services'
},
{
  label: 'Blog',
  icon: 'i-lucide-file-text',
  to: '/blog'
}, {
  label: 'Speaking',
  icon: 'i-lucide-mic',
  to: '/speaking'
}, {
  label: 'About',
  icon: 'i-lucide-user',
  to: '/about'
}, {
  label: 'Contact',
  icon: 'i-lucide-mail',
  to: '/contact'
}]
