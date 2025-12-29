export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') {
    return
  }

  const router = useRouter()

  const scrollToTop = () => {
    window.scrollTo(0, 0)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }

  router.afterEach((to, from) => {
    // Ne pas scroller si on reste sur la même route (juste changement de hash)
    if (to.path === from.path && to.hash) {
      return
    }

    // Scroller immédiatement et avec un délai pour gérer les mises à jour du DOM
    scrollToTop()
    setTimeout(scrollToTop, 100)
  })
})

