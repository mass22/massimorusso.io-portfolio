import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('notifyLeadWebhook', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubEnv('BASE_URL', 'https://example.com/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    globalThis.fetch = originalFetch
  })

  it('ne fait rien sans LEAD_NOTIFY_URL', async () => {
    vi.stubEnv('LEAD_NOTIFY_URL', '')
    const fetchMock = vi.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { notifyLeadWebhookCreated } = await import('~/server/utils/notifyLeadWebhook')
    await notifyLeadWebhookCreated({ leadId: 1 })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envoie du texte en plain pour ntfy', async () => {
    vi.stubEnv('LEAD_NOTIFY_URL', 'https://ntfy.sh/my-topic')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { notifyLeadWebhookCreated } = await import('~/server/utils/notifyLeadWebhook')
    await notifyLeadWebhookCreated({ leadId: 42, qualificationScore: 5 })

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://ntfy.sh/my-topic')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      'Content-Type': 'text/plain; charset=utf-8',
      'Title': 'Nouveau lead',
      'Priority': 'high'
    })
    expect(init.body).toContain('Nouveau lead #42')
    expect(init.body).toContain('score 5')
    expect(init.body).toContain('https://example.com/lead')
  })

  it('ajoute https:// si l’URL n’a pas de schéma (ntfy)', async () => {
    vi.stubEnv('LEAD_NOTIFY_URL', 'ntfy.sh/my-topic')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { notifyLeadWebhookCreated } = await import('~/server/utils/notifyLeadWebhook')
    await notifyLeadWebhookCreated({ leadId: 7 })

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://ntfy.sh/my-topic')
  })

  it('envoie du JSON pour Discord', async () => {
    vi.stubEnv('LEAD_NOTIFY_URL', 'https://discord.com/api/webhooks/abc/def')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { notifyLeadWebhookCreated } = await import('~/server/utils/notifyLeadWebhook')
    await notifyLeadWebhookCreated({ leadId: 1 })

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    const parsed = JSON.parse(String(init.body))
    expect(parsed.content).toContain('Nouveau lead #1')
  })
})
