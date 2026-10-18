// materials-page.smoke.spec.js — mount InsightPage กับ materialsConfig จริงทั้งหน้า (โหมดแท็บ: block/ตาราง/สลอตจริง) ด้วยข้อมูลจำลอง
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Materials) · ตารางแต่ละตัวยิง endpoint ของตัวเองตอนเปิดแท็บเท่านั้น · ลิงก์จาก finding/การ์ด KPI กระโดดข้ามแท็บ · sub= sync
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
      problems: [
        { code: 'MAT_WAITING_PLANS', severity: 'warning', params: {}, reportRef: 'matWaiting' },
        { code: 'MAT_SHORT_LINES', severity: 'warning', params: {}, reportRef: 'matDemand' },
        { code: 'MAT_LOW_COVER', severity: 'info', params: {}, reportRef: 'matLowCover' }
      ],
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

const names = () => postMock.mock.calls.map((c) => c[0].split('/').pop()).sort()
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const settle = async () => {
  await flushPromises()
  await flushPromises()
}

describe('InsightPage + materialsConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('default tab is problems: only Materials is fetched and no data-tab block is mounted', async () => {
    const wrapper = mountPage()
    await settle()
    expect(names()).toEqual(['Materials'])
    ;['matKpi', 'matTrend', 'matWaiting', 'matDemand', 'matLowCover'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.vm.currentSub).toBe('problems')
    expect(wrapper.findAll('.insight-sub-tabs [role="tab"]').map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (3)',
      'view.productionInsight.tabs.forecasts (0)',
      'view.productionInsight.tabs.actions (0)',
      'view.productionInsight.materials.tabs.overview',
      'view.productionInsight.materials.tabs.trend',
      'view.productionInsight.materials.tabs.waiting',
      'view.productionInsight.materials.tabs.demand',
      'view.productionInsight.materials.tabs.lowcover'
    ])
  })

  it('overview / trend reuse Materials (no request); each table fetches its own endpoint once, only when its tab opens', async () => {
    const wrapper = mountPage()
    await settle()
    postMock.mockClear()

    for (const [tab, id] of [['overview', 'matKpi'], ['trend', 'matTrend']]) {
      wrapper.vm.selectSub(tab)
      await settle()
      expect(anchor(wrapper, id), id).toBe(true)
      expect(postMock.mock.calls, tab).toHaveLength(0)
    }
    expect(wrapper.html()).toContain('view.productionInsight.materials.statusEstimateNote')

    for (const [tab, id, endpoint] of [
      ['waiting', 'matWaiting', 'MaterialWaitingPlans'],
      ['demand', 'matDemand', 'MaterialGemDemand'],
      ['lowcover', 'matLowCover', 'MaterialGemLowCover']
    ]) {
      postMock.mockClear()
      wrapper.vm.selectSub(tab)
      await settle()
      expect(names(), tab).toEqual([endpoint])
      expect(anchor(wrapper, id), id).toBe(true)
    }

    // กลับไปแท็บที่เคยเปิดแล้ว = ไม่ยิงซ้ำ · ชื่อพลอยจาก master + ชิปสถานะ
    postMock.mockClear()
    wrapper.vm.selectSub('waiting')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)
    expect(wrapper.html()).toContain('ทับทิม กลม 3mm')
    expect(wrapper.html()).toContain('view.productionInsight.materials.gemStatus.unmatchedGem')
    expect(getMock.mock.calls.filter((c) => c[0] === 'Master/MasterGem')).toHaveLength(1)
    expect(getMock.mock.calls.filter((c) => c[0] === 'Master/MasterGemShape')).toHaveLength(1)
  })

  it('table toolbar state refetches only that table, once (waiting status / coverDays)', async () => {
    const wrapper = mountPage({ sub: 'waiting' })
    await settle()
    wrapper.vm.selectSub('lowcover')
    await settle()
    postMock.mockClear()

    wrapper.vm.setState('waitingStatus', 'short')
    await settle()
    expect(postsTo('MaterialWaitingPlans')).toHaveLength(1)
    expect(postsTo('MaterialWaitingPlans')[0][1].gemStatus).toBe('short')
    expect(postMock.mock.calls).toHaveLength(1)

    postMock.mockClear()
    wrapper.vm.setState('coverDays', 45)
    await settle()
    expect(postsTo('MaterialGemLowCover')).toHaveLength(1)
    expect(postsTo('MaterialGemLowCover')[0][1].coverDays).toBe(45)
    expect(postMock.mock.calls).toHaveLength(1)
  })

  it('a range change refetches only Materials; snapshot tables that were never opened stay untouched', async () => {
    const wrapper = mountPage()
    await settle()
    postMock.mockClear()

    await wrapper.setProps({ filter: { ...buildDefaultMaterialsFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01') } })
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['ProductionInsight/Materials'])
  })

  it('"ดู ›" on a finding lands on the tab of its table and fetches that endpoint once', async () => {
    const wrapper = mountPage()
    await settle()
    const list = wrapper.findAllComponents(InsightFindingList)[0]

    for (const [ref, tab, endpoint] of [['matWaiting', 'waiting', 'MaterialWaitingPlans'], ['matDemand', 'demand', 'MaterialGemDemand'], ['matLowCover', 'lowcover', 'MaterialGemLowCover']]) {
      postMock.mockClear()
      list.vm.$emit('goto-report', ref)
      await settle()
      expect(wrapper.vm.currentSub, ref).toBe(tab)
      expect(names(), ref).toEqual([endpoint])
    }
    wrapper.vm.goToReport('matKpi')
    await settle()
    expect(wrapper.vm.currentSub).toBe('overview')
    wrapper.vm.goToReport('matTrend')
    await settle()
    expect(wrapper.vm.currentSub).toBe('trend')
  })

  it('KPI cards jump to their table / chart tab', async () => {
    const wrapper = mountPage()
    await settle()
    wrapper.vm.selectSub('overview')
    await settle()
    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(4)
    const expected = ['waiting', 'trend', 'demand', 'waiting']
    for (let i = 0; i < expected.length; i += 1) {
      wrapper.vm.selectSub('overview')
      await settle()
      await cards[i].trigger('click')
      await settle()
      expect(wrapper.vm.currentSub, `card ${i}`).toBe(expected[i])
    }
  })

  it('sub= sync: the page emits update:sub and honours the sub prop; unknown values fall back to problems', async () => {
    const wrapper = mountPage({ sub: 'demand' })
    await settle()
    expect(wrapper.vm.currentSub).toBe('demand')
    expect(names()).toContain('MaterialGemDemand')
    wrapper.vm.selectSub('trend')
    expect(wrapper.emitted('update:sub').at(-1)).toEqual(['trend'])
    await wrapper.setProps({ sub: 'bogus' })
    await settle()
    expect(wrapper.vm.currentSub).toBe('problems')
  })
})
