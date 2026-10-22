// sales-page.smoke.spec.js — แท็บขายและเงินจริง (SalesInsightView → InsightPage + salesConfig + donut/bar/trend/kpi/table/planTable จริง) ด้วย response จำลองตาม contract
// ตรวจ: แท็บตั้งต้น = ปัญหา (ข้อความ finding รวมกิ่ง info/warning + ป้ายผู้จัดการฝ่ายขาย) · request body เป็น {metal, months} · ตารางบิลยิงเฉพาะที่เลือก ·
// ลิงก์/การ์ด KPI → แท็บ+ตัวสลับ · target จากการ์ดสรุป · sub= sync · donut/bar ไม่มี warning recursive/reactive
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))

import SalesInsightView from '../components/sales-insight-view.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

const overview = {
  asOf: '2026-10-21T09:00:00',
  metal: 'ALL',
  status: 'warning',
  thresholds: { overdueWarnPercent: 20, overdueCriticalPercent: 40 },
  salesHistory: { startMonth: '2026-06-01', fullMonths: 4 },
  kpi: { totalInvoiceCount: 180, totalGrandThb: 10000000, outstandingCount: 80, outstandingThb: 4000000, overdueCount: 30, overdueThb: 1500000, overduePercent: 37.5, paidPercent: 60, noDueDateCount: 3, noDueDatePercent: 4, noDueDateAllCount: 40, oldestOverdueDays: 120, topCustomerPercent: 55, soNotInvoicedCount: 5, soNotInvoicedThb: 700000, soDeliveryOverdueCount: 2, soNoDeliveryDateCount: 1 },
  paymentStates: [
    { key: 'received', count: 100, amountThb: 6000000 },
    { key: 'unpaidNotDue', count: 50, amountThb: 2500000 },
    { key: 'overdue', count: 30, amountThb: 1500000 }
  ],
  aging: [
    { key: 'notDue', count: 50, amountThb: 2500000 },
    { key: 'd1_30', count: 10, amountThb: 500000 },
    { key: 'd31_60', count: 8, amountThb: 400000 },
    { key: 'd61_90', count: 5, amountThb: 300000 },
    { key: 'gt90', count: 7, amountThb: 300000 }
  ],
  topCustomers: [{ customerCode: 'C1', customerName: 'บริษัท ก', count: 12, outstandingThb: 2200000, overdueThb: 900000 }],
  collection: {},
  series: [
    { month: '2026-08-01', invoiceCount: 30, grandTotalThb: 2000000 },
    { month: '2026-09-01', invoiceCount: 120, grandTotalThb: 6000000 }
  ],
  problems: [
    { code: 'SAL_OVERDUE_RECEIVABLE', severity: 'warning', params: { overdueThb: 1500000, overdueCount: 30, outstandingThb: 4000000, percent: 37.5 }, reportRef: 'salAging' },
    { code: 'SAL_OLDEST_OVERDUE', severity: 'warning', params: { days: 120, customerName: 'บริษัท ก' }, reportRef: 'salDue' },
    { code: 'SAL_NO_DUE_DATE', severity: 'warning', params: { count: 3, percent: 4 }, reportRef: 'salDue' },
    { code: 'SAL_SO_NOT_INVOICED', severity: 'warning', params: { count: 5, amountThb: 700000, overdueDeliveryCount: 2, noDeliveryDateCount: 1 }, reportRef: 'salSo' }
  ],
  forecasts: [
    { code: 'FC_SAL_COLLECTION', severity: 'info', params: { amountThb: 800000, count: 9, windowDays: 30 }, reportRef: 'salDue' },
    { code: 'FC_SAL_BECOMING_OVERDUE', severity: 'warning', params: { amountThb: 300000, count: 4, days: 14 }, reportRef: 'salDue' }
  ],
  actions: [{ code: 'ACT_FOLLOW_OVERDUE', priority: 1, ownerRole: 'saleManager', relatedCodes: ['SAL_OVERDUE_RECEIVABLE'], params: { overdueThb: 1500000, overdueCount: 30, topCustomerName: 'บริษัท ก' } }]
}

const invoice = (running, state = 'unpaid') => ({ running, dkInvoiceNumber: `INV-${running}`, customerName: 'ลูกค้า', createDate: '2026-09-01T00:00:00', dueDate: '2026-09-30T00:00:00', grandTotalThb: 1000, outstanding: 1000, currencyUnit: 'THB', paymentState: state, salePerson: 'พนักงาน' })

function respond(path, body) {
  if (path === 'SalesInsight/Overview') return overview
  if (path === 'ExecutiveReport/Receivables') return { data: [invoice(`${body.filter}-1`)], total: 1 }
  if (path === 'ExecutiveReport/SalesOrdersWithoutInvoice') return { data: [{ soNumber: 'SO-1', customerName: 'ลูกค้า', soDate: '2026-09-01T00:00:00', deliveryDate: null, grandTotalThb: 500, isOverdue: true, salePerson: 'พนักงาน' }], total: 1 }
  return {}
}

const warnings = []
let lastQuery

function mountView({ metal = 'ALL', initialSub = '', target = null } = {}) {
  const replace = vi.fn((arg) => {
    lastQuery = arg.query
    return Promise.resolve()
  })
  const push = vi.fn()
  const wrapper = mount(SalesInsightView, {
    props: { metal, initialSub, target },
    global: {
      plugins: [PrimeVue],
      config: { warnHandler: (message) => warnings.push(message) },
      components: { apexchart: { name: 'apexchart', props: ['type', 'series', 'options', 'height'], template: '<div class="apex-stub" :data-type="type" />' } },
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { query: { tab: 'sales', other: '1' } },
        $router: { replace, push, resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: { InfoTipGeneric: true }
    }
  })
  return { wrapper, replace, push }
}

const callsTo = (path) => postMock.mock.calls.filter((c) => c[0] === path)
const settle = async () => {
  await flushPromises()
  await flushPromises()
}
const page = (wrapper) => wrapper.findComponent({ name: 'InsightPage' })
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const subTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

describe('Sales tab (InsightPage + salesConfig) smoke', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    warnings.length = 0
    lastQuery = undefined
    postMock.mockImplementation(async (path, body) => respond(path, body))
    getMock.mockImplementation(async () => ({}))
  })

  it('default tab is problems: only SalesInsight/Overview is requested, with exactly {metal, months}; no data tab is mounted', async () => {
    useMetalScopeStore().setMetal('GOLD')
    const { wrapper } = mountView({ metal: 'GOLD' })
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['SalesInsight/Overview'])
    expect(postMock.mock.calls[0][1]).toEqual({ metal: 'GOLD', months: 12 })
    ;['salKpi', 'salAging', 'salDueOverdue', 'salTrend', 'salSo'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(page(wrapper).vm.currentSub).toBe('problems')
    expect(subTabs(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (4)',
      'view.productionInsight.tabs.forecasts (2)',
      'view.productionInsight.tabs.actions (1)',
      ...['overview', 'aging', 'due', 'trend', 'so'].map((k) => `view.productionInsight.salesInsight.tabs.${k}`)
    ])
  })

  it('findings: money params are formatted, info and warning forecasts both render, the action shows the new role and related finding', async () => {
    const { wrapper } = mountView()
    await settle()
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.salesInsight.rules.SAL_OVERDUE_RECEIVABLE:')
    expect(html).toContain('"overdueThb":"1,500,000"')
    expect(html).toContain('"outstandingThb":"4,000,000"')

    page(wrapper).vm.selectSub('forecast')
    await settle()
    const forecast = wrapper.html()
    expect(forecast).toContain('rules.FC_SAL_COLLECTION:')
    expect(forecast).toContain('rules.FC_SAL_BECOMING_OVERDUE')
    expect(wrapper.findAll('.insight-finding-list__item--info')).toHaveLength(1)
    expect(wrapper.findAll('.insight-finding-list__item--warning').length).toBeGreaterThan(0)

    page(wrapper).vm.selectSub('actions')
    await settle()
    const actions = wrapper.html()
    expect(actions).toContain('rules.ACT_FOLLOW_OVERDUE')
    expect(actions).toContain('view.productionInsight.ownerRole.saleManager')
    expect(actions).toContain('view.productionInsight.relatedPrefix')
  })

  it('a warning FC_SAL_COLLECTION (nothing due) uses its own text', async () => {
    postMock.mockImplementation(async (path, body) =>
      path === 'SalesInsight/Overview' ? { ...overview, forecasts: [{ code: 'FC_SAL_COLLECTION', severity: 'warning', params: { amountThb: 0, count: 0, windowDays: 30 }, reportRef: 'salDue' }] } : respond(path, body)
    )
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('forecast')
    await settle()
    expect(wrapper.html()).toContain('rules.FC_SAL_COLLECTION_NONE')
  })

  it('overview / aging / trend reuse Overview (no request) and render donut + bar + trend without warnings', async () => {
    const { wrapper } = mountView()
    await settle()
    postMock.mockClear()
    for (const [tab, ids] of [['overview', ['salKpi', 'salPayment']], ['aging', ['salAging', 'salTopCustomers']], ['trend', ['salTrend']]]) {
      page(wrapper).vm.selectSub(tab)
      await settle()
      ids.forEach((id) => expect(anchor(wrapper, id), `${tab}:${id}`).toBe(true))
    }
    expect(postMock.mock.calls).toHaveLength(0)
    const types = wrapper.findAll('.apex-stub').map((el) => el.attributes('data-type'))
    expect(types).toContain('donut')
    expect(types).toContain('bar')
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    expect(wrapper.text()).toContain('บริษัท ก')
    expect(wrapper.text()).toContain('"start":"มิ.ย. 2026"')
  })

  it('the due tab opens on the overdue table and fetches ONLY the selected Receivables filter; switching fetches the next one once', async () => {
    const { wrapper } = mountView()
    await settle()
    postMock.mockClear()
    page(wrapper).vm.selectSub('due')
    await settle()
    expect(postMock.mock.calls.map((c) => [c[0], c[1].filter])).toEqual([['ExecutiveReport/Receivables', 'overdue']])
    expect(postMock.mock.calls[0][1]).toMatchObject({ take: 10, skip: 0, filter: 'overdue' })
    expect(anchor(wrapper, 'salDueOverdue')).toBe(true)
    expect(anchor(wrapper, 'salDueUnpaid')).toBe(false)
    expect(wrapper.text()).toContain('INV-overdue-1')

    postMock.mockClear()
    page(wrapper).vm.setState('dueFilter', 'noDue')
    await settle()
    expect(postMock.mock.calls.map((c) => c[1].filter)).toEqual(['noDueDate'])
    expect(anchor(wrapper, 'salDueOverdue')).toBe(false)
    expect(anchor(wrapper, 'salDueNoDue')).toBe(true)

    // ตัวสลับ ToggleGroup จริง
    postMock.mockClear()
    const buttons = wrapper.findAll('#insight-report-salDueSwitch [role="tab"], .insight-page__panel [role="tab"]').filter((b) => b.text().includes('tabUnpaid'))
    await buttons[0].trigger('click')
    await settle()
    expect(postMock.mock.calls.map((c) => c[1].filter)).toEqual(['unpaid'])
  })

  it('the invoice number is a button that opens the invoice detail by running number', async () => {
    const { wrapper, push } = mountView({ initialSub: 'due' })
    await settle()
    const button = wrapper.findAll('button').find((b) => b.text() === 'INV-overdue-1')
    expect(button).toBeTruthy()
    await button.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'invoice-detail', query: { invoiceNumber: 'overdue-1' } })
  })

  it('the SO tab fetches the existing SO endpoint on open and its number opens the sale order', async () => {
    const { wrapper, push } = mountView()
    await settle()
    postMock.mockClear()
    page(wrapper).vm.selectSub('so')
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['ExecutiveReport/SalesOrdersWithoutInvoice'])
    await wrapper.findAll('button').find((b) => b.text() === 'SO-1').trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'sale-order', query: { soNumber: 'SO-1' } })
  })

  it('"ดู ›" from findings lands on the right tab and toggle; KPI cards jump too', async () => {
    const { wrapper } = mountView()
    await settle()
    const list = () => wrapper.findAllComponents(InsightFindingList)[0]
    const jump = async (ref, params) => {
      list().vm.$emit('goto-report', ref, params)
      await settle()
    }
    await jump('salAging', {})
    expect(page(wrapper).vm.currentSub).toBe('aging')
    await jump('salSo', {})
    expect(page(wrapper).vm.currentSub).toBe('so')
    await jump('salDue', { findingCode: 'SAL_NO_DUE_DATE' })
    expect(page(wrapper).vm.currentSub).toBe('due')
    expect(page(wrapper).vm.state.dueFilter).toBe('noDue')
    await jump('salDue', { findingCode: 'SAL_OLDEST_OVERDUE' })
    expect(page(wrapper).vm.state.dueFilter).toBe('overdue')

    page(wrapper).vm.selectSub('overview')
    await settle()
    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(4)
    const expected = [['due', 'unpaid'], ['due', 'overdue'], ['overview', 'overdue'], ['so', 'overdue']]
    for (let i = 0; i < expected.length; i += 1) {
      page(wrapper).vm.selectSub('overview')
      page(wrapper).vm.setState('dueFilter', 'overdue')
      await settle()
      await cards[i].trigger('click')
      await settle()
      expect([page(wrapper).vm.currentSub, page(wrapper).vm.state.dueFilter], `card ${i}`).toEqual(expected[i])
    }
  })

  it('summary-card target selects the sub tab and the toggle (also when mounted with it); a new target object re-applies', async () => {
    const first = mountView({ target: { sub: 'due', dueFilter: 'noDue' } })
    await settle()
    expect(page(first.wrapper).vm.currentSub).toBe('due')
    expect(page(first.wrapper).vm.state.dueFilter).toBe('noDue')
    expect(postMock.mock.calls.filter((c) => c[0] === 'ExecutiveReport/Receivables').map((c) => c[1].filter)).toEqual(['noDueDate'])

    await first.wrapper.setProps({ target: { sub: 'so' } })
    await settle()
    expect(page(first.wrapper).vm.currentSub).toBe('so')
    await first.wrapper.setProps({ target: { sub: 'due', dueFilter: 'unpaid' } })
    await settle()
    expect(page(first.wrapper).vm.state.dueFilter).toBe('unpaid')
  })

  it('sub= is written (default omitted, tab=sales and other keys kept) and initialSub opens that tab', async () => {
    const { wrapper } = mountView({ initialSub: 'trend' })
    await settle()
    expect(page(wrapper).vm.currentSub).toBe('trend')
    page(wrapper).vm.selectSub('due')
    await settle()
    expect(lastQuery).toMatchObject({ tab: 'sales', other: '1', sub: 'due' })
    page(wrapper).vm.selectSub('problems')
    await settle()
    expect(lastQuery).not.toHaveProperty('sub')
    expect(lastQuery).toMatchObject({ tab: 'sales', other: '1' })
    expect(wrapper.emitted('update:sub').at(-1)).toEqual(['problems'])
  })

  it('a new metal refetches Overview once with that metal; refreshToken reloads Overview and the open table', async () => {
    useMetalScopeStore().setMetal('SILVER')
    const first = mountView({ metal: 'SILVER', initialSub: 'due' })
    await settle()
    expect(callsTo('SalesInsight/Overview')[0][1]).toEqual({ metal: 'SILVER', months: 12 })
    expect(callsTo('ExecutiveReport/Receivables')[0][1].metal).toBe('SILVER')
    first.wrapper.unmount()

    postMock.mockClear()
    useMetalScopeStore().setMetal('ALL')
    const second = mountView({ metal: 'ALL', initialSub: 'due' })
    await settle()
    expect(callsTo('SalesInsight/Overview')).toHaveLength(1)
    expect(callsTo('SalesInsight/Overview')[0][1]).toEqual({ metal: 'ALL', months: 12 })

    postMock.mockClear()
    await second.wrapper.setProps({ refreshToken: 1 })
    await settle()
    expect(callsTo('SalesInsight/Overview')).toHaveLength(1)
    expect(callsTo('ExecutiveReport/Receivables')).toHaveLength(1)
    expect(callsTo('ExecutiveReport/Receivables')[0][1].filter).toBe('overdue')
  })
})
