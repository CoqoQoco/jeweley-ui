import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/plugins/i18n/config.js', () => ({
  i18n: { global: { t: (k) => k } }
}))

import { printLabel } from './print-bridge-service.js'

const mockFetch = (status, body) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  })

describe('printLabel', () => {
  beforeEach(() => vi.unstubAllGlobals())
  afterEach(() => vi.unstubAllGlobals())

  it('POSTs the payload to /print/label and returns the response', async () => {
    const fetchMock = mockFetch(200, { success: true })
    vi.stubGlobal('fetch', fetchMock)
    const payload = { printerName: 'PC42t', barcode: 'A1', copies: 2 }

    const res = await printLabel(payload)

    expect(res).toEqual({ success: true })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/print\/label$/)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual(payload)
  })

  it('throws the bridge error message', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { success: false, error: 'printer offline' }))
    await expect(printLabel({})).rejects.toThrow('printer offline')
  })

  it('throws the update-bridge message on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, {}))
    await expect(printLabel({})).rejects.toThrow('view.labelStation.updateBridgeRequired')
  })
})
