// wip-page.smoke.spec.js — mount InsightPage กับ wipConfig จริงทั้งชุด (โหมดแท็บ: block จริง, ตาราง/สลอตจริง) ด้วยข้อมูลจำลอง เพื่อจับ
// template/slot พังที่ unit spec ของ helper มองไม่เห็น — กราฟ/Drawer/modal ถูก stub (ไม่ใช่ประเด็นของเทสนี้)
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Wip) · แท็บข้อมูล mount/ยิง request เมื่อเปิดครั้งแรกเท่านั้น · toggle ตารางใบงานทีละอัน · prop sub · "ดู ›" กระโดดข้ามแท็บ
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
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import { wipConfig } from './wip.config.js'
import { buildDefaultWipFilter } from '../insight-filters.js'

const planRow = { planId: 1, wo: 'WO', woNumber: '1', mold: 'M1', productNumber: 'P1', productName: 'แหวน', departmentKey: 'setting', statusName: 'รอฝัง', createDate: '2026-01-01T00:00:00', lastActionDate: '2026-02-01T00:00:00', lastUpdateBy: 'ก', lastAction: 'ข', workers: ['สมชาย'], daysSinceMove: 200, dueDate: '2026-03-01T00:00:00', daysToDue: -3, deptKey: 'setting', daysInDept: 9, waitDays: 2, workDays: 3, standardDays: 5 }

function respond(path) {
  if (path.endsWith('/Wip'))
    return {
      status: 'warning',
      problems: [
        { code: 'WIP_X', severity: 'warning', params: {}, reportRef: 'abnormalDwell' },
        { code: 'WIP_Y', severity: 'warning', params: {}, reportRef: 'departments' }
      ],
      forecasts: [{ code: 'FC_X', severity: 'info', params: {}, reportRef: 'trend' }],
      actions: [{ code: 'ACT_X', params: {}, relatedCodes: [] }],
      report: { departments: [{ key: 'setting', moved30d: 1, moved30to180d: 2, stale180d: 3 }], flow: [{ key: 'setting', inflow: 4, outflow: 2, net: 2 }] }
    }
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

describe('InsightPage + wipConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  const mountWip = (props = {}) =>
    mount(InsightPage, {
      props: { config: wipConfig, filter: buildDefaultWipFilter(), active: true, ...props },
      global: {
        plugins: [PrimeVue],
        mocks: { $t: (key) => key, $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
        stubs: { ChartGeneric: true, DrawerGeneric: true, modal: true, TargetDrawer: true, InfoTipGeneric: true }
      }
    })

  const names = () =>
    postMock.mock.calls
      .map((c) => c[0].split('/').pop())
      .concat(getMock.mock.calls.map((c) => c[0].split('/').pop()))
      .sort()
  const clear = () => {
    postMock.mockClear()
    getMock.mockClear()
  }
  const tabButtons = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')
  const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
  const settle = async () => {
    await flushPromises()
    await flushPromises()
  }

  it('default tab is the problems tab: only Wip is fetched and no data-tab block is mounted', async () => {
    const wrapper = mountWip()
    await settle()
    expect(names()).toEqual(['Wip'])
    ;['trend', 'departments', 'flow', 'leadTime', 'capacity', 'stalePlans', 'dueRisk', 'abnormalDwell'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.vm.currentSub).toBe('problems')
  })

  it('tab bar: 3 fixed tabs with counts, a divider, then the 4 data tabs in config order', async () => {
    const wrapper = mountWip()
    await settle()
    expect(tabButtons(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (2)',
      'view.productionInsight.tabs.forecasts (1)',
      'view.productionInsight.tabs.actions (1)',
      'view.productionInsight.wip.tabs.trend',
      'view.productionInsight.wip.tabs.dept',
      'view.productionInsight.wip.tabs.leadtime',
      'view.productionInsight.wip.tabs.due'
    ])
    expect(wrapper.find('.insight-sub-tabs [role="separator"]').exists()).toBe(true)
    expect(tabButtons(wrapper)[0].attributes('aria-selected')).toBe('true')
  })

  it('clicking a tab button selects it and emits update:sub (the default tab is emitted as problems)', async () => {
    const wrapper = mountWip()
    await settle()
    clear()
    await tabButtons(wrapper)[3].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    expect(names()).toEqual(['WipTrend'])
    await tabButtons(wrapper)[0].trigger('click')
    expect(wrapper.emitted('update:sub').map((e) => e[0])).toEqual(['trend', 'problems'])
  })

  it('opening a data tab mounts it on first visit only (v-show afterwards) and fetches just its own endpoints', async () => {
    const wrapper = mountWip()
    await settle()

    clear()
    wrapper.vm.selectSub('trend')
    await settle()
    expect(names()).toEqual(['WipTrend'])
    expect(anchor(wrapper, 'trend')).toBe(true)

    clear()
    wrapper.vm.selectSub('dept')
    await settle()
    expect(names()).toEqual([])
    expect(anchor(wrapper, 'departments') && anchor(wrapper, 'flow')).toBe(true)

    clear()
    wrapper.vm.selectSub('leadtime')
    await settle()
    expect(names()).toEqual(['StageLeadTime', 'StageStandards'])
    expect(anchor(wrapper, 'leadTime') && anchor(wrapper, 'capacity')).toBe(true)

    clear()
    wrapper.vm.selectSub('trend')
    wrapper.vm.selectSub('problems')
    await settle()
    expect(names()).toEqual([])
    expect(anchor(wrapper, 'trend')).toBe(true)
    expect(wrapper.emitted('update:sub').map((e) => e[0])).toEqual(['trend', 'dept', 'leadtime', 'trend', 'problems'])
  })

  it('due tab shows one table at a time: default stale, the toggle swaps and fetches only the selected table', async () => {
    const wrapper = mountWip()
    await settle()
    clear()
    wrapper.vm.selectSub('due')
    await settle()
    expect(names()).toEqual(['StalePlans'])
    expect(anchor(wrapper, 'stalePlans')).toBe(true)
    expect(anchor(wrapper, 'dueRisk') || anchor(wrapper, 'abnormalDwell')).toBe(false)

    clear()
    wrapper.vm.setState('dueTable', 'dueRisk')
    await settle()
    expect(names()).toEqual(['DueRiskPlans'])
    expect(anchor(wrapper, 'stalePlans')).toBe(false)

    clear()
    wrapper.vm.setState('dueTable', 'abnormal')
    await settle()
    expect(names()).toEqual(['AbnormalDwellPlans'])
    expect(anchor(wrapper, 'dueRisk')).toBe(false)
  })

  it('the due toggle is a segmented control with the 3 options; clicking one fetches only that table', async () => {
    const wrapper = mountWip({ sub: 'due' })
    await settle()
    const toggleTabs = wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('dueOptions'))
    expect(toggleTabs.map((b) => b.text())).toEqual(['view.productionInsight.wip.tabs.dueOptions.stale', 'view.productionInsight.wip.tabs.dueOptions.dueRisk', 'view.productionInsight.wip.tabs.dueOptions.abnormal'])
    clear()
    await toggleTabs[1].trigger('click')
    await settle()
    expect(wrapper.vm.state.dueTable).toBe('dueRisk')
    expect(names()).toEqual(['DueRiskPlans'])
  })

  it('sub prop: a data tab key opens that tab on mount (fetching only its sources); unknown values fall back to problems; later prop changes follow without emitting', async () => {
    const wrapper = mountWip({ sub: 'leadtime' })
    await settle()
    expect(wrapper.vm.currentSub).toBe('leadtime')
    expect(names()).toEqual(['StageLeadTime', 'StageStandards', 'Wip'])
    expect(anchor(wrapper, 'leadTime')).toBe(true)
    expect(anchor(wrapper, 'trend')).toBe(false)

    await wrapper.setProps({ sub: 'forecast' })
    expect(wrapper.vm.currentSub).toBe('forecast')
    await wrapper.setProps({ sub: 'bogus' })
    expect(wrapper.vm.currentSub).toBe('problems')
    expect(wrapper.emitted('update:sub')).toBeUndefined()

    const bogus = mountWip({ sub: 'bogus' })
    await settle()
    expect(bogus.vm.currentSub).toBe('problems')
  })

  it('"ดู ›" jumps: a finding reportRef opens its tab (and the matching due toggle), fetching only what that needs', async () => {
    const wrapper = mountWip()
    await settle()
    const lists = wrapper.findAllComponents(InsightFindingList)

    clear()
    lists[0].vm.$emit('goto-report', 'abnormalDwell')
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('abnormal')
    expect(names()).toEqual(['AbnormalDwellPlans'])

    clear()
    lists[0].vm.$emit('goto-report', 'departments')
    await settle()
    expect(wrapper.vm.currentSub).toBe('dept')
    expect(names()).toEqual([])

    clear()
    lists[1].vm.$emit('goto-report', 'trend')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    expect(names()).toEqual(['WipTrend'])
  })

  it('clicking the abnormal count in the lead-time table opens the due tab on the abnormal table focused on that department (one request)', async () => {
    const wrapper = mountWip({ sub: 'leadtime' })
    await settle()
    clear()
    const leadTime = wipConfig.blocks.find((b) => b.id === 'leadTime')
    leadTime.columns.find((c) => c.field === 'abnormal').onClick({ key: 'setting' }, wrapper.vm.ctx)
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('abnormal')
    const calls = postMock.mock.calls.filter((c) => c[0].endsWith('/AbnormalDwellPlans'))
    expect(calls).toHaveLength(1)
    expect(calls[0][1].departmentKeys).toEqual(['setting'])
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('a topic without config.tabs keeps the classic layout (no tab bar, everything mounted)', async () => {
    const classic = { ...wipConfig, tabs: undefined, sources: { Wip: wipConfig.sources.Wip }, blocks: wipConfig.blocks.filter((b) => b.id === 'leadTime').map((b) => ({ ...b, visible: undefined })) }
    const wrapper = mountWip({ config: classic })
    await settle()
    expect(tabButtons(wrapper)).toHaveLength(0)
    expect(wrapper.find('.insight-tab-layout__tabbed').exists()).toBe(false)
    expect(anchor(wrapper, 'leadTime')).toBe(true)
  })
})
