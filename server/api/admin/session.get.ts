import { getCookie } from 'h3'
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, ADMIN_SESSION_COOKIE_NAME)
  const authenticated = verifyAdminSessionToken(token)

  return { authenticated }
})
