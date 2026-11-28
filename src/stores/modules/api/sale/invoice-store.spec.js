import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const post = vi.fn()
vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...a) => post(...a), get: vi.fn() } }
}))

import { useInvoiceApiStore } from './invoice-store.js'

describe('invoice-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    post.mockReset()
    post.mockResolvedValue({ data: { data: [], total: 0 } })
  })

  it('fetchList sends soNumber and invoiceNumber in search', async () => {
    const store = useInvoiceApiStore()
    await store.fetchList({ formValue: { invoiceNumber: 'X1', soNumber: 'SO260910006' } })
    const body = post.mock.calls[0][1]
    expect(body.search.soNumber).toBe('SO260910006')
    expect(body.search.invoiceNumber).toBe('X1')
  })

  it('createPrintLog passes invoiceRunning through', async () => {
    const store = useInvoiceApiStore()
    await store.createPrintLog({ invoiceNumber: 'EDITED', invoiceRunning: 'SYS-1', paperType: 'a4', data: '{}' })
    expect(post.mock.calls[0][0]).toBe('Invoice/PrintLog/Create')
    expect(post.mock.calls[0][1]).toMatchObject({ invoiceNumber: 'EDITED', invoiceRunning: 'SYS-1' })
  })
})
