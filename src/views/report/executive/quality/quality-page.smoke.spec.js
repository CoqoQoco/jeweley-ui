// quality-page.smoke.spec.js — แท็บคุณภาพข้อมูลจริง (QualityInsightView → InsightPage + qualityConfig) ด้วย response จำลองตาม contract
// ตรวจ: request body · KPI + ตารางตัวตรวจ (ซ่อน available=false) · ข้อความ finding/action · [ดู ›] ส่ง navigate ขึ้น parent · API ล้ม = หน้ายังอยู่ · แท็บคาดการณ์ว่าง
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn(async () => ({})) } }
}))

import QualityInsightView from '../components/quality-insight-view.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

const overview = {
  asOf: '2026-10-22T09:00:00',
  metal: 'ALL',
  status: 'critical',
  thresholds: { warnPercent: 5, criticalPercent: 20 },
  kpi: { total: 3, warningCount: 1, criticalCount: 1, passedCount: 1, affectedTabs: ['stock', 'sales'] },
  checks: [
    { code: 'NO_COST', count: 23915, total: 29286, ratio: 81.66, severity: 'critical', impact: 'stockValuation', tab: 'stock', reportRef: 'stkCost', available: true, params: {} },
    { code: 'INVOICE_NO_DUE', count: 5, total: 100, ratio: 5, severity: 'warning', impact: 'receivableAging', tab: 'sales', reportRef: 'salDue', available: true, params: {} },
    { code: 'SO_NO_INVOICE', count: 0, total: 10, ratio: 0, severity: 'ok', impact: 'revenueRecognition', tab: 'sales', reportRef: 'salSo', available: true, params: {} },
    { code: 'PLACEHOLDER_WORKER_WIP', count: 0, total: 0, ratio: 0, severity: 'ok', impact: 'workerAccountability', tab: 'production', reportRef: 'wrkTable', available: false, params: {} }
  ],
  problems: [
    { code: 'DQ_NO_COST', severity: 'critical', params: { count: 23915, total: 29286, ratio: 81.66 }, reportRef: 'stkCost' },
    { code: 'DQ_INVOICE_NO_DUE', severity: 'warning', params: { count: 5, total: 100, ratio: 5 }, reportRef: 'salDue' }
  ],
  forecasts: [],
  actions: [{ code: 'ACT_DQ_PRICE_NO_COST', ownerRole: 'productionManager', relatedCodes: ['DQ_NO_COST'], params: {} }]
}

function mountView(props = {}) {
  const replace = vi.fn(() => Promise.resolve())
  const wrapper = mount(QualityInsightView, {
    props: { metal: 'ALL', ...props },
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { query: { tab: 'quality' } },
        $router: { replace, push: vi.fn(), resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: { InfoTipGeneric: true }
    }
  })
  return { wrapper, replace }
}

const settle = async () => {
  await flushPromises()
  await flushPromises()
}
const page = (wrapper) => wrapper.findComponent({ name: 'InsightPage' })
const subTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

describe('Data quality tab (InsightPage + qualityConfig) smoke', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockImplementation(async () => overview)
  })

  it('requests DataQuality once with only the page metal; default tab is problems; the data tab is not mounted yet', async () => {
    useMetalScopeStore().setMetal('SILVER')
    const { wrapper } = mountView({ metal: 'SILVER' })
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['ExecutiveReport/DataQuality'])
    expect(postMock.mock.calls[0][1]).toEqual({ metal: 'SILVER' })
    expect(page(wrapper).vm.currentSub).toBe('problems')
    expect(subTabs(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (2)',
      'view.productionInsight.tabs.forecasts (0)',
      'view.productionInsight.tabs.actions (1)',
      'view.productionInsight.qualityInsight.tabs.overview'
    ])
    expect(wrapper.find('#insight-report-dqChecks').exists()).toBe(false)
  })

  it('finding and action texts use the quality rules (numbers formatted) and the owner role label', async () => {
    const { wrapper } = mountView()
    await settle()
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.qualityInsight.rules.DQ_NO_COST:')
    expect(html).toContain('23,915')
    expect(html).toContain('view.productionInsight.qualityInsight.rules.DQ_INVOICE_NO_DUE')
    page(wrapper).vm.selectSub('actions')
    await settle()
    expect(wrapper.html()).toContain('view.productionInsight.qualityInsight.rules.ACT_DQ_PRICE_NO_COST')
    expect(wrapper.html()).toContain('view.productionInsight.ownerRole.productionManager')
  })

  it('forecast tab shows the standard empty state (no forecasts)', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('forecast')
    await settle()
    expect(wrapper.html()).toContain('view.productionInsight.findingEmpty')
  })

  it('overview tab: KPI numbers, available checks only (the unavailable one is hidden), status chips', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('overview')
    await settle()
    expect(wrapper.find('#insight-report-dqKpi').exists()).toBe(true)
    const table = wrapper.find('#insight-report-dqChecks')
    expect(table.exists()).toBe(true)
    const text = table.text()
    expect(text).toContain('view.productionInsight.qualityInsight.checks.NO_COST')
    expect(text).toContain('view.productionInsight.qualityInsight.checks.INVOICE_NO_DUE')
    expect(text).toContain('view.productionInsight.qualityInsight.checks.SO_NO_INVOICE')
    expect(text).not.toContain('PLACEHOLDER_WORKER_WIP')
    expect(text).toContain('81.7%')
    expect(text).toContain('23,915')
    expect(text).toContain('view.productionInsight.status.critical')
    expect(text).toContain('view.productionInsight.status.ok')
    expect(wrapper.find('#insight-report-dqKpi').text()).toContain('view.productionInsight.qualityInsight.kpi.problems')
  })

  it('[ดู ›] on a check row emits navigate(domain, target) for the parent', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('overview')
    await settle()
    const view = wrapper.findAll('#insight-report-dqChecks button').filter((b) => b.text().includes('qualityInsight.viewLabel'))
    expect(view).toHaveLength(3)
    await view[1].trigger('click')
    expect(wrapper.emitted('navigate').at(-1)).toEqual(['sales', { tab: 'sales', reportRef: 'salDue', code: 'DQ_INVOICE_NO_DUE', params: { dueFilter: 'noDue' } }])
  })

  it('[ดู ›] on a finding emits navigate for the finding domain', async () => {
    const { wrapper } = mountView()
    await settle()
    wrapper.findAllComponents(InsightFindingList)[0].vm.$emit('goto-report', 'stkCost', { findingCode: 'DQ_NO_COST' })
    await settle()
    expect(wrapper.emitted('navigate').at(-1)).toEqual(['stock', { tab: 'stock', reportRef: 'stkCost', code: 'DQ_NO_COST', params: {} }])
  })

  it('sub= sync keeps the quality tab in the URL; a failed API does not break the page', async () => {
    const { wrapper, replace } = mountView()
    await settle()
    page(wrapper).vm.selectSub('overview')
    await settle()
    expect(replace.mock.calls.at(-1)[0].query).toMatchObject({ tab: 'quality', sub: 'overview' })

    postMock.mockReset()
    postMock.mockImplementation(async () => {
      throw new Error('boom')
    })
    const failed = mountView({ initialSub: 'overview' })
    await settle()
    expect(failed.wrapper.find('#insight-report-dqChecks').exists()).toBe(true)
    expect(failed.wrapper.text()).toContain('view.productionInsight.qualityInsight.emptyChecks')
  })
})
