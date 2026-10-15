// materials-page.smoke.spec.js — mount InsightPage กับ materialsConfig จริงทั้งหน้า (block/ตาราง/สลอตจริง) ด้วยข้อมูลจำลอง
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
import { materialsConfig } from './materials.config.js'
import { buildDefaultMaterialsFilter } from '../insight-filters.js'

const waitingRow = {
  planId: 1,
  wo: 'WO',
  woNumber: '1',
  productNumber: 'P1',
  productName: 'แหวน',
  requestDate: '2026-09-01T00:00:00',
  enteredGemSortDate: '2026-09-05T00:00:00',
  waitingDays: 7,
  dueDate: '2026-10-20T00:00:00',
  workers: ['สมชาย'],
  gems: [
    { gem: 'RB', shape: 'RD', size: '3mm', metal: 'GOLD', qty: 4, available: 1, status: 'short' },
    { gem: 'ZZ', shape: 'RD', size: '2mm', qty: 2, status: 'unmatched', unmatchedReason: 'gem' }
  ]
}

function respond(path) {
  if (path.endsWith('/Materials')) {
    return {
      status: 'warning',
      problems: [],
      forecasts: [],
      actions: [],
      asOf: '2026-10-01T08:00:00',
      kpi: { waitingPlans: 3, waitingMedianDays: 4, issueMedianDays: 6, issueP90Days: 10, shortLines: 2, shortPlans: 1, matchedLines: 8, totalLines: 10 },
      series: [{ bucketEnd: '2026-09-01T00:00:00', entered: 5, issueMedianDays: 4, issueP90Days: 9 }]
    }
  }
  if (path.endsWith('/MaterialWaitingPlans')) return { data: [waitingRow], total: 1 }
  if (path.endsWith('/MaterialGemDemand')) return { data: [{ gem: 'RB', shape: 'RD', size: '3', metal: 'GOLD', waitingPlans: 2, upcomingPlans: 1, requiredQty: 9, available: 3, usedPerMonth: 4, coverDays: 20, status: 'short' }], total: 1 }
  if (path.endsWith('/MaterialGemLowCover')) return { data: [{ code: 'G1', groupName: 'ทับทิม', shape: 'กลม', size: '3', grade: 'A', quantity: 5, used90d: 30, coverDays: 12 }], total: 1 }
  if (path === 'Master/MasterGem') return [{ code: 'RB', nameTh: 'ทับทิม' }]
  if (path === 'Master/MasterGemShape') return [{ code: 'RD', description: 'กลม' }]
  return []
}

function mountPage(props = {}) {
  return mount(InsightPage, {
    props: { config: materialsConfig, filter: buildDefaultMaterialsFilter(), active: true, ...props },
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key), $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { ChartGeneric: true, InfoTipGeneric: true }
    }
  })
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))

describe('InsightPage + materialsConfig (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders all 5 anchors, fetches every endpoint once and resolves gem names from the master', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;['matKpi', 'matTrend', 'matWaiting', 'matDemand', 'matLowCover'].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))
    ;['Materials', 'MaterialWaitingPlans', 'MaterialGemDemand', 'MaterialGemLowCover'].forEach((name) => expect(postsTo(name), name).toHaveLength(1))
    expect(getMock.mock.calls.filter((c) => c[0] === 'Master/MasterGem')).toHaveLength(1)
    expect(getMock.mock.calls.filter((c) => c[0] === 'Master/MasterGemShape')).toHaveLength(1)

    // ชื่อพลอยจาก master + ชิปสถานะ + asOf + note ใต้การ์ด
    expect(html).toContain('ทับทิม กลม 3mm')
    expect(html).toContain('view.productionInsight.materials.gemStatus.unmatchedGem')
    expect(html).toContain('view.productionInsight.materials.statusEstimateNote')
    expect(html).toContain('view.executive.asOf')
  })

  it('table toolbar state refetches only that table, once (waiting status / demand status / coverDays)', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    wrapper.vm.setState('waitingStatus', 'short')
    await flushPromises()
    expect(postsTo('MaterialWaitingPlans')).toHaveLength(1)
    expect(postsTo('MaterialWaitingPlans')[0][1].gemStatus).toBe('short')
    expect(postMock.mock.calls).toHaveLength(1)

    postMock.mockClear()
    wrapper.vm.setState('coverDays', 45)
    await flushPromises()
    expect(postsTo('MaterialGemLowCover')).toHaveLength(1)
    expect(postsTo('MaterialGemLowCover')[0][1].coverDays).toBe(45)
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('a range change refetches only Materials; the snapshot tables stay untouched', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultMaterialsFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01') } })
    await flushPromises()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['ProductionInsight/Materials'])
  })
})
