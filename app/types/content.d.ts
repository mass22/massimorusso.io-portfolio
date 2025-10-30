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

export type IndexPage = {
  title: string
  description: string
  hero: Hero
  // Ajoute ici les autres propriétés utiles (exemple: about, experience, etc.)
}
