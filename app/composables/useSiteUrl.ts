/**
 * Composable pour obtenir l'URL du site de manière sûre
 * Utilise la configuration au lieu de useRequestURL() pour éviter localhost lors du prerender
 */
export function useSiteUrl(): string {
  const runtimeConfig = useRuntimeConfig()

  // Priorité 1: Variable d'environnement explicite
  const explicit = runtimeConfig.public?.siteUrl
  if (explicit && typeof explicit === 'string') {
    return explicit
  }

  // Priorité 2: Configuration i18n baseUrl
  const baseFromI18n = runtimeConfig.public?.i18n?.baseUrl
  if (baseFromI18n && typeof baseFromI18n === 'string') {
    return baseFromI18n
  }

  // Priorité 3: useRequestURL() seulement si disponible, pas en prerender, et pas localhost
  // Ne jamais utiliser useRequestURL() pendant le prerender car il n'est pas disponible
  if (import.meta.server && !import.meta.prerender) {
    try {
      const requestURL = useRequestURL()
      if (requestURL.origin && !requestURL.origin.includes('localhost')) {
        return requestURL.origin
      }
    } catch {
      // Ignore si useRequestURL() n'est pas disponible
    }
  }

  // Fallback: URL de production par défaut
  return 'https://massimorusso.io'
}
