// ยืนยันว่า store ฝั่ง API เติม `metal` ของทั้งหน้า /executive ให้ทุก POST ของ ExecutiveReport/ProductionInsight
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()
vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn() } }
}))

import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import { useProductionInsightApiStore } from './production/production-insight-api.js'
import { useExecutiveReportApiStore } from './report/executive-report-api.js'

describe('metal scope on API requests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue({})
  })

  it('defaults to ALL and follows the store value', async () => {
    const insight = useProductionInsightApiStore()
    await insight.fetchWip({})
    expect(postMock.mock.calls[0][1].metal).toBe('ALL')

    useMetalScopeStore().setMetal('SILVER')
    await insight.fetchMaterials({})
    expect(postMock.mock.calls[1][0]).toBe('ProductionInsight/Materials')
    expect(postMock.mock.calls[1][1].metal).toBe('SILVER')
  })

  it('covers paged insight endpoints and ExecutiveReport endpoints', async () => {
    useMetalScopeStore().setMetal('GOLD')
    const insight = useProductionInsightApiStore()
    const report = useExecutiveReportApiStore()
    await insight.fetchStalePlans({})
    await insight.fetchWorkers({})
    await report.fetchSummary()
    await report.fetchReceivables({})
    await report.fetchSalesOrdersWithoutInvoice({})
    await report.fetchStockHealth()
    expect(postMock.mock.calls.map((c) => c[1].metal)).toEqual(['GOLD', 'GOLD', 'GOLD', 'GOLD', 'GOLD', 'GOLD'])
  })

  it('keeps a metal the caller passes explicitly (gold tab) and does not scope Save endpoints', async () => {
    useMetalScopeStore().setMetal('ALL')
    const insight = useProductionInsightApiStore()
    await insight.fetchGold({ metal: 'SILVER' })
    expect(postMock.mock.calls[0][1].metal).toBe('SILVER')
    await insight.saveDeliveryTarget({ targetPercent: 80, remark: '' })
    expect(postMock.mock.calls[1][1]).not.toHaveProperty('metal')
  })
})
