export default defineAppConfig({
  footer: {
    colorMode: false,
    creditsKey: 'footer.credits',
    links: [
      {
        ariaLabelKey: 'footer.links.linkedin',
        icon: 'i-simple-icons-linkedin',
        target: '_blank',
        to: 'https://www.linkedin.com/in/russomassimo'
      },
      {
        ariaLabelKey: 'footer.links.bluesky',
        icon: 'i-simple-icons-bluesky',
        target: '_blank',
        to: 'https://bsky.app/profile/massimorusso.bsky.social'
      },
      {
        ariaLabelKey: 'footer.links.github',
        icon: 'i-simple-icons-github',
        target: '_blank',
        to: 'https://github.com/mass22'
      },
      {
        ariaLabelKey: 'footer.links.twitter',
        icon: 'i-simple-icons-x',
        target: '_blank',
        to: 'https://x.com/Massimo_Russo_X'
      },
      {
        icon: 'i-simple-icons-discord',
        to: 'https://discord.com/invite/mass22', // Remplacez par votre lien réel
        target: '_blank',
        ariaLabelKey: 'footer.links.discord'
      }
    ]
  }, global: {
    available: true,
    email: 'ui-pro@nuxt.com',
    meetingLink: 'https://cal.com/massimorusso/let-s-connect',
    picture: {
      altKey: 'global.picture.alt',
      dark: '/hero/photo.webp',
      light: '/hero/photo.webp'
    }
  }, ui: {
    colors: {
      neutral: 'neutral',
      primary: 'blue'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl'
      }
    }
  }
})
