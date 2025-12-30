/**
 * Rate limiting simple en mémoire par IP
 * Pour la production, considérez utiliser Redis ou un service dédié
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Nettoie les entrées expirées (appelé périodiquement)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Vérifie si une IP a dépassé la limite de taux
 * @param ip L'adresse IP du client
 * @param maxRequests Nombre maximum de requêtes
 * @param windowMs Fenêtre de temps en millisecondes
 * @returns true si la limite est dépassée, false sinon
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute par défaut
): boolean {
  // Nettoyer les entrées expirées toutes les 100 requêtes environ
  if (rateLimitStore.size % 100 === 0) {
    cleanupExpiredEntries()
  }

  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || entry.resetAt < now) {
    // Créer ou réinitialiser l'entrée
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + windowMs
    })
    return false
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier si la limite est dépassée
  if (entry.count > maxRequests) {
    return true
  }

  return false
}

/**
 * Obtient le nombre de requêtes restantes pour une IP
 * @param ip L'adresse IP du client
 * @param maxRequests Nombre maximum de requêtes
 * @returns Le nombre de requêtes restantes
 */
export function getRemainingRequests(
  ip: string,
  maxRequests: number = 5
): number {
  const entry = rateLimitStore.get(ip)
  if (!entry || entry.resetAt < Date.now()) {
    return maxRequests
  }
  return Math.max(0, maxRequests - entry.count)
}

/**
 * Obtient le temps restant avant la réinitialisation (en secondes)
 * @param ip L'adresse IP du client
 * @returns Le temps restant en secondes, ou 0 si aucune limite active
 */
export function getResetTime(ip: string): number {
  const entry = rateLimitStore.get(ip)
  if (!entry || entry.resetAt < Date.now()) {
    return 0
  }
  return Math.ceil((entry.resetAt - Date.now()) / 1000)
}

