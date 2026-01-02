export default defineNuxtRouteMiddleware(() => {
  // Bloquer complètement l'accès en production
  // Cette page n'est accessible qu'en développement
  if (!import.meta.dev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cette page n\'est accessible qu\'en mode développement'
    })
  }
})
