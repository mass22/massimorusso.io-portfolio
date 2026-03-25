export default defineNuxtRouteMiddleware(() => {
  // Ce middleware ne bloque plus l'accès côté UI en prod :
  // l'autorisation réelle se fait sur les endpoints (ex: `/api/leads`).
})
