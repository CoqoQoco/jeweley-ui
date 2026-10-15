// delivery-page.smoke.spec.js — mount InsightPage กับ deliveryConfig จริงทั้งหน้า + ทดสอบ TargetDrawer แบบค่าเดียว (deliveryTarget)
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

describe('InsightPage + deliveryConfig (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders every anchor, fetches each endpoint once and shows the late customers', async () => {
    const wrapper = mount(InsightPage, { props: { config: deliveryConfig, filter: buildDefaultDeliveryFilter(), active: true }, global: mountOptions() })
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;['deliveryTrend', 'lateCustomers', 'atRisk', 'latePlans', 'stuckCostCard'].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))
    ;['Delivery', 'DeliveryAtRiskPlans', 'DeliveryLatePlans', 'StuckAfterCostCardPlans'].forEach((name) => expect(postsTo(name), name).toHaveLength(1))
    expect(getMock.mock.calls.filter((c) => c[0].endsWith('/DeliveryTarget'))).toHaveLength(1)
    expect(html).toContain('ลูกค้า')
    expect(html).toContain('40.3%')
    expect(html).toContain('view.executive.asOf')
  })

  it('range change → Delivery + latePlans only; department / horizon → atRisk (+ Delivery for horizon); draft → Delivery once', async () => {
    const wrapper = mount(InsightPage, { props: { config: deliveryConfig, filter: buildDefaultDeliveryFilter(), active: true }, global: mountOptions() })
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultDeliveryFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'month' } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()).toEqual(['Delivery', 'DeliveryLatePlans'])

    postMock.mockClear()
    await wrapper.setProps({ filter: { ...wrapper.props('filter'), departmentKeys: ['trim'] } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0].split('/').pop())).toEqual(['DeliveryAtRiskPlans'])

    postMock.mockClear()
    await wrapper.setProps({ filter: { ...wrapper.props('filter'), riskHorizonDays: 7 } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()).toEqual(['Delivery', 'DeliveryAtRiskPlans'])

    postMock.mockClear()
    wrapper.vm.setState('draftTargetPercent', 85)
    await flushPromises()
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
