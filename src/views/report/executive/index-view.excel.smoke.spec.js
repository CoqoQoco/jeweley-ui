// index-view.excel.smoke.spec.js — "Excel ทั้งหมด" ของหน้า executive: ยังมีทุก sheet เดิม + sheet ใหม่ของคลังสินค้า/ขายและเงิน/คลังวัตถุดิบ
// และยิง 3 endpoint insight ด้วย body เดียวกับแท็บ (stock/sales: {metal, months}; material: {kind, months} ไม่มี metal) — axios/ExcelHelper ถูก mock ทั้งหมด
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const exportMock = vi.hoisted(() => vi.fn(async () => {}))

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn(async () => ({})) } }
}))
vi.mock('@/services/utils/excel-js.js', () => ({ ExcelHelper: { exportToExcelMultiSheet: exportMock } }))

import ExecutiveIndexView from './index-view.vue'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

const EMPTY_INSIGHT = { problems: [], forecasts: [], actions: [], series: [], items: [], groups: [], workers: [], data: [], kpi: {} }

function respond(path) {
  if (path === 'StockInsight/Overview') return { ...EMPTY_INSIGHT, asOf: '2026-10-22T09:00:00', ageBuckets: [{ key: 'lt1y', count: 1, noCostCount: 0, costThb: 1, qty: 1 }], receiptTypes: [], categories: [] }
  if (path === 'SalesInsight/Overview') return { ...EMPTY_INSIGHT, asOf: '2026-10-22T09:00:00', aging: [], topCustomers: [] }
  if (path === 'MaterialInsight/Overview') return { ...EMPTY_INSIGHT, asOf: '2026-10-22T09:00:00' }
  return { ...EMPTY_INSIGHT }
}

function mountView() {
  return mount(ExecutiveIndexView, {
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key) => key, $route: { query: { tab: 'sales' } }, $router: { replace: vi.fn(() => Promise.resolve()), resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { summaryView: true, salesInsightView: true, stockInsightView: true, materialInsightView: true, flowView: true, productionInsightView: true }
    }
  })
}

describe('Executive Excel export includes the stock / sales / material insight sheets', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    exportMock.mockClear()
    postMock.mockImplementation(async (path) => respond(path))
  })

  it('requests the three insights with the tab bodies and appends their sheets after the existing ones', async () => {
    useMetalScopeStore().setMetal('SILVER')
    const wrapper = mountView()
    await flushPromises()
    useMetalScopeStore().setMetal('SILVER')
    wrapper.vm.metal = 'SILVER'
    await flushPromises()
    postMock.mockClear()

    await wrapper.vm.onExportExcel()

    const bodyOf = (path) => postMock.mock.calls.filter((c) => c[0] === path).map((c) => c[1])
    expect(bodyOf('StockInsight/Overview')).toEqual([{ months: 12, metal: 'SILVER' }])
    expect(bodyOf('SalesInsight/Overview')).toEqual([{ months: 12, metal: 'SILVER' }])
    expect(bodyOf('MaterialInsight/Overview')).toEqual([{ kind: 'GOLD', months: 12 }])

    expect(exportMock).toHaveBeenCalledTimes(1)
    const sheets = exportMock.mock.calls[0][0]
    const names = sheets.map((s) => s.sheetName)
    // sheet เดิมยังอยู่ครบ (สรุป ... + 7 sheet insight เดิม) และ sheet ใหม่ 12 ตัวต่อท้าย
    expect(names.slice(0, 3)).toEqual(['view.executive.excel.sheetSummary', 'view.executive.excel.sheetStalePlans', 'view.executive.excel.sheetReceivables'])
    expect(names).toContain('view.executive.excel.insight.sheetMaterials')
    expect(names.slice(-12)).toEqual(
      ['stockFindings', 'stockAge', 'stockReceipt', 'stockCategory', 'stockSeries', 'salesFindings', 'salesAging', 'salesTopCustomers', 'salesSeries', 'materialFindings', 'materialItems', 'materialSeries'].map(
        (key) => `view.executive.excel.snapshot.${key}`
      )
    )
    expect(new Set(names).size).toBe(names.length)
  })
})
