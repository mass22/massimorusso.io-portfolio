export default defineEventHandler((event) => {
  // Ajouter des headers de cache pour les routes IPX (images optimisées)
  if (event.path.startsWith('/_ipx/')) {
    event.node.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
})
