// delivery-page.smoke.spec.js — mount InsightPage กับ deliveryConfig จริงทั้งหน้า (โหมดแท็บ) + ทดสอบ TargetDrawer แบบค่าเดียว (deliveryTarget)
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Delivery) · แท็บข้อมูล mount/ยิง request เมื่อเปิดครั้งแรก · toggle ตารางใบงานทีละอัน · "ดู ›"/การ์ด KPI กระโดดข้ามแท็บ
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ success: vi.fn(), warning: vi.fn() }))

import InsightPage from '@/components/insight/page/InsightPage.vue'
import TargetDrawer from '@/components/insight/page/blocks/TargetDrawer.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import { deliveryConfig } from './delivery.config.js'
import { buildDefaultDeliveryFilter } from '../insight-filters.js'

const planRow = { planId: 1, wo: 'WO', woNumber: '1', mold: 'M1', productNumber: 'P1', productName: 'แหวน', requestDate: '2026-09-01T00:00:00', currentDeptKey: 'setting', daysInCurrentDept: 4, remainingDays: -2, projectedFinishDate: '2026-09-10T00:00:00', projectedLateDays: 3, doneDate: '2026-09-12T00:00:00', lateDays: 5, costCardDate: '2026-09-02T00:00:00', daysSinceCostCard: 20, workers: ['สมชาย'], lastActionDate: '2026-09-03T00:00:00', lastUpdateBy: 'ก', lastAction: 'ข' }

function respond(path) {
  if (path.endsWith('/Delivery')) {
    return {
      status: 'warning',
      problems: [],
      forecasts: [],
      actions: [],
      asOf: '2026-10-01T08:00:00',
      targetPercent: 90,
      targetSource: 'saved',
      kpi: { completedCount: 100, onTimeCount: 85, onTimePercent: 85, lateMedianDays: 3, plannedLeadMedianDays: 10, actualLeadMedianDays: 12, suggestedLeadDays: 14, openCount: 40, openOverdueCount: 9, openOverdueActiveCount: 6, atRiskCount: 11, stuckAfterCostCardCount: 4 },
      series: [{ bucketEnd: '2026-09-01T00:00:00', onTimePercent: 80, plannedLeadMedianDays: 10, actualLeadMedianDays: 12 }],
      lateCustomers: [{ customerCode: 'C1', customerName: 'ลูกค้า', completedCount: 10, lateCount: 4, latePercent: 40.26, lateMedianDays: 2.5 }]
    }
  }
  if (path.endsWith('/DeliveryTarget')) return { targetPercent: 90, effectiveFrom: '2026-01-01T00:00:00', createBy: 'x', remark: 'r' }
  return { data: [planRow], total: 1 }
}

const mountOptions = () => ({
  plugins: [PrimeVue],
  mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key), $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
  stubs: { ChartGeneric: true, InfoTipGeneric: true, DrawerGeneric: true, modal: true }
})

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))

describe('InsightPage + deliveryConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  const mountDelivery = (props = {}) => mount(InsightPage, { props: { config: deliveryConfig, filter: buildDefaultDeliveryFilter(), active: true, ...props }, global: mountOptions() })
  const names = () =>
    postMock.mock.calls
      .map((c) => c[0].split('/').pop())
      .concat(getMock.mock.calls.map((c) => c[0].split('/').pop()))
      .sort()
  const clear = () => {
    postMock.mockClear()
    getMock.mockClear()
  }
  const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
  const settle = async () => {
    await flushPromises()
    await flushPromises()
  }

  it('default tab is problems: only Delivery is fetched and no data-tab block is mounted', async () => {
    const wrapper = mountDelivery()
    await settle()
    expect(names()).toEqual(['Delivery'])
    ;['deliveryTrend', 'lateCustomers', 'atRisk', 'latePlans', 'stuckCostCard'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.vm.currentSub).toBe('problems')
    expect(wrapper.findAll('.insight-sub-tabs [role="tab"]').map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (0)',
      'view.productionInsight.tabs.forecasts (0)',
      'view.productionInsight.tabs.actions (0)',
      'view.productionInsight.delivery.tabs.overview',
      'view.productionInsight.delivery.tabs.trend',
      'view.productionInsight.delivery.tabs.customers',
      'view.productionInsight.delivery.tabs.due'
    ])
  })

  it('overview shows the KPI cards with no extra request; trend loads DeliveryTarget and mounts the target drawer; customers shows the late customers', async () => {
    const wrapper = mountDelivery()
    await settle()

    clear()
    wrapper.vm.selectSub('overview')
    await settle()
    expect(names()).toEqual([])
    expect(wrapper.findAll('.stat-card').length).toBeGreaterThanOrEqual(6)
    expect(wrapper.html()).toContain('view.executive.asOf')

    clear()
    wrapper.vm.selectSub('trend')
    await settle()
    expect(names()).toEqual(['DeliveryTarget'])
    expect(anchor(wrapper, 'deliveryTrend')).toBe(true)
    expect(wrapper.findComponent(TargetDrawer).exists()).toBe(true)

    clear()
    wrapper.vm.selectSub('customers')
    await settle()
    expect(names()).toEqual([])
    expect(anchor(wrapper, 'lateCustomers')).toBe(true)
    expect(wrapper.html()).toContain('40.3%')
  })

  it('due tab shows one table at a time (default atRisk); the toggle fetches only the selected table', async () => {
    const wrapper = mountDelivery()
    await settle()
    clear()
    wrapper.vm.selectSub('due')
    await settle()
    expect(names()).toEqual(['DeliveryAtRiskPlans'])
    expect(anchor(wrapper, 'atRisk')).toBe(true)
    expect(anchor(wrapper, 'latePlans') || anchor(wrapper, 'stuckCostCard')).toBe(false)

    const toggleTabs = wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('dueOptions'))
    expect(toggleTabs.map((b) => b.text())).toEqual(['view.productionInsight.delivery.tabs.dueOptions.atRisk', 'view.productionInsight.delivery.tabs.dueOptions.latePlans', 'view.productionInsight.delivery.tabs.dueOptions.stuckCostCard'])

    clear()
    await toggleTabs[1].trigger('click')
    await settle()
    expect(names()).toEqual(['DeliveryLatePlans'])
    expect(anchor(wrapper, 'atRisk')).toBe(false)

    clear()
    await toggleTabs[2].trigger('click')
    await settle()
    expect(names()).toEqual(['StuckAfterCostCardPlans'])
  })

  it('KPI card clicks land on the right tab (and due toggle), fetching only what that needs', async () => {
    const wrapper = mountDelivery({ sub: 'overview' })
    await settle()
    const cards = wrapper.findAll('.stat-card')

    clear()
    await cards[3].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('atRisk')
    expect(names()).toEqual(['DeliveryAtRiskPlans'])

    wrapper.vm.selectSub('overview')
    clear()
    await cards[5].trigger('click')
    await settle()
    expect(wrapper.vm.state.dueTable).toBe('stuckCostCard')
    expect(names()).toEqual(['StuckAfterCostCardPlans'])

    wrapper.vm.selectSub('overview')
    clear()
    await cards[1].trigger('click')
    await settle()
    expect(wrapper.vm.state.dueTable).toBe('latePlans')
    expect(names()).toEqual(['DeliveryLatePlans'])

    wrapper.vm.selectSub('overview')
    clear()
    await cards[0].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    expect(names()).toEqual(['DeliveryTarget'])

    wrapper.vm.goToReport('lateCustomers')
    await settle()
    expect(wrapper.vm.currentSub).toBe('customers')
  })

  it('finding "ดู ›" links switch tab and toggle through the findings list', async () => {
    const wrapper = mountDelivery()
    await settle()
    const list = wrapper.findAllComponents(InsightFindingList)[0]
    clear()
    list.vm.$emit('goto-report', 'stuckCostCard')
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('stuckCostCard')
    expect(names()).toEqual(['StuckAfterCostCardPlans'])
  })

  it('filters: range -> Delivery (+ latePlans only while that table is open); department -> atRisk; horizon -> Delivery + atRisk; draft -> Delivery once', async () => {
    const wrapper = mountDelivery({ sub: 'due' })
    await settle()
    clear()

    await wrapper.setProps({ filter: { ...buildDefaultDeliveryFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'month' } })
    await settle()
    expect(names()).toEqual(['Delivery'])

    wrapper.vm.setState('dueTable', 'latePlans')
    await settle()
    clear()
    await wrapper.setProps({ filter: { ...wrapper.props('filter'), start: new Date('2026-03-01'), end: new Date('2026-04-01') } })
    await settle()
    expect(names()).toEqual(['Delivery', 'DeliveryLatePlans'])

    wrapper.vm.setState('dueTable', 'atRisk')
    await settle()
    clear()
    await wrapper.setProps({ filter: { ...wrapper.props('filter'), departmentKeys: ['trim'] } })
    await settle()
    expect(names()).toEqual(['DeliveryAtRiskPlans'])

    clear()
    await wrapper.setProps({ filter: { ...wrapper.props('filter'), riskHorizonDays: 7 } })
    await settle()
    expect(names()).toEqual(['Delivery', 'DeliveryAtRiskPlans'])

    clear()
    wrapper.vm.setState('draftTargetPercent', 85)
    await settle()
    expect(postsTo('Delivery')).toHaveLength(1)
    expect(postsTo('Delivery')[0][1].draftTargetPercent).toBe(85)
    expect(postMock.mock.calls).toHaveLength(1)
  })
})

describe('TargetDrawer scalar preset (deliveryTarget)', { timeout: 20000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue(true)
    getMock.mockReset()
    getMock.mockResolvedValue([{ effectiveFrom: '2026-01-01T00:00:00', targetPercent: 90, createBy: 'x', remark: 'r' }])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mountDrawer = (ctx) =>
    mount(TargetDrawer, {
      props: { preset: 'deliveryTarget', ctx },
      global: { mocks: { $t: (key) => key }, stubs: { DrawerGeneric: { template: '<div><slot name="content" /><slot name="action" /></div>' }, modal: true, BaseDataTable: true } }
    })

  const baseCtx = () => ({ data: { DeliveryTarget: { targetPercent: 90 }, Delivery: { kpi: { onTimePercent: 85 } } }, setState: vi.fn(), reload: vi.fn() })

  it('one row, debounced draft emission as a number, null when back to the saved value', async () => {
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    expect(wrapper.vm.draftMap).toEqual({ value: 90 })

    wrapper.vm.draftMap.value = 85
    wrapper.vm.onDraftInput()
    wrapper.vm.onDraftInput()
    expect(ctx.setState).not.toHaveBeenCalled()
    vi.advanceTimersByTime(450)
    expect(ctx.setState).toHaveBeenCalledTimes(1)
    expect(ctx.setState).toHaveBeenCalledWith('draftTargetPercent', 85)

    wrapper.vm.draftMap.value = 90
    wrapper.vm.onDraftInput()
    vi.advanceTimersByTime(450)
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargetPercent', null)
  })

  it('closing or cancelling drops the draft (null)', async () => {
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    wrapper.vm.onClose()
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargetPercent', null)
    wrapper.vm.onCancelDraft()
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargetPercent', null)
  })

  it('saving needs a remark; then calls SaveDeliveryTarget, clears the draft and reloads Delivery + DeliveryTarget', async () => {
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    wrapper.vm.draftMap.value = 88

    await wrapper.vm.onSave()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.vm.remarkError).toBe('view.productionInsight.wip.standardsRemarkRequired')

    wrapper.vm.remark = 'ปรับเป้า'
    await wrapper.vm.onSave()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock.mock.calls[0][0]).toBe('ProductionInsight/SaveDeliveryTarget')
    expect(postMock.mock.calls[0][1]).toEqual({ targetPercent: 88, remark: 'ปรับเป้า' })
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargetPercent', null)
    expect(ctx.reload).toHaveBeenCalledWith(['Delivery', 'DeliveryTarget'])
  })

  it('shows the reference text with the current on-time percent and loads the history without a key', async () => {
    const wrapper = mountDrawer(baseCtx())
    wrapper.vm.onOpen()
    expect(wrapper.html()).toContain('view.productionInsight.delivery.targetReferenceText')
    await wrapper.vm.onOpenHistory(wrapper.vm.rows[0])
    expect(getMock).toHaveBeenCalledWith('ProductionInsight/DeliveryTargetHistory')
    expect(wrapper.vm.historyRows).toHaveLength(1)
  })
})
