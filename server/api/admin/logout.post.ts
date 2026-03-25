import { deleteCookie } from 'h3'
import { ADMIN_SESSION_COOKIE_NAME } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  deleteCookie(event, ADMIN_SESSION_COOKIE_NAME, { path: '/' })
  return { ok: true }
})
