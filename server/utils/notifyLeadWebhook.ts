/**
 * Notification push gratuite : une URL HTTP (webhook).
 * Exemples :
 * - ntfy : https://ntfy.sh/votre-topic-ultra-secret (corps texte)
 * - Discord : URL du webhook (JSON { content })
 * - Slack : URL incoming webhook (JSON { text })
 */

const FETCH_TIMEOUT_MS = 12_000

export function notifyLeadWebhookCreated(payload: {
  leadId: number
  qualificationScore?: number
}): void {
  const url = process.env.LEAD_NOTIFY_URL?.trim()
  if (!url) return

  void sendNotify(url, payload).catch((e: unknown) => {
    console.warn('[notifyLeadWebhook] échec (non bloquant):', e instanceof Error ? e.message : e)
  })
}

async function sendNotify(
  url: string,
  payload: { leadId: number, qualificationScore?: number }
): Promise<void> {
  const base = process.env.BASE_URL?.replace(/\/$/, '') || ''
  const dashboard = base ? `${base}/lead` : ''
  const score = payload.qualificationScore != null ? ` (score ${payload.qualificationScore})` : ''
  const text = `Nouveau lead #${payload.leadId}${score}${dashboard ? `\n${dashboard}` : ''}`

  const isDiscord = url.includes('discord.com/api/webhooks')
  const isSlack = url.includes('hooks.slack.com')

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
