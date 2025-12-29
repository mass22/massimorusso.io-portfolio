// Types personnalisés pour la page d’index du portfolio

export type Hero = {
  tags: string[]
  links: {
    label: string
    icon?: string
    to?: string
    color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'solid' | 'outline' | 'subtle' | 'soft' | 'ghost' | 'link'
    target?: '_blank' | '_self'
  }[]
  images: {
    src: string
    alt: string
  }[]
  isResourcesAvailable?: boolean
}

export type FAQCategory = {
  title: string
  questions: {
    label: string
    content: string
  }[]
}

export type FAQ = {
  title: string
  description: string
  categories: FAQCategory[]
}

export type Testimonial = {
  quote: string
  author: {
    name: string
    description?: string
    avatar?: {
      src: string
      alt: string
    }
    to?: string
    twitter?: string
    username?: string
  }
}

export type IndexPage = {
  title: string
  description: string
  hero: Hero
  faq?: FAQ
  testimonials?: Testimonial[]
  // Ajoute ici les autres propriétés utiles (exemple: about, experience, etc.)
}
