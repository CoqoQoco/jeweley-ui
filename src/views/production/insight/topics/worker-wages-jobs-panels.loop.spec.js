// worker-wages-jobs-panels.loop.spec.js — mount แท็บ ค่าแรง/ใบงาน ของโปรไฟล์ช่างด้วย KpiBlock/TrendBlock/TableBlock/ChartGeneric ตัวจริง
// จับ render วน (Vue warn "Maximum recursive updates"), re-render เกินเพดาน, request ซ้ำเมื่อ parent ส่ง pageFilter ใหม่ที่ค่าเท่าเดิม
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn() } }
}))

import WorkerWagesPanel from '../components/worker-wages-panel.vue'
import WorkerJobsPanel from '../components/worker-jobs-panel.vue'
import { buildDefaultWorkersFilter } from '../insight-filters.js'

const MAX_TICKS = 12
const MAX_UPDATES_PER_COMPONENT = 25

function respond(path) {
  if (path.endsWith('/Workers')) {
    return {
      workers: [
        { code: 'P1', deptKey: 'plating', wages: 1000, jobs: 10, plans: 5, wagePerJob: 100, shareOfDeptJobs: 25 },
        { code: 'P2', deptKey: 'plating', wages: 3000, jobs: 30, plans: 15, wagePerJob: 100, shareOfDeptJobs: 75 }
      ]
    }
  }
  if (path.endsWith('/WorkerMonthly')) return { series: [{ bucketEnd: '2026-08-31T00:00:00', jobs: 5, wages: 400 }, { bucketEnd: '2026-09-30T00:00:00', jobs: 5, wages: 600 }] }
  return { data: [{ planId: 1, wo: 'WO', woNumber: '1', workerCode: 'P1', deptKey: 'plating', jobDate: '2026-09-01T00:00:00', checkGram: 1 }], total: 1 }
}

const updates = {}
const countUpdates = {
  updated() {
    const name = this.$options.name || this.$options.__name || 'anonymous'
    updates[name] = (updates[name] || 0) + 1
  }
}

async function settle() {
  for (let i = 0; i < MAX_TICKS; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await flushPromises()
  }
}

const worker = { workerType: null, workerCode: 'P1', workerName: 'พี', deptKey: 'plating' }

function mountPanel(component, props = {}) {
  const warnings = []
  const wrapper = mount(component, {
    props: { worker, pageFilter: buildDefaultWorkersFilter(), ...props },
    global: {
      plugins: [PrimeVue],
      mixins: [countUpdates],
      components: { apexchart: { name: 'apexchart', props: ['type', 'series', 'options', 'height'], template: '<div class="apex-stub" />' } },
      config: { warnHandler: (message) => warnings.push(message) },
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      }
    }
  })
  return { wrapper, warnings }
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))
const checkUpdates = () => Object.entries(updates).forEach(([name, count]) => expect(count, `${name} updated ${count}x`).toBeLessThanOrEqual(['Column', 'HeaderCell'].includes(name) ? 60 : MAX_UPDATES_PER_COMPONENT))

describe('Worker wages / jobs panels — real blocks (loop guard)', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    Object.keys(updates).forEach((key) => delete updates[key])
  })

  it('wages: one Workers + one WorkerMonthly request, derived KPIs rendered, bounded re-renders, stable on equal-valued pageFilter', async () => {
    const { wrapper, warnings } = mountPanel(WorkerWagesPanel)
    await settle()
    expect(postsTo('Workers')).toHaveLength(1)
    expect(postsTo('WorkerMonthly')).toHaveLength(1)
    expect(postMock).toHaveBeenCalledTimes(2)
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    // ค่าแรงรวม 1,000 · เฉลี่ย 2 เดือน = 500/เดือน · สัดส่วนค่าแรงในแผนก 1000/4000 = 25%
    const text = wrapper.text()
    expect(text).toContain('฿1,000')
    expect(text).toContain('"avg":"฿500"')
    expect(text).toContain('25')
    expect(wrapper.emitted('worker-info')[0][0]).toMatchObject({ employmentType: null })
    checkUpdates()

    const calls = postMock.mock.calls.length
    const filter = wrapper.props('pageFilter')
    for (let i = 0; i < 3; i += 1) {
      await wrapper.setProps({ pageFilter: { ...filter } })
      await settle()
    }
    expect(postMock.mock.calls.length).toBe(calls)
    expect(warnings.filter((w) => /Maximum recursive updates/.test(w))).toEqual([])
  })

  it('wages: a worker without a Workers row shows the note and dashes instead of failing', async () => {
    const { wrapper, warnings } = mountPanel(WorkerWagesPanel, { worker: { ...worker, workerCode: 'NONE' } })
    await settle()
    expect(wrapper.text()).toContain('view.productionInsight.workerProfile.wages.noRow')
    expect(warnings.filter((w) => /Maximum recursive updates/.test(w))).toEqual([])
  })

  it('wages: switching worker refetches both endpoints once with the new code', async () => {
    const { wrapper } = mountPanel(WorkerWagesPanel)
    await settle()
    postMock.mockClear()
    await wrapper.setProps({ worker: { ...worker, workerCode: 'P2' } })
    await settle()
    expect(postsTo('Workers')).toHaveLength(1)
    expect(postsTo('WorkerMonthly')).toHaveLength(1)
    expect(postsTo('WorkerMonthly')[0][1]).toMatchObject({ code: 'P2', deptKey: 'plating' })
  })

  it('jobs: one UnpaidPieceJobs request for the whole department, rows filtered to the worker, bounded re-renders', async () => {
    const { wrapper, warnings } = mountPanel(WorkerJobsPanel)
    await settle()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postsTo('UnpaidPieceJobs')[0][1]).toMatchObject({ departmentKeys: ['plating'], take: 0, skip: 0 })
    expect(wrapper.text()).toContain('01/09/2026')
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    checkUpdates()

    const calls = postMock.mock.calls.length
    await wrapper.setProps({ pageFilter: { ...wrapper.props('pageFilter') } })
    await settle()
    expect(postMock.mock.calls.length).toBe(calls)
  })
})
