// worker-loss-panel.loop.spec.js — mount แท็บ Loss ทองของโปรไฟล์ช่าง (ไม่มี ModalView) ด้วย PlanTableBlock / TrendBlock / ChartGeneric /
// DataTableWithPaging ตัวจริง แล้วจับอาการ render วน: Vue warn "Maximum recursive updates", จำนวน re-render เกินเพดาน, request ซ้ำ
// ทุก loop ของเทสมีเพดานรอบตายตัว — ถ้ามี loop จริงจะ FAIL ที่เพดาน ไม่ค้าง vitest
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn() } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ success: vi.fn(), warning: vi.fn() }))

import WorkerLossPanel from '../components/worker-loss-panel.vue'
import { buildDefaultGoldFilter } from '../insight-filters.js'

const PEERS = [
  { workerType: 80, workerCode: 'B004', lossPercent: 4 },
  { workerType: 80, workerCode: 'B009', lossPercent: 2 },
  { workerType: 80, workerCode: 'B010', lossPercent: 1 }
]

const MAX_TICKS = 12
const MAX_UPDATES_PER_COMPONENT = 25

function respond(path) {
  if (path.endsWith('/Gold')) {
    return {
      asOf: '2026-10-01T08:00:00',
      kpi: [{ workerType: 80, lossPercent: 3.4, allowedPercent: 2, targetPercent: 3, excessGram: 5, excessMoney: 1000, coverageJobs: 8, coverageTotalJobs: 10, coveragePercent: 80 }],
      series: [
        { workerType: 80, bucketEnd: '2026-09-07T00:00:00', rawLossGram: 5, allowedGram: 4, lossPercent: 3, allowedPercent: 2 },
        { workerType: 80, bucketEnd: '2026-09-14T00:00:00', rawLossGram: 6, allowedGram: 4, lossPercent: 4, allowedPercent: 2 }
      ],
      targets: [{ workerType: 80, metal: 'GOLD', targetPercent: 3, source: 'saved' }],
      workers: [
        { workerType: 80, workerCode: 'B004', workerName: 'ศิริมงคล', lossPercent: 4 },
        { workerType: 80, workerCode: 'B009', workerName: 'อื่น', lossPercent: 2 }
      ]
    }
  }
  return {
    data: [{ planId: 1, slipId: 1, wo: 'WO', woNumber: '1', deptKey: 'setting', workerCode: 'B004', workerName: 'ศิริมงคล', documentNo: 'S-1', workerType: 80, requestDateStart: '2026-09-01T00:00:00', requestDateEnd: '2026-09-02T00:00:00' }],
    total: 1
  }
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

function mountBody(props = {}) {
  const warnings = []
  const wrapper = mount(WorkerLossPanel, {
    props: {
      worker: { workerType: 80, workerCode: 'B004', workerName: '', deptKey: 'setting' },
      peers: PEERS,
      pageFilter: { ...buildDefaultGoldFilter(), lens: 'setting', metal: 'GOLD' },
      ...props
    },
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

describe('WorkerLossPanel — real PlanTableBlock/TrendBlock/ChartGeneric (loop guard)', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    Object.keys(updates).forEach((key) => delete updates[key])
  })

  it('mounts without recursive-update warnings, bounded re-renders and one request per endpoint', async () => {
    const { wrapper, warnings } = mountBody()
    await settle()

    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => expect(postsTo(name), name).toHaveLength(1))
    expect(postMock).toHaveBeenCalledTimes(3)
    // PrimeVue Column/HeaderCell มีหลาย instance ต่อตาราง (นับรวมตามชื่อ) จึงใช้เพดานตามจำนวนคอลัมน์ ไม่ใช่เพดานต่อ instance
    Object.entries(updates).forEach(([name, count]) => expect(count, `${name} updated ${count}x`).toBeLessThanOrEqual(['Column', 'HeaderCell'].includes(name) ? 60 : MAX_UPDATES_PER_COMPONENT))
    expect(updates.WorkerLossPanel || 0).toBeLessThanOrEqual(5)
    expect(updates.PlanTableBlock || 0).toBeLessThanOrEqual(10)
    expect(wrapper.text()).toContain('S-1')
    // การ์ดอันดับ: B004 สูงสุด 1/3 จาก peers ที่หน้าส่งมา (ไม่ยิง Gold เพื่อนร่วมประเภทเพิ่ม)
    expect(wrapper.text()).toContain('1/3')
    expect(wrapper.emitted('worker-name')[0]).toEqual(['ศิริมงคล'])
  })

  it('stays quiet afterwards: more ticks add no requests and no re-renders', async () => {
    mountBody()
    await settle()
    const before = JSON.stringify(updates)
    const calls = postMock.mock.calls.length
    await settle()
    expect(postMock.mock.calls.length).toBe(calls)
    expect(JSON.stringify(updates)).toBe(before)
  })

  it('a parent re-render that passes an equal-but-new pageFilter object does not refetch or re-render in a loop', async () => {
    const { wrapper, warnings } = mountBody()
    await settle()
    const calls = postMock.mock.calls.length
    for (let i = 0; i < 3; i += 1) {
      await wrapper.setProps({ pageFilter: { ...buildDefaultGoldFilter(), lens: 'setting', metal: 'GOLD', start: wrapper.props('pageFilter').start, end: wrapper.props('pageFilter').end } })
      await settle()
    }
    expect(postMock.mock.calls.length).toBe(calls)
    expect(warnings.filter((w) => /Maximum recursive updates/.test(w))).toEqual([])
    expect(updates.PlanTableBlock || 0).toBeLessThanOrEqual(15)
  })

  it('switching to another worker refetches each endpoint once more with the new code', async () => {
    const { wrapper } = mountBody()
    await settle()
    postMock.mockClear()
    await wrapper.setProps({ worker: { workerType: 80, workerCode: 'B005', workerName: '', deptKey: 'setting' } })
    await settle()
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => {
      expect(postsTo(name), name).toHaveLength(1)
      expect(postsTo(name)[0][1].workerCodes, name).toEqual(['B005'])
    })
  })

  it('without peers from the page it fetches the whole type once for the rank card (one extra Gold call without worker codes)', async () => {
    const { wrapper } = mountBody({ peers: null })
    await settle()
    expect(postsTo('Gold')).toHaveLength(2)
    expect(postsTo('Gold').map((c) => c[1].workerCodes).sort()).toEqual([[], ['B004']])
    expect(postMock).toHaveBeenCalledTimes(4)
    expect(wrapper.text()).toContain('1/2')
  })
})
