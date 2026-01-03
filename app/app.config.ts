export default defineAppConfig({
  footer: {
    creditsKey: 'footer.credits',
    colorMode: false,
    links: [
      {
        icon: 'i-simple-icons-linkedin',
        to: 'https://www.linkedin.com/in/russomassimo-frontend-consultant',
        target: '_blank',
        ariaLabelKey: 'footer.links.linkedin'
      },
      {
        icon: 'i-simple-icons-bluesky',
        to: 'https://bsky.app/profile/massimorusso.bsky.social',
        target: '_blank',
        ariaLabelKey: 'footer.links.bluesky'
      }]
  }, global: {
    picture: {
      dark: '/hero/avatar.webp',
      light: '/hero/avatar.webp',
      altKey: 'global.picture.alt'
    },
    meetingLink: 'https://cal.com/massimorusso/let-s-connect',
    email: 'ui-pro@nuxt.com',
    available: true
  }, ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  }
})
