import type { IndexCollectionItem } from '@nuxt/content'
import type { FAQ } from './content'

export type ServiceItem = {
  slug: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  icon?: string
}

export type ProcessStep = {
  title: string
  description: string
}

export type Process = {
  title: string
  description: string
  steps: ProcessStep[]
}

export type Stat = {
  value: string
  label: string
  icon?: string
}

export type CTALink = {
  label: string
  href: string
}

export type CTA = {
  title: string
  description: string
  primary?: CTALink
  secondary?: CTALink
}

export type ServicesPage = IndexCollectionItem & {
  content?: string
  heroSupportingLine?: string
  items?: ServiceItem[]
  itemsIntro?: string
  process?: Process
  processLeadIn?: string
  stats?: Stat[]
  statsEnabled?: boolean
  faq?: FAQ
  cta?: CTA
}
