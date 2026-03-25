/**
 * Notification push gratuite : une URL HTTP (webhook).
 * Exemples :
 * - ntfy : https://ntfy.sh/votre-topic-ultra-secret (corps texte)
 * - Discord : URL du webhook (JSON { content })
 * - Slack : URL incoming webhook (JSON { text })
 *
 * Important (Vercel / serverless) : l’envoi doit être await dans le handler.
 * Un fetch « en arrière-plan » (void) est souvent coupé dès que la réponse part.
 */

const FETCH_TIMEOUT_MS = 12_000

function normalizeLeadNotifyUrl(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  try {
    if (/^https?:\/\//i.test(s)) {
      return new URL(s).toString()
    }
    return new URL(`https://${s}`).toString()
  } catch {
    console.warn('[notifyLeadWebhook] LEAD_NOTIFY_URL invalide')
    return null
  }
}

function isNtfyHost(hostname: string): boolean {
  return hostname === 'ntfy.sh' || hostname.endsWith('.ntfy.sh')
}

export async function notifyLeadWebhookCreated(payload: {
  leadId: number
  qualificationScore?: number
}): Promise<void> {
  const raw = process.env.LEAD_NOTIFY_URL
  const url = raw ? normalizeLeadNotifyUrl(raw) : null
  if (!url) return

  try {
    await sendNotify(url, payload)
    console.log('[notifyLeadWebhook] envoyé:', url.replace(/\/[^/]+$/, '/…'))
  } catch (e: unknown) {
    console.warn('[notifyLeadWebhook] échec (non bloquant):', e instanceof Error ? e.message : e)
  }
}

async function sendNotify(
  url: string,
  payload: { leadId: number, qualificationScore?: number }
): Promise<void> {
  const base = process.env.BASE_URL?.replace(/\/$/, '') || ''
  const dashboard = base ? `${base}/lead` : ''
  const score = payload.qualificationScore != null ? ` (score ${payload.qualificationScore})` : ''
  const text = `Nouveau lead #${payload.leadId}${score}${dashboard ? `\n${dashboard}` : ''}`

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('URL invalide après normalisation')
  }

  const isDiscord = url.includes('discord.com/api/webhooks')
  const isSlack = url.includes('hooks.slack.com')
  const isNtfy = isNtfyHost(parsed.hostname)

  let body: string
  const headers: Record<string, string> = {}

  if (isDiscord) {
    body = JSON.stringify({ content: text })
    headers['Content-Type'] = 'application/json'
  } else if (isSlack) {
    body = JSON.stringify({ text })
    headers['Content-Type'] = 'application/json'
  } else {
    body = text
    headers['Content-Type'] = 'text/plain; charset=utf-8'
    if (isNtfy) {
      headers.Title = 'Nouveau lead'
      headers.Priority = 'high'
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      body,
      headers,
      signal: controller.signal
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.warn('[notifyLeadWebhook] HTTP', res.status, errBody.slice(0, 200))
    }
  } finally {
    clearTimeout(timer)
  }
}
