import { z } from 'zod'
import { createAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from '../../utils/adminSession'
import { setCookie } from 'h3'

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const body = await readBody(event).catch(() => null)
  const parsed = LoginBodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: 'Données invalides.' }
    })
  }

  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedEmail || !expectedPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin non configuré',
      data: { message: 'ADMIN_EMAIL / ADMIN_PASSWORD manquants.' }
    })
  }

  // Comparaison simple (projet interne). On hash pour limiter les fuites timing.
  const { createHash, timingSafeEqual } = await import('node:crypto')
  const hash = (s: string) => createHash('sha256').update(s).digest()

  const emailOk = timingSafeEqual(hash(parsed.data.email), hash(expectedEmail))
  const passwordOk = timingSafeEqual(hash(parsed.data.password), hash(expectedPassword))

  if (!emailOk || !passwordOk) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { message: 'Identifiants invalides.' }
    })
  }

  const token = createAdminSessionToken()

  setCookie(event, ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // maxAge en secondes si supporté
    maxAge: Math.floor((7 * 24 * 60 * 60))
  })

  return { ok: true }
})
