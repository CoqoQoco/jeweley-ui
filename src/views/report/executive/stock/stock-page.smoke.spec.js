// stock-page.smoke.spec.js — แท็บคลังสินค้าจริง (StockInsightView → InsightPage + stockConfig + block donut/bar/trend/kpi/table จริง) ด้วย response จำลองตาม contract
// ตรวจ: แท็บตั้งต้น = ปัญหา (ข้อความ finding + ข้อความระบุจำนวนเดือนข้อมูลขาย) · request body มีเฉพาะ key ที่อนุญาต · สลับแท็บ/ลิงก์/การ์ด KPI · sub= sync ·
// เปลี่ยน metal ยิงด้วย metal ใหม่ · donut/bar เรนเดอร์โดยไม่มี "Maximum recursive updates" หรือ warning reactive component
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))

import StockInsightView from '../components/stock-insight-view.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

const overview = {
  asOf: '2026-10-21T09:00:00',
  metal: 'ALL',
  status: 'critical',
  thresholds: { noCostWarnPercent: 20, noCostCriticalPercent: 40, aged5yWarnPercent: 30 },
  salesHistory: { startMonth: '2026-06-01', fullMonths: 4 },
  kpi: { inStockCount: 1000, inStockQty: 1200, onHandQty: 1300, noCostCount: 450, noCostPercent: 45, costThb: 5000000, costThbQty: 5100000, agedOver1yCount: 600, agedOver1yPercent: 60, agedOver5yCount: 350, agedOver5yPercent: 35, noProductionDateCount: 20 },
  ageBuckets: [
    { key: 'lt1y', count: 400, noCostCount: 40, costThb: 3000000, qty: 420, costThbQty: 3100000 },
    { key: 'y1to2', count: 200, noCostCount: 60, costThb: 1000000, qty: 210, costThbQty: 1000000 },
    { key: 'y2to5', count: 50, noCostCount: 10, costThb: 500000, qty: 50, costThbQty: 500000 },
    { key: 'gt5y', count: 350, noCostCount: 340, costThb: 500000, qty: 520, costThbQty: 500000 }
  ],
  receiptTypes: [
    { receiptType: 'PRODUCTION', count: 700, noCostCount: 100, qty: 720, costThb: 4000000 },
    { receiptType: null, count: 300, noCostCount: 300, qty: 300, costThb: 0 }
  ],
  categories: [
    { category: 'RING', categoryName: 'แหวน', count: 500, qty: 520, costThb: 2500000, noCostCount: 200, agedOver1yCount: 300 },
    { category: 'EARRING', categoryName: 'ต่างหู', count: 300, qty: 310, costThb: 1500000, noCostCount: 150, agedOver1yCount: 200 }
  ],
  series: [
    { month: '2026-09-01', inflowQty: 50, legacyImportQty: 0, saleQty: 30, returnQty: 2, outflowQty: 28, otherNetQty: 0, endStockQty: 1290 },
    { month: '2026-10-01', inflowQty: 10, legacyImportQty: 100, saleQty: 5, returnQty: 0, outflowQty: 5, otherNetQty: 0, endStockQty: 1300 }
  ],
  problems: [
    { code: 'STK_NO_COST_HIGH', severity: 'critical', params: { noCostCount: 450, inStockCount: 1000, percent: 45 }, reportRef: 'stkCost' },
    { code: 'STK_AGED_OVER_5Y', severity: 'warning', params: { count: 350, percent: 35 }, reportRef: 'stkAge' },
    { code: 'STK_NO_PRODUCTION_DATE', severity: 'warning', params: { count: 20 }, reportRef: 'stkAge' },
    { code: 'STK_NO_OUTFLOW', severity: 'warning', params: { months: 3, historyMonths: 4 }, reportRef: 'stkTrend' }
  ],
  forecasts: [
    { code: 'FC_STK_COVER_MONTHS', severity: 'warning', params: { coverMonths: 40, avgMonthlyOutflow: 32.5, endStockQty: 1300, direction: 'high', historyMonths: 4, windowMonths: 3 }, reportRef: 'stkTrend' },
    { code: 'FC_STK_AGING_PROJECTED', severity: 'warning', params: { fromPercent: 55, toPercent: 62, months: 6, historyMonths: 4, windowMonths: 3 }, reportRef: 'stkAge' }
  ],
  actions: [
    { code: 'ACT_PRICE_NO_COST', priority: 1, ownerRole: 'productionManager', relatedCodes: ['STK_NO_COST_HIGH'], params: { noCostCount: 450, percent: 45 } },
    { code: 'ACT_SLOW_INTAKE', priority: 2, ownerRole: 'planner', relatedCodes: ['FC_STK_COVER_MONTHS'], params: { coverMonths: 40, avgMonthlyOutflow: 32.5 } }
  ]
}

const warnings = []
let lastQuery

function mountView({ metal = 'ALL', initialSub = '' } = {}) {
  const replace = vi.fn((arg) => {
    lastQuery = arg.query
    return Promise.resolve()
  })
  const wrapper = mount(StockInsightView, {
    props: { metal, initialSub },
    global: {
      plugins: [PrimeVue],
      config: { warnHandler: (message) => warnings.push(message) },
      components: { apexchart: { name: 'apexchart', props: ['type', 'series', 'options', 'height'], template: '<div class="apex-stub" :data-type="type" />' } },
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { query: { tab: 'stock', other: '1' } },
        $router: { replace, push: vi.fn(), resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: { InfoTipGeneric: true }
    }
  })
  return { wrapper, replace }
}

const names = () => postMock.mock.calls.map((c) => c[0])
const settle = async () => {
  await flushPromises()
  await flushPromises()
}
const page = (wrapper) => wrapper.findComponent({ name: 'InsightPage' })
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const subTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

describe('Stock tab (InsightPage + stockConfig) smoke', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    warnings.length = 0
    lastQuery = undefined
    postMock.mockImplementation(async () => overview)
    getMock.mockImplementation(async () => ({}))
  })

  it('default tab is problems: one StockInsight/Overview request with exactly the allowed keys; no data tab is mounted', async () => {
    useMetalScopeStore().setMetal('SILVER')
    const { wrapper } = mountView({ metal: 'SILVER' })
    await settle()
    expect(names()).toEqual(['StockInsight/Overview'])
    expect(Object.keys(postMock.mock.calls[0][1]).sort()).toEqual(['metal', 'months'])
    expect(postMock.mock.calls[0][1]).toEqual({ metal: 'SILVER', months: 12 })
    ;['stkKpi', 'stkTrend', 'stkAge', 'stkCost', 'stkReceipt', 'stkCategory'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(page(wrapper).vm.currentSub).toBe('problems')
    expect(subTabs(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (4)',
      'view.productionInsight.tabs.forecasts (2)',
      'view.productionInsight.tabs.actions (2)',
      ...['overview', 'trend', 'age', 'cost', 'receipt', 'category'].map((k) => `view.productionInsight.stockInsight.tabs.${k}`)
    ])
  })

  it('findings use the stock rule texts incl. the sales-history caveat, forecasts remap the cover text, actions list the related finding', async () => {
    const { wrapper } = mountView()
    await settle()
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.stockInsight.rules.STK_NO_COST_HIGH:')
    expect(html).toContain('"noCostCount":450')
    expect(html).toContain('view.productionInsight.stockInsight.rules.STK_NO_PRODUCTION_DATE')

    page(wrapper).vm.selectSub('forecast')
    await settle()
    const forecastHtml = wrapper.html()
    expect(forecastHtml).toContain('view.productionInsight.stockInsight.rules.FC_STK_COVER_HIGH:')
    expect(forecastHtml).toContain('"historyMonths":4')
    expect(forecastHtml).toContain('view.productionInsight.stockInsight.rules.FC_STK_AGING_PROJECTED')

    page(wrapper).vm.selectSub('actions')
    await settle()
    const actionsHtml = wrapper.html()
    expect(actionsHtml).toContain('view.productionInsight.stockInsight.rules.ACT_PRICE_NO_COST')
    expect(actionsHtml).toContain('view.productionInsight.ownerRole.productionManager')
    expect(actionsHtml).toContain('view.productionInsight.relatedPrefix')
  })

  it('data tabs mount on first open without extra requests and render donut / bar / trend with no warnings', async () => {
    const { wrapper } = mountView()
    await settle()
    postMock.mockClear()

    for (const [tab, ids] of [
      ['overview', ['stkKpi', 'stkCostShare']],
      ['trend', ['stkTrend']],
      ['age', ['stkAge', 'stkAgeTable']],
      ['cost', ['stkCost', 'stkCostReceipt', 'stkCostLinks']],
      ['receipt', ['stkReceiptShare', 'stkReceipt']],
      ['category', ['stkCategory', 'stkCategoryTable']]
    ]) {
      page(wrapper).vm.selectSub(tab)
      await settle()
      ids.filter((id) => id !== 'stkCostLinks').forEach((id) => expect(anchor(wrapper, id), `${tab}:${id}`).toBe(true))
    }
    expect(postMock.mock.calls).toHaveLength(0)
    expect(wrapper.findAll('.apex-stub').some((el) => el.attributes('data-type') === 'donut')).toBe(true)
    expect(wrapper.findAll('.apex-stub').some((el) => el.attributes('data-type') === 'bar')).toBe(true)
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    // ตาราง: ประเภทรับ null เป็น "-" และคอลัมน์ ต้นทุนเป็นบาท
    expect(wrapper.html()).toContain('฿4,000,000')
    expect(wrapper.html()).toContain('view.productionInsight.stockInsight.receiptUnknown')
    expect(wrapper.text()).toContain('แหวน')
  })

  it('trend tab explains net outflow and shows the sales-history caveat', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('trend')
    await settle()
    expect(wrapper.text()).toContain('view.productionInsight.stockInsight.trendHintNet')
    expect(wrapper.text()).toContain('"start":"มิ.ย. 2026"')
    expect(wrapper.text()).toContain('"months":4')
  })

  it('cost tab: the price-review button navigates to the real route; quick price is only explained', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('cost')
    await settle()
    const button = wrapper.findAll('button').find((b) => b.text().includes('view.productionInsight.stockInsight.linkPriceReview'))
    expect(button).toBeTruthy()
    await button.trigger('click')
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'stock-product-price-review' })
  })

  it('"ดู ›" from findings lands on the tab of its block; KPI cards jump too', async () => {
    const { wrapper } = mountView()
    await settle()
    const list = wrapper.findAllComponents(InsightFindingList)[0]
    for (const [ref, tab] of [['stkCost', 'cost'], ['stkAge', 'age'], ['stkTrend', 'trend']]) {
      list.vm.$emit('goto-report', ref)
      await settle()
      expect(page(wrapper).vm.currentSub, ref).toBe(tab)
    }
    page(wrapper).vm.selectSub('overview')
    await settle()
    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(4)
    const expected = ['category', 'cost', 'cost', 'age']
    for (let i = 0; i < expected.length; i += 1) {
      page(wrapper).vm.selectSub('overview')
      await settle()
      await cards[i].trigger('click')
      await settle()
      expect(page(wrapper).vm.currentSub, `card ${i}`).toBe(expected[i])
    }
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('sub= is written to the URL (default omitted, other keys kept) and initialSub opens that tab', async () => {
    const { wrapper } = mountView({ initialSub: 'age' })
    await settle()
    expect(page(wrapper).vm.currentSub).toBe('age')
    expect(anchor(wrapper, 'stkAge')).toBe(true)

    page(wrapper).vm.selectSub('cost')
    await settle()
    expect(lastQuery).toMatchObject({ tab: 'stock', other: '1', sub: 'cost' })
    page(wrapper).vm.selectSub('problems')
    await settle()
    expect(lastQuery).not.toHaveProperty('sub')
    expect(lastQuery).toMatchObject({ tab: 'stock', other: '1' })
    expect(wrapper.emitted('update:sub').at(-1)).toEqual(['problems'])

    expect(mountView({ initialSub: 'bogus' }).wrapper.findComponent({ name: 'InsightPage' }).vm.currentSub).toBe('problems')
  })

  it('a new metal (parent remounts with key=metal) refetches once with that metal; refreshToken reloads', async () => {
    useMetalScopeStore().setMetal('GOLD')
    const first = mountView({ metal: 'GOLD' })
    await settle()
    expect(postMock.mock.calls.at(-1)[1]).toEqual({ metal: 'GOLD', months: 12 })
    first.wrapper.unmount()

    useMetalScopeStore().setMetal('ALL')
    const second = mountView({ metal: 'ALL' })
    await settle()
    expect(postMock.mock.calls.at(-1)[1]).toEqual({ metal: 'ALL', months: 12 })
    expect(postMock.mock.calls).toHaveLength(2)

    await second.wrapper.setProps({ refreshToken: 1 })
    await settle()
    expect(postMock.mock.calls).toHaveLength(3)
  })
})
