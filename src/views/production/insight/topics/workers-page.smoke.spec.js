// workers-page.smoke.spec.js — mount InsightPage กับ workersConfig จริงทั้งหน้า (โหมดแท็บ: block/ตาราง/toolbar จริง) ด้วยข้อมูลจำลอง
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Workers) · แท็บข้อมูล mount เมื่อเปิดครั้งแรก · UnpaidPieceJobs ยิงเมื่อเปิดแท็บ unpaid ·
// WorkerMonthly ยิงเมื่อเลือกช่างในแท็บ workers · "ดู ›"/การ์ด KPI กระโดดข้ามแท็บ · toolbar แผนก/ประเภทฝั่ง client ทำงานเหมือนเดิม
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
      problems: [
        { code: 'WRK_CONCENTRATION', severity: 'warning', params: {}, reportRef: 'wrkTable' },
        { code: 'WRK_UNPAID_JOBS', severity: 'warning', params: {}, reportRef: 'wrkUnpaid' }
      ],
      forecasts: [{ code: 'FC_WAGES_NEXT_MONTH', severity: 'info', params: {}, reportRef: 'wrkTrend' }],
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
const names = () => postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const settle = async () => {
  await flushPromises()
  await flushPromises()
}

describe('InsightPage + workersConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('default tab is problems: only Workers is fetched and no data-tab block is mounted', async () => {
    const wrapper = mountPage()
    await settle()
    expect(names()).toEqual(['Workers'])
    ;['wrkKpi', 'wrkTrend', 'wrkTable', 'wrkUnpaid'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.vm.currentSub).toBe('problems')
    expect(wrapper.findAll('.insight-sub-tabs [role="tab"]').map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (2)',
      'view.productionInsight.tabs.forecasts (1)',
      'view.productionInsight.tabs.actions (0)',
      'view.productionInsight.workers.tabs.overview',
      'view.productionInsight.workers.tabs.trend',
      'view.productionInsight.workers.tabs.workers',
      'view.productionInsight.workers.tabs.unpaid'
    ])
  })

  it('overview / trend / workers tabs mount with no extra request; UnpaidPieceJobs only fires when the unpaid tab opens', async () => {
    const wrapper = mountPage()
    await settle()
    postMock.mockClear()

    for (const [tab, id] of [['overview', 'wrkKpi'], ['trend', 'wrkTrend'], ['workers', 'wrkTable']]) {
      wrapper.vm.selectSub(tab)
      await settle()
      expect(anchor(wrapper, id), id).toBe(true)
      expect(postMock.mock.calls, tab).toHaveLength(0)
    }
    expect(anchor(wrapper, 'wrkUnpaid')).toBe(false)
    expect(wrapper.html()).toContain('บี')
    expect(wrapper.html()).toContain('฿9,000')
    expect(wrapper.html()).toContain('view.productionInsight.workers.tableWageComparableNote')

    wrapper.vm.selectSub('unpaid')
    await settle()
    expect(names()).toEqual(['UnpaidPieceJobs'])
    expect(anchor(wrapper, 'wrkUnpaid')).toBe(true)

    postMock.mockClear()
    wrapper.vm.selectSub('overview')
    wrapper.vm.selectSub('unpaid')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)
  })

  it('table filters are client-side only: 0 requests, rows shrink', async () => {
    const wrapper = mountPage({ sub: 'workers' })
    await settle()
    postMock.mockClear()

    wrapper.vm.setState('tableType', 'OUTSIDE')
    await settle()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain('บี')
    expect(wrapper.html()).not.toContain('>อา<')

    wrapper.vm.setState('tableType', 'ALL')
    wrapper.vm.setState('tableDept', ['setting'])
    await settle()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.html()).toContain('อา')
  })

  it('clicking a worker row in the workers tab fires WorkerMonthly once with code + deptKey + range and shows the detail box', async () => {
    const wrapper = mountPage({ sub: 'workers' })
    await settle()
    expect(postsTo('WorkerMonthly')).toHaveLength(0)
    postMock.mockClear()

    await wrapper.findAll('#insight-report-wrkTable tbody tr')[0].trigger('click')
    await settle()
    expect(names()).toEqual(['WorkerMonthly'])
    expect(postsTo('WorkerMonthly')[0][1]).toMatchObject({ code: 'B', deptKey: 'trim' })
    expect(wrapper.html()).toContain('view.productionInsight.workers.detailTitle')
  })

  it('WorkerMonthly stays disabled until the workers tab has been opened', async () => {
    const wrapper = mountPage()
    await settle()
    postMock.mockClear()
    wrapper.vm.setState('selectedWorker', { code: 'A', deptKey: 'setting', name: 'อา' })
    await settle()
    expect(postMock).not.toHaveBeenCalled()

    wrapper.vm.selectSub('workers')
    await settle()
    expect(names()).toEqual(['WorkerMonthly'])
  })

  it('range change with a selected worker -> Workers + WorkerMonthly + Unpaid (opened tabs) once each; the selection survives while the worker exists', async () => {
    const wrapper = mountPage({ sub: 'workers' })
    await settle()
    wrapper.vm.selectSub('unpaid')
    wrapper.vm.setState('selectedWorker', { code: 'A', deptKey: 'setting', name: 'อา' })
    await settle()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultWorkersFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01') } })
    await settle()
    expect(names()).toEqual(['UnpaidPieceJobs', 'WorkerMonthly', 'Workers'])
    expect(wrapper.vm.state.selectedWorker).toMatchObject({ code: 'A' })
  })

  it('the selection is cleared (and WorkerMonthly stops) when the worker disappears after a reload', async () => {
    const wrapper = mountPage({ sub: 'workers' })
    await settle()
    wrapper.vm.setState('selectedWorker', { code: 'GONE', deptKey: 'setting', name: 'x' })
    await settle()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultWorkersFilter(), departmentKeys: ['trim'] } })
    await settle()
    expect(wrapper.vm.state.selectedWorker).toBeNull()
    expect(wrapper.vm.responses.WorkerMonthly).toBeUndefined()
    expect(wrapper.html()).not.toContain('view.productionInsight.workers.detailTitle')
  })

  it('link jumps: finding refs and KPI cards land on the right tab (fetching only what that needs)', async () => {
    const wrapper = mountPage()
    await settle()
    const lists = wrapper.findAllComponents(InsightFindingList)

    postMock.mockClear()
    lists[0].vm.$emit('goto-report', 'wrkUnpaid')
    await settle()
    expect(wrapper.vm.currentSub).toBe('unpaid')
    expect(names()).toEqual(['UnpaidPieceJobs'])

    lists[0].vm.$emit('goto-report', 'wrkTable')
    await settle()
    expect(wrapper.vm.currentSub).toBe('workers')
    lists[1].vm.$emit('goto-report', 'wrkTrend')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
    wrapper.vm.goToReport('wrkKpi')
    await settle()
    expect(wrapper.vm.currentSub).toBe('overview')

    const cards = wrapper.findAll('.stat-card')
    const expected = ['trend', 'trend', 'workers', 'workers']
    for (let i = 0; i < expected.length; i += 1) {
      wrapper.vm.selectSub('overview')
      await settle()
      await cards[i].trigger('click')
      await settle()
      expect(wrapper.vm.currentSub, `card ${i}`).toBe(expected[i])
    }
  })
})
