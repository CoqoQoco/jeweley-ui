// capacity-page.smoke.spec.js — mount InsightPage กับ capacityConfig จริงทั้งหน้า (โหมดแท็บ: block/ตาราง/slot แผงจำลองจริง) ด้วยข้อมูลจำลอง
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Capacity) · แท็บข้อมูล mount เมื่อเปิดครั้งแรก · ตารางใบงานที่รอ (CostCardPendingPlans) ยิงเมื่อเปิดแท็บ costpending เท่านั้น ·
// "ดู ›"/การ์ด KPI กระโดดข้ามแท็บ · เลือกแผนก/ตัวกรอง/แผงจำลองทำงานเหมือนเดิม
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))

import InsightPage from '@/components/insight/page/InsightPage.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
import CapacityWhatIfPanel from '../components/capacity-whatif-panel.vue'
import { capacityConfig } from './capacity.config.js'
import { buildDefaultCapacityFilter } from '../insight-filters.js'

const departments = [
  { key: 'setting', exitsPerMonth: 90, exitsPiecesPerMonth: 300, workersMedian: 5, plansPerWorker: 18, piecesPerWorker: 60, waitingNow: 30, waitingNowPieces: 100, workingNow: 10, workingNowPieces: 40, activeWip: 40, activeWipPieces: 140, queueDays: 12.3, isBottleneck: true, workersSeries: [{ bucketEnd: '2026-09-01T00:00:00', workers: 5 }], exitsSeries: [{ bucketEnd: '2026-09-01T00:00:00', exits: 80 }] },
  { key: 'trim', exitsPerMonth: 70, workersMedian: 4, plansPerWorker: 17, waitingNow: 10, workingNow: 5, activeWip: 15, queueDays: 3, isBottleneck: false, workersSeries: [], exitsSeries: [] }
]

function respond(path) {
  if (path.endsWith('/Capacity')) {
    return {
      status: 'warning',
      problems: [
        { code: 'CAP_X', severity: 'warning', params: {}, reportRef: 'capCostCard' },
        { code: 'CAP_Y', severity: 'warning', params: {}, reportRef: 'capDepartments' }
      ],
      forecasts: [{ code: 'FC_X', severity: 'info', params: {}, reportRef: 'capTrend' }],
      actions: [],
      asOf: '2026-10-01T08:00:00',
      kpi: { inflowPerMonth: 120, inflowPiecesPerMonth: 400, outputPerMonth: 100, outputPiecesPerMonth: 330, netPerMonth: 20, netPiecesPerMonth: 70, backlogMonths: 2.5, backlogMonthsPieces: 3.1, activeWip: 250, activeWipPieces: 820, bottleneckDepts: ['setting'] },
      series: [{ bucketEnd: '2026-09-01T00:00:00', inflow: 10, output: 8, completed: 7, activeWipEnd: 30, inflowPieces: 40, outputPieces: 30, completedPieces: 28, activeWipEndPieces: 120 }],
      departments,
      costCardToDone: { medianDays: 6, p90Days: 14, pendingNow: 12, pendingOver30d: 2, pendingActive: 8, pendingStale: 4, series: [{ bucketEnd: '2026-09-01T00:00:00', count: 5, medianDays: 6, p90Days: 9 }] },
      breakdown: {
        by: 'productType',
        rows: [{ key: 'RING', name: 'แหวนทอง', unit: 'PR.', inflowPiecesPerMonth: 120, outputPiecesPerMonth: 100, netPiecesPerMonth: 20, activeWipPieces: 300, activeWipPlans: 40 }],
        series: [{ bucketEnd: '2026-09-01T00:00:00', key: 'RING', inflowPieces: 40, outputPieces: 30 }]
      },
      filterOptions: { productTypes: [{ key: 'RING', name: 'แหวนทอง' }], golds: [], goldSizes: [] }
    }
  }
  return { data: [{ planId: 1, wo: 'WO', woNumber: '1', mold: 'M', productNumber: 'P', productName: 'N', costCardDate: '2026-09-02T00:00:00', daysSinceCostCard: 20 }], total: 1 }
}

function mountPage(props = {}) {
  return mount(InsightPage, {
    props: { config: capacityConfig, filter: buildDefaultCapacityFilter(), active: true, ...props },
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key), $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { ChartGeneric: true, InfoTipGeneric: true }
    }
  })
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))
const names = () => postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const settle = async () => {
  await flushPromises()
  await flushPromises()
}

describe('InsightPage + capacityConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('default tab is problems: only Capacity is fetched, filter options are emitted, no data-tab block is mounted', async () => {
    const wrapper = mountPage()
    await settle()
    expect(names()).toEqual(['Capacity'])
    ;['capKpi', 'capTrend', 'capDepartments', 'capBreakdown', 'capCostCard', 'capCostPending'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.findComponent(CapacityWhatIfPanel).exists()).toBe(false)
    expect(wrapper.vm.currentSub).toBe('problems')
    expect(wrapper.emitted('filter-options-loaded')).toHaveLength(1)
    expect(wrapper.emitted('filter-options-loaded')[0][0].productTypes[0].key).toBe('RING')
    expect(wrapper.findAll('.insight-sub-tabs [role="tab"]').map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (2)',
      'view.productionInsight.tabs.forecasts (1)',
      'view.productionInsight.tabs.actions (0)',
      'view.productionInsight.capacity.tabs.overview',
      'view.productionInsight.capacity.tabs.trend',
      'view.productionInsight.capacity.tabs.dept',
      'view.productionInsight.capacity.tabs.breakdown',
      'view.productionInsight.capacity.tabs.costcard',
      'view.productionInsight.capacity.tabs.costpending',
      'view.productionInsight.capacity.tabs.whatif'
    ])
  })

  it('data tabs mount on first visit with no extra request, except the pending table which fetches only when costpending opens', async () => {
    const wrapper = mountPage()
    await settle()
    postMock.mockClear()

    for (const [tab, id] of [['overview', 'capKpi'], ['trend', 'capTrend'], ['dept', 'capDepartments'], ['breakdown', 'capBreakdown'], ['costcard', 'capCostCard']]) {
      wrapper.vm.selectSub(tab)
      await settle()
      expect(anchor(wrapper, id), id).toBe(true)
      expect(postMock.mock.calls, tab).toHaveLength(0)
    }
    expect(anchor(wrapper, 'capCostPending')).toBe(false)

    wrapper.vm.selectSub('costpending')
    await settle()
    expect(names()).toEqual(['CostCardPendingPlans'])
    expect(anchor(wrapper, 'capCostPending')).toBe(true)
    expect(wrapper.html()).toContain('view.productionInsight.capacity.costCardPendingTableTitle')

    postMock.mockClear()
    wrapper.vm.selectSub('dept')
    wrapper.vm.selectSub('costpending')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)
    expect(wrapper.html()).toContain('แหวนทอง')
  })

  it('the cost-card tab keeps the card frame (title + summary + chart) without the pending table', async () => {
    const wrapper = mountPage({ sub: 'costcard' })
    await settle()
    const frame = wrapper.find('#insight-report-capCostCard')
    expect(frame.exists()).toBe(true)
    expect(frame.text()).toContain('view.productionInsight.capacity.costCardTitle')
    expect(frame.text()).toContain('view.productionInsight.capacity.costCardMedian')
    expect(frame.find('table').exists()).toBe(false)
    expect(postsTo('CostCardPendingPlans')).toHaveLength(0)
  })

  it('what-if tab mounts the panel with the filtered departments; department filter = 0 requests; editing numbers = 0 requests', async () => {
    const wrapper = mountPage({ sub: 'whatif' })
    await settle()
    const panel = wrapper.findComponent(CapacityWhatIfPanel)
    expect(panel.exists()).toBe(true)
    expect(panel.props('departments').map((d) => d.key)).toEqual(['setting', 'trim'])
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), departmentKeys: ['trim'] } })
    await settle()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.findComponent(CapacityWhatIfPanel).props('departments').map((d) => d.key)).toEqual(['trim'])

    wrapper.findComponent(CapacityWhatIfPanel).vm.onWorkersInput('trim', 9)
    await settle()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('link jumps: finding reportRefs open the right tab; KPI cards (capTrend / capDepartments / capCostCard) too', async () => {
    const wrapper = mountPage()
    await settle()
    const lists = wrapper.findAllComponents(InsightFindingList)

    lists[0].vm.$emit('goto-report', 'capCostCard')
    await settle()
    expect(wrapper.vm.currentSub).toBe('costcard')
    lists[0].vm.$emit('goto-report', 'capDepartments')
    await settle()
    expect(wrapper.vm.currentSub).toBe('dept')
    lists[1].vm.$emit('goto-report', 'capTrend')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    wrapper.vm.goToReport('capBreakdown')
    await settle()
    expect(wrapper.vm.currentSub).toBe('breakdown')

    wrapper.vm.selectSub('overview')
    await settle()
    const cards = wrapper.findAll('.stat-card')
    await cards[0].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    wrapper.vm.selectSub('overview')
    await cards[2].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('dept')
    wrapper.vm.selectSub('overview')
    await cards[4].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('costcard')
  })

  it('switching plan <-> piece refetches Capacity once and the department table headers follow the unit', async () => {
    const wrapper = mountPage({ sub: 'dept' })
    await settle()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), unit: 'piece' } })
    await settle()
    expect(names()).toEqual(['Capacity'])
    expect(postsTo('Capacity')[0][1].unit).toBe('piece')
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.capacity.deptColExitsPiece')
    expect(html).toContain('300')
  })

  it('clicking a breakdown row asks the page to set the filter; the parent applying it refetches Capacity exactly once', async () => {
    const wrapper = mountPage({ sub: 'breakdown' })
    await settle()
    postMock.mockClear()

    const row = wrapper.find('#insight-report-capBreakdown tbody tr')
    expect(row.exists()).toBe(true)
    await row.trigger('click')
    expect(wrapper.emitted('update-filter')).toEqual([[{ productTypes: ['RING'] }]])
    expect(postMock).not.toHaveBeenCalled()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), productTypes: ['RING'] } })
    await settle()
    expect(postsTo('Capacity')).toHaveLength(1)
    expect(postsTo('Capacity')[0][1].productTypes).toEqual(['RING'])
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('changing the breakdown dimension goes through update-filter, not page state', async () => {
    const wrapper = mountPage({ sub: 'breakdown' })
    await settle()
    const breakdownTable = capacityConfig.blocks.find((b) => b.id === 'capBreakdown').blocks[0]
    breakdownTable.toolbar.toggle.onChange(wrapper.vm.ctx, 'gold')
    expect(wrapper.emitted('update-filter')).toEqual([[{ breakdownBy: 'gold' }]])
  })

  it('clicking a department row changes the detail without any request', async () => {
    const wrapper = mountPage({ sub: 'dept' })
    await settle()
    postMock.mockClear()

    await wrapper.findAll('#insight-report-capDepartments tbody tr')[1].trigger('click')
    await settle()
    expect(wrapper.vm.state.capDept).toBe('trim')
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain(JSON.stringify({ name: 'view.executive.department.trim' }))
  })
})
