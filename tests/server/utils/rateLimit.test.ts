import { describe, it, expect } from 'vitest'
import { checkRateLimit, getRemainingRequests, getResetTime } from '~/server/utils/rateLimit'

describe('rateLimit', () => {
  describe('checkRateLimit', () => {
    it('devrait autoriser les requêtes sous la limite', () => {
      const ip = '192.168.1.201'
      const maxRequests = 5
      const windowMs = 60000

      for (let i = 0; i < maxRequests; i++) {
        const limited = checkRateLimit(ip, maxRequests, windowMs)
        expect(limited).toBe(false)
      }
    })

    it('devrait bloquer après dépassement de la limite', () => {
      const ip = '192.168.1.202'
      const maxRequests = 3
      const windowMs = 60000

      expect(checkRateLimit(ip, maxRequests, windowMs)).toBe(false)
      expect(checkRateLimit(ip, maxRequests, windowMs)).toBe(false)
      expect(checkRateLimit(ip, maxRequests, windowMs)).toBe(false)

      expect(checkRateLimit(ip, maxRequests, windowMs)).toBe(true)
      expect(checkRateLimit(ip, maxRequests, windowMs)).toBe(true)
    })

    it('devrait utiliser les valeurs par défaut (5 req, 60s)', () => {
      const limited = checkRateLimit('192.168.1.203')
      expect(limited).toBe(false)
    })
  })

  describe('getRemainingRequests', () => {
    it('devrait retourner maxRequests pour une IP sans historique', () => {
      const remaining = getRemainingRequests('10.0.0.99', 5)
      expect(remaining).toBe(5)
    })

    it('devrait diminuer après des requêtes', () => {
      const ip = '192.168.1.204'
      const maxRequests = 5
      const windowMs = 60000

      checkRateLimit(ip, maxRequests, windowMs)
      checkRateLimit(ip, maxRequests, windowMs)

      const remaining = getRemainingRequests(ip, maxRequests)
      expect(remaining).toBe(3) // 5 - 2 = 3
    })
  })

  describe('getResetTime', () => {
    it('devrait retourner 0 pour une IP sans limite active', () => {
      const resetTime = getResetTime('10.0.0.88')
      expect(resetTime).toBe(0)
    })

    it('devrait retourner un temps positif après une requête', () => {
      const ip = '192.168.1.205'
      checkRateLimit(ip, 5, 60000)
      const resetTime = getResetTime(ip)
      expect(resetTime).toBeGreaterThan(0)
      expect(resetTime).toBeLessThanOrEqual(60)
    })
  })
})
