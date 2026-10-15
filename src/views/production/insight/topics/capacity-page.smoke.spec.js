// capacity-page.smoke.spec.js — mount InsightPage กับ capacityConfig จริงทั้งหน้า (block/ตาราง/slot แผงจำลองจริง) ด้วยข้อมูลจำลอง
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
      problems: [],
      forecasts: [],
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

describe('InsightPage + capacityConfig (smoke)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders every anchor + the what-if panel, fetches Capacity and CostCardPendingPlans once, and emits the filter options', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;['capKpi', 'capTrend', 'capDepartments', 'capBreakdown', 'capCostCard', 'capWhatIf'].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))
    expect(postsTo('Capacity')).toHaveLength(1)
    expect(postsTo('CostCardPendingPlans')).toHaveLength(1)
    expect(postMock.mock.calls).toHaveLength(2)
    expect(html).toContain('แหวนทอง')
    expect(wrapper.emitted('filter-options-loaded')).toHaveLength(1)
    expect(wrapper.emitted('filter-options-loaded')[0][0].productTypes[0].key).toBe('RING')
  })

  it('department filter = 0 requests and the what-if panel gets only the filtered departments', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), departmentKeys: ['trim'] } })
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.findComponent(CapacityWhatIfPanel).props('departments').map((d) => d.key)).toEqual(['trim'])
  })

  it('editing numbers in the what-if panel = 0 requests', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    wrapper.findComponent(CapacityWhatIfPanel).vm.onWorkersInput('setting', 9)
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('switching plan ↔ piece refetches Capacity once (unit is in the old serverFilterKey) and the table headers/values follow the unit', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), unit: 'piece' } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0].split('/').pop())).toEqual(['Capacity'])
    expect(postsTo('Capacity')[0][1].unit).toBe('piece')
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.capacity.deptColExitsPiece')
    expect(html).toContain('300')
  })

  it('clicking a breakdown row asks the page to set the filter; the parent applying it refetches Capacity exactly once', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    const row = wrapper.find('#insight-report-capBreakdown tbody tr')
    expect(row.exists()).toBe(true)
    await row.trigger('click')
    expect(wrapper.emitted('update-filter')).toEqual([[{ productTypes: ['RING'] }]])
    expect(postMock).not.toHaveBeenCalled()

    await wrapper.setProps({ filter: { ...buildDefaultCapacityFilter(), productTypes: ['RING'] } })
    await flushPromises()
    expect(postsTo('Capacity')).toHaveLength(1)
    expect(postsTo('Capacity')[0][1].productTypes).toEqual(['RING'])
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('changing the breakdown dimension goes through update-filter, not page state', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const breakdownTable = capacityConfig.blocks[3].blocks[0]
    breakdownTable.toolbar.toggle.onChange(wrapper.vm.ctx, 'gold')
    expect(wrapper.emitted('update-filter')).toEqual([[{ breakdownBy: 'gold' }]])
  })

  it('clicking a department row changes the detail without any request', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    wrapper.vm.setState('capDept', 'trim')
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain(JSON.stringify({ name: 'view.executive.department.trim' }))
  })
})
