import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE_NAME = 'admin_session'

const base64UrlEncode = (input: Buffer | string): string => {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

const base64UrlDecode = (input: string): string => {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64').toString('utf8')
}

type AdminSessionPayload = {
  v: 1
  exp: number
}

const getAdminSessionSecret = (): string => {
  const secret = process.env.ADMIN_AUTH_SECRET
  if (!secret) {
    throw new Error('ADMIN_AUTH_SECRET manquant. Configurez-le pour activer l’auth admin.')
  }
  return secret
}

const getTtlMs = (): number => {
  const raw = process.env.ADMIN_SESSION_TTL_MS
  const ttl = raw ? Number(raw) : 7 * 24 * 60 * 60 * 1000
  if (!Number.isFinite(ttl) || ttl <= 0) {
    return 7 * 24 * 60 * 60 * 1000
  }
  return ttl
}

export function createAdminSessionToken(): string {
  const secret = getAdminSessionSecret()
  const payload: AdminSessionPayload = {
    v: 1,
    exp: Date.now() + getTtlMs()
  }

  const payloadStr = JSON.stringify(payload)
  const payloadB64 = base64UrlEncode(payloadStr)
  const sig = createHmac('sha256', secret).update(payloadB64).digest()
  const sigB64 = base64UrlEncode(sig)

  return `v1.${payloadB64}.${sigB64}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false

  // Après le contrôle de longueur, on force un tuple 3 éléments pour éviter des `string | undefined`.
  const [version, payloadB64, sigB64] = parts as [string, string, string]
  if (version !== 'v1') return false

  try {
    const secret = getAdminSessionSecret()
    const expectedSig = createHmac('sha256', secret).update(payloadB64).digest()
    const expectedSigB64 = base64UrlEncode(expectedSig)

    // timingSafeEqual pour éviter des timings différents
    const a = Buffer.from(sigB64)
    const b = Buffer.from(expectedSigB64)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false

    const payloadStr = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadStr) as AdminSessionPayload
    if (!payload || payload.v !== 1) return false
    if (typeof payload.exp !== 'number') return false
    return payload.exp > Date.now()
  } catch {
    return false
  }
}
