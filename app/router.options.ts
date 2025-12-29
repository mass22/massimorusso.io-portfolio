import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Si on a une position sauvegardée (ex: bouton retour du navigateur), l'utiliser
    if (savedPosition) {
      return savedPosition
    }

    // Si la route a un hash, scroll vers cet élément
    if (to.hash) {
      return {
        el: to.hash,
        top: 80 // Offset pour le header fixe
      }
    }

    // Sinon, scroll vers le haut de la page (géré par le plugin)
    return { top: 0, left: 0 }
  }
}
