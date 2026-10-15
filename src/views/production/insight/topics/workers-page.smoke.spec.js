// workers-page.smoke.spec.js — mount InsightPage กับ workersConfig จริงทั้งหน้า (block/ตาราง/สลอต/toolbar จริง) ด้วยข้อมูลจำลอง
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
import { workersConfig } from './workers.config.js'
import { buildDefaultWorkersFilter } from '../insight-filters.js'

const workerRows = [
  { code: 'A', name: 'อา', deptKey: 'setting', employmentType: 'IN_HOUSE', jobs: 10, plans: 8, wages: 5000, wagePerJob: 500, shareOfDeptJobs: 60, isRateOutlier: true, goldLossPercent: 1.2 },
  { code: 'B', name: 'บี', deptKey: 'trim', employmentType: 'OUTSIDE', jobs: 5, plans: 5, wages: 9000, wagePerJob: 100, shareOfDeptJobs: 20, isConcentrated: true }
]

function respond(path) {
  if (path.endsWith('/Workers')) {
    return {
      status: 'ok',
      problems: [],
      forecasts: [],
      actions: [],
      asOf: '2026-10-01T08:00:00',
      kpi: { wagesPerMonth: 100000, wagePerOutputPlan: 500, activeWorkers: 2, outsideWageShare: 50, excludesSalaried: true, wagesByDept: [{ deptKey: 'setting', share: 60 }], activeWorkersByDept: [{ deptKey: 'trim', count: 1 }] },
      series: [{ bucketEnd: '2026-09-01T00:00:00', deptKey: 'setting', wages: 100 }],
      seriesTotal: [{ wagePerPlan: 500 }],
      workers: workerRows,
      concentration: [{ deptKey: 'setting' }]
    }
  }
  if (path.endsWith('/WorkerMonthly')) return { series: [{ bucketEnd: '2026-09-01T00:00:00', jobs: 3, wages: 900 }] }
  if (path.endsWith('/UnpaidPieceJobs')) return { data: [{ planId: 1, wo: 'WO', woNumber: '1', deptKey: 'setting', workerCode: 'W1', workerName: 'สมชาย', jobDate: '2026-09-01T00:00:00', checkGram: 12.345 }], total: 1 }
  return []
}

function mountPage(props = {}) {
  return mount(InsightPage, {
    props: { config: workersConfig, filter: buildDefaultWorkersFilter(), active: true, ...props },
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key), $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { ChartGeneric: true, InfoTipGeneric: true, MultiSelectGeneric: true }
    }
  })
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))

describe('InsightPage + workersConfig (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders the 4 anchors, fetches Workers + UnpaidPieceJobs once and NOT WorkerMonthly (nothing selected)', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;['wrkKpi', 'wrkTrend', 'wrkTable', 'wrkUnpaid'].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))
    expect(postsTo('Workers')).toHaveLength(1)
    expect(postsTo('UnpaidPieceJobs')).toHaveLength(1)
    expect(postsTo('WorkerMonthly')).toHaveLength(0)
    expect(html).toContain('บี')
    expect(html).toContain('฿9,000')
    expect(html).toContain('view.productionInsight.workers.tableWageComparableNote')
    expect(html).not.toContain('view.productionInsight.workers.detailTitle')
    expect(wrapper.vm.state.selectedWorker).toBeNull()
  })

  it('table filters are client-side only: 0 requests, rows shrink', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    wrapper.vm.setState('tableType', 'OUTSIDE')
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain('บี')
    expect(wrapper.html()).not.toContain('>อา<')

    wrapper.vm.setState('tableType', 'ALL')
    wrapper.vm.setState('tableDept', ['setting'])
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain('อา')
  })

  it('selecting a worker fires WorkerMonthly once with code + deptKey + range and shows the detail box', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    wrapper.vm.setState('selectedWorker', { code: 'A', deptKey: 'setting', name: 'อา' })
    await flushPromises()
    expect(postMock.mock.calls).toHaveLength(1)
    expect(postsTo('WorkerMonthly')).toHaveLength(1)
    expect(postsTo('WorkerMonthly')[0][1]).toMatchObject({ code: 'A', deptKey: 'setting' })
    expect(wrapper.html()).toContain('view.productionInsight.workers.detailTitle')
  })

  it('range change with a selected worker → Workers + WorkerMonthly + Unpaid once each; the selection survives while the worker exists', async () => {
    const wrapper = mountPage()
    await flushPromises()
    wrapper.vm.setState('selectedWorker', { code: 'A', deptKey: 'setting', name: 'อา' })
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultWorkersFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01') } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()).toEqual(['UnpaidPieceJobs', 'WorkerMonthly', 'Workers'])
    expect(wrapper.vm.state.selectedWorker).toMatchObject({ code: 'A' })
  })

  it('the selection is cleared (and WorkerMonthly stops) when the worker disappears after a reload', async () => {
    const wrapper = mountPage()
    await flushPromises()
    wrapper.vm.setState('selectedWorker', { code: 'GONE', deptKey: 'setting', name: 'x' })
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultWorkersFilter(), departmentKeys: ['trim'] } })
    await flushPromises()
    expect(wrapper.vm.state.selectedWorker).toBeNull()
    expect(wrapper.vm.responses.WorkerMonthly).toBeUndefined()
    expect(wrapper.html()).not.toContain('view.productionInsight.workers.detailTitle')
  })
})
