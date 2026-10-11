// wip-page.smoke.spec.js — mount InsightPage กับ wipConfig จริงทั้งชุด (block จริง, ตาราง/สลอตจริง) ด้วยข้อมูลจำลอง เพื่อจับ
// template/slot พังที่ unit spec ของ helper มองไม่เห็น — กราฟ/Drawer/modal ถูก stub (ไม่ใช่ประเด็นของเทสนี้)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => false }))

import InsightPage from '@/components/insight/page/InsightPage.vue'
import { wipConfig } from './wip.config.js'
import { buildDefaultWipFilter } from '../insight-filters.js'

const planRow = { planId: 1, wo: 'WO', woNumber: '1', mold: 'M1', productNumber: 'P1', productName: 'แหวน', departmentKey: 'setting', statusName: 'รอฝัง', createDate: '2026-01-01T00:00:00', lastActionDate: '2026-02-01T00:00:00', lastUpdateBy: 'ก', lastAction: 'ข', workers: ['สมชาย'], daysSinceMove: 200, dueDate: '2026-03-01T00:00:00', daysToDue: -3, deptKey: 'setting', daysInDept: 9, waitDays: 2, workDays: 3, standardDays: 5 }

function respond(path) {
  if (path.endsWith('/Wip')) return { status: 'warning', problems: [], forecasts: [], actions: [], report: { departments: [{ key: 'setting', moved30d: 1, moved30to180d: 2, stale180d: 3 }], flow: [{ key: 'setting', inflow: 4, outflow: 2, net: 2 }] } }
  if (path.endsWith('/WipTrend')) return { buckets: [{ end: '2026-09-01T00:00:00', label: 'ก.ย.' }], total: { startWip: 10, endWip: 12, delta: 2, deltaPercent: 20, inflow: 5, outflow: 3, net: 2, series: [{ bucketEnd: '2026-09-01T00:00:00', wip: 12, inflow: 5, outflow: 3 }] }, departments: [{ key: 'setting', startWip: 5, endWip: 7, delta: 2, deltaPercent: 40, inflow: 3, outflow: 1, net: 2, series: [{ bucketEnd: '2026-09-01T00:00:00', wip: 7, inflow: 3, outflow: 1 }] }] }
  if (path.endsWith('/StageLeadTime'))
    return {
      splitDataSince: '2026-05-01T00:00:00',
      departments: [{ key: 'setting', standardDays: 4, median: { total: 6, wait: 2, work: 4 }, p90: { total: 9 }, overStandardPercent: 50, exitedCount: 10, abnormalCount: 2, currentWaitingCount: 3, splitSampleCount: 4, series: [{ bucketEnd: '2026-09-01T00:00:00', medianTotal: 6, p90Total: 9, medianWait: 2, medianWork: 4 }] }],
      capacity: { current: { totalLeadDays: 10, monthlyThroughput: 100, bottleneckDept: 'setting' }, atStandard: { totalLeadDays: 8, monthlyThroughput: 120, bottleneckDept: 'trim' }, departments: [{ key: 'setting', activeWip: 5, exitedCount: 3, exitedPerDay: 0.5, queueDaysCurrent: 9, isBottleneckCurrent: true, medianTotal: 6, standardDays: 4, atStandardPerDay: 0.7, queueDaysAtStandard: 7 }] }
    }
  if (path.endsWith('/StageStandards')) return [{ deptKey: 'setting', standardDays: 4 }]
  return { data: [planRow], total: 1 }
}

describe('InsightPage + wipConfig (smoke)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders every wip block with its reportRef anchor and fetches each endpoint once', async () => {
    const wrapper = mount(InsightPage, {
      props: { config: wipConfig, filter: buildDefaultWipFilter(), active: true },
      global: {
        plugins: [PrimeVue],
        mocks: { $t: (key) => key, $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
        stubs: { ChartGeneric: true, DrawerGeneric: true, modal: true, TargetDrawer: true, InfoTipGeneric: true }
      }
    })
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;['trend', 'departments', 'flow', 'leadTime', 'stalePlans', 'dueRisk', 'abnormalDwell'].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))

    const paths = postMock.mock.calls.map((c) => c[0]).concat(getMock.mock.calls.map((c) => c[0]))
    ;['Wip', 'WipTrend', 'StageLeadTime', 'StageStandards', 'StalePlans', 'DueRiskPlans', 'AbnormalDwellPlans'].forEach((name) => {
      expect(paths.filter((p) => p.endsWith(`/${name}`)), name).toHaveLength(1)
    })
  })

  it('clicking the abnormal count in the lead-time table focuses the abnormal table on that department (one extra request)', async () => {
    const wrapper = mount(InsightPage, {
      props: { config: wipConfig, filter: buildDefaultWipFilter(), active: true },
      global: {
        plugins: [PrimeVue],
        mocks: { $t: (key) => key, $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
        stubs: { ChartGeneric: true, DrawerGeneric: true, modal: true, TargetDrawer: true, InfoTipGeneric: true }
      }
    })
    await flushPromises()
    postMock.mockClear()

    wrapper.vm.setState('abnormalFocus', 'setting')
    await flushPromises()

    const calls = postMock.mock.calls.filter((c) => c[0].endsWith('/AbnormalDwellPlans'))
    expect(calls).toHaveLength(1)
    expect(calls[0][1].departmentKeys).toEqual(['setting'])
    expect(postMock.mock.calls).toHaveLength(1)
  })
})
