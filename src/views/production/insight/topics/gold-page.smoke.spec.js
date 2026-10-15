// gold-page.smoke.spec.js — mount InsightPage กับ goldConfig จริงทั้งหน้า (block/ตาราง/toolbar/drawer ตั้งเป้าจริง) ด้วยข้อมูลจำลอง
// ตรวจ: endpoint ละ 1 ครั้ง · toggle ประเภทช่าง/คลิกแถวแผนก = 0 request · draft เป้า → Gold+GoldByStage 1 ครั้ง · includeQueue → pending 1 ครั้ง · metal ส่งถูกทุก endpoint
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({
  hasStandardEditAccess: () => true
}))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ success: vi.fn(), warning: vi.fn() }))

import InsightPage from '@/components/insight/page/InsightPage.vue'
import TargetDrawer from '@/components/insight/page/blocks/TargetDrawer.vue'
import { goldConfig } from './gold.config.js'
import { buildDefaultGoldFilter } from '../insight-filters.js'

const departments = [
  {
    deptKey: 'trim',
    includesScrap: true,
    notWeighed: false,
    returnedSendGram: 100,
    receivedGram: 98,
    diffGram: 2,
    diffPercent: 2,
    targetPercent: null,
    slipLossPercent: 1.5,
    workers: []
  },
  {
    deptKey: 'setting',
    includesScrap: false,
    notWeighed: false,
    returnedSendGram: 200,
    receivedGram: 190,
    diffGram: 10,
    diffPercent: 5,
    targetPercent: 3,
    slipLossPercent: 2,
    pendingWithWorkerCount: 2,
    pendingWithWorkerGram: 12,
    workers: [{ workerCode: 'W9', rows: 4, returnedSendGram: 50, diffGram: 1, diffPercent: 2 }]
  },
  { deptKey: 'gemSort', includesScrap: false, notWeighed: true, workers: [] }
]

function respond(path) {
  if (path.endsWith('/Gold')) {
    return {
      status: 'warning',
      problems: [],
      forecasts: [],
      actions: [],
      asOf: '2026-10-01T08:00:00',
      metalForced: false,
      kpi: [
        {
          workerType: 80,
          lossPercent: 3.4,
          allowedPercent: 2,
          targetPercent: 3,
          excessGram: 5,
          excessMoney: 1000,
          coverageJobs: 8,
          coverageTotalJobs: 10,
          coveragePercent: 80
        }
      ],
      series: [
        {
          workerType: 80,
          bucketEnd: '2026-09-07T00:00:00',
          rawLossGram: 5,
          allowedGram: 4,
          lossPercent: 3,
          allowedPercent: 2
        }
      ],
      targets: [{ workerType: 80, metal: 'GOLD', targetPercent: 3, source: 'saved' }],
      workers: [
        {
          workerType: 80,
          workerCode: 'W1',
          workerName: 'สมชาย',
          slipCount: 3,
          receivedGram: 12,
          lossPercent: 3,
          allowedPercent: 2,
          targetPercent: 3,
          excessGram: 1,
          excessMoney: 500,
          netMoney: 300,
          overBuckets: 1,
          qualifyingBuckets: 2
        }
      ]
    }
  }
  if (path.endsWith('/GoldByStage'))
    return {
      departments,
      series: [{ deptKey: 'setting', bucketEnd: '2026-09-01T00:00:00', diffPercent: 5 }]
    }
  if (path.endsWith('/GoldLossTargets'))
    return [{ scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 3 }]
  return {
    data: [
      {
        planId: 1,
        slipId: 1,
        wo: 'WO',
        woNumber: '1',
        deptKey: 'setting',
        workerCode: 'W1',
        workerName: 'สมชาย',
        documentNo: 'S1',
        workerType: 80,
        isQueue: false
      }
    ],
    total: 1
  }
}

function mountPage(props = {}) {
  return mount(InsightPage, {
    props: {
      config: goldConfig,
      filter: { ...buildDefaultGoldFilter(), metal: 'GOLD' },
      active: true,
      ...props
    },
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: {
        ChartGeneric: true,
        InfoTipGeneric: true,
        DrawerGeneric: { template: '<div><slot name="content" /><slot name="action" /></div>' },
        modal: true
      }
    }
  })
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))
const getsTo = (name) => getMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))
const clearMocks = () => {
  postMock.mockClear()
  getMock.mockClear()
}
const requestedNames = () =>
  [
    ...postMock.mock.calls.map((c) => c[0].split('/').pop()),
    ...getMock.mock.calls.map((c) => c[0].split('/').pop())
  ].sort()

describe('InsightPage + goldConfig (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('renders every anchor, fetches each endpoint once, emits workers-loaded', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await flushPromises()

    const html = wrapper.html()
    ;[
      'goldKpi',
      'goldStage',
      'goldStageOutliers',
      'goldStagePending',
      'goldTrend',
      'goldWorkers',
      'goldOverSlips',
      'goldUncovered'
    ].forEach((id) => expect(html, `anchor ${id}`).toContain(`id="insight-report-${id}"`))
    expect(requestedNames()).toEqual([
      'Gold',
      'GoldByStage',
      'GoldLossTargets',
      'GoldOverSlips',
      'GoldStageOutlierJobs',
      'GoldStagePendingReturn',
      'GoldUncoveredJobs'
    ])
    expect(getsTo('GoldLossTargets')).toHaveLength(1)
    expect(wrapper.emitted('workers-loaded')).toHaveLength(1)
    expect(wrapper.emitted('workers-loaded')[0][0][0].workerCode).toBe('W1')
    // default selection = แผนกที่เกินเป้ามากสุด (setting) → กล่องรายละเอียดแสดงพร้อมตารางช่างของแผนก
    expect(html).toContain('view.productionInsight.gold.stageDetailTitle')
    expect(html).toContain('W9')
    // KPI 2 แถวตามประเภทช่าง
    expect(html).toContain('view.productionInsight.gold.workerType.80')
    expect(html).toContain('view.productionInsight.gold.workerType.50')
  })

  it('every endpoint receives the page metal; the worker filter reaches Gold/overSlips/uncovered only', async () => {
    mountPage({
      filter: {
        ...buildDefaultGoldFilter(),
        metal: 'SILVER',
        workerTypes: ['80'],
        workerCodes: ['W1']
      }
    })
    await flushPromises()
    postMock.mock.calls.forEach((call) => expect(call[1].metal, call[0]).toBe('SILVER'))
    expect(postsTo('Gold')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'] })
    expect(postsTo('GoldByStage')[0][1].workerCodes).toBeUndefined()
    expect(postsTo('GoldOverSlips')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'] })
    expect(postsTo('GoldUncoveredJobs')[0][1]).toMatchObject({
      workerTypes: [80],
      workerCodes: ['W1'],
      olderThanDays: 14
    })
    expect(postsTo('GoldStagePendingReturn')[0][1]).toMatchObject({
      includeQueue: false,
      olderThanDays: 14
    })
  })

  it('trend worker-type toggle and clicking a department row = 0 requests', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()
    getMock.mockClear()

    wrapper.vm.setState('trendWorkerType', 50)
    await flushPromises()
    const rows = wrapper.findAll('#insight-report-goldStage tbody tr')
    expect(rows.length).toBe(3)
    await rows[0].trigger('click')
    await flushPromises()
    expect(wrapper.vm.state.stageDept).toBe('trim')
    expect(postMock).not.toHaveBeenCalled()
    expect(getMock).not.toHaveBeenCalled()
  })

  it('filter changes: range -> 6 data endpoints once each, worker filter -> Gold/overSlips/uncovered, olderThanDays -> pending + uncovered only', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const base = { ...buildDefaultGoldFilter(), metal: 'GOLD' }

    clearMocks()
    await wrapper.setProps({ filter: { ...base, olderThanDays: 30 } })
    await flushPromises()
    expect(requestedNames()).toEqual(['GoldStagePendingReturn', 'GoldUncoveredJobs'])

    clearMocks()
    await wrapper.setProps({ filter: { ...base, olderThanDays: 30, workerCodes: ['W1'] } })
    await flushPromises()
    expect(requestedNames()).toEqual(['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'])

    clearMocks()
    await wrapper.setProps({
      filter: {
        ...base,
        olderThanDays: 30,
        workerCodes: ['W1'],
        start: new Date('2026-01-01'),
        end: new Date('2026-02-01')
      }
    })
    await flushPromises()
    expect(requestedNames()).toEqual([
      'Gold',
      'GoldByStage',
      'GoldOverSlips',
      'GoldStageOutlierJobs',
      'GoldStagePendingReturn',
      'GoldUncoveredJobs'
    ])

    clearMocks()
    await wrapper.setProps({
      filter: {
        ...base,
        olderThanDays: 30,
        workerCodes: ['W1'],
        start: new Date('2026-01-01'),
        end: new Date('2026-02-01'),
        metal: 'SILVER'
      }
    })
    await flushPromises()
    expect(requestedNames()).toEqual([
      'Gold',
      'GoldByStage',
      'GoldOverSlips',
      'GoldStageOutlierJobs',
      'GoldStagePendingReturn',
      'GoldUncoveredJobs'
    ])
  })

  it('draft targets (both scopes) -> Gold and GoldByStage once each, nothing else; clearing the draft refetches both once', async () => {
    const wrapper = mountPage()
    await flushPromises()
    postMock.mockClear()
    getMock.mockClear()

    const draft = [
      { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 4 },
      { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 6 }
    ]
    wrapper.vm.setState('draftTargets', draft)
    await flushPromises()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage'])
    expect(postsTo('Gold')[0][1].draftTargets).toEqual(draft)
    expect(postsTo('GoldByStage')[0][1].draftTargets).toEqual(draft)

    postMock.mockClear()
    wrapper.vm.setState('draftTargets', [])
    await flushPromises()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage'])
    expect(postsTo('Gold')[0][1].draftTargets).toBeUndefined()
  })

  it('includeQueue checkbox -> only the pending table refetches', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    wrapper.vm.setState('includeQueue', true)
    await flushPromises()
    expect(requestedNames()).toEqual(['GoldStagePendingReturn'])
    expect(postsTo('GoldStagePendingReturn')[0][1].includeQueue).toBe(true)
  })

  it('saving targets from the drawer: one SaveGoldLossTargets with both scopes, then Gold + GoldByStage + GoldLossTargets once each', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const drawer = wrapper.findComponent(TargetDrawer)
    drawer.vm.onOpen()
    drawer.vm.draftMap['SLIP:80-GOLD'] = 4
    drawer.vm.draftMap['STAGE:80-GOLD'] = 6
    wrapper.vm.setState('draftTargets', [
      { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 4 }
    ])
    await flushPromises()
    postMock.mockClear()
    getMock.mockClear()

    drawer.vm.remark = 'ปรับเป้า'
    await drawer.vm.onSave()
    await flushPromises()
    const save = postsTo('SaveGoldLossTargets')
    expect(save).toHaveLength(1)
    expect(save[0][1].remark).toBe('ปรับเป้า')
    expect(save[0][1].items.map((item) => item.scope)).toEqual(['SLIP', 'STAGE'])
    expect(postsTo('Gold')).toHaveLength(1)
    expect(postsTo('GoldByStage')).toHaveLength(1)
    expect(getsTo('GoldLossTargets')).toHaveLength(1)
    expect(wrapper.vm.state.draftTargets).toEqual([])
  })
})

describe('TargetDrawer goldLossTargets (standalone)', { timeout: 20000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    getMock.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const baseCtx = () => ({
    filter: { metal: 'GOLD' },
    data: {
      Gold: { kpi: [{ workerType: 80, lossPercent: 3.4 }] },
      GoldByStage: { departments },
      GoldLossTargets: [
        { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 3 },
        { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 3 }
      ]
    },
    setState: vi.fn(),
    reload: vi.fn()
  })

  const mountDrawer = (ctx) =>
    mount(TargetDrawer, {
      props: { preset: 'goldLossTargets', ctx },
      global: {
        mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key) },
        stubs: {
          DrawerGeneric: { template: '<div><slot name="content" /><slot name="action" /></div>' },
          modal: true,
          BaseDataTable: true
        }
      }
    })

  it('renders both sections with metal sub-headings, debounces one combined draft, empty when back to saved', () => {
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    const html = wrapper.html()
    expect(html).toContain('view.productionInsight.gold.targetSlipSectionTitle')
    expect(html).toContain('view.productionInsight.gold.targetStageSectionTitle')
    expect(wrapper.findAll('.target-drawer__section-title')).toHaveLength(2)
    expect(wrapper.findAll('.target-drawer__group-title')).toHaveLength(4)
    expect(wrapper.findAll('.target-drawer__field')).toHaveLength(10)

    wrapper.vm.draftMap['SLIP:80-GOLD'] = 5
    wrapper.vm.onDraftInput()
    wrapper.vm.draftMap['STAGE:80-GOLD'] = 7
    wrapper.vm.onDraftInput()
    expect(ctx.setState).not.toHaveBeenCalled()
    vi.advanceTimersByTime(450)
    expect(ctx.setState).toHaveBeenCalledTimes(1)
    expect(ctx.setState.mock.calls[0][0]).toBe('draftTargets')
    expect(ctx.setState.mock.calls[0][1].map((item) => item.scope)).toEqual(['SLIP', 'STAGE'])

    wrapper.vm.draftMap['SLIP:80-GOLD'] = 3
    wrapper.vm.draftMap['STAGE:80-GOLD'] = 3
    wrapper.vm.onDraftInput()
    vi.advanceTimersByTime(450)
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargets', [])
  })

  it('closing or cancelling drops the draft of both groups', () => {
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    wrapper.vm.onClose()
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargets', [])
    wrapper.vm.onCancelDraft()
    expect(ctx.setState).toHaveBeenLastCalledWith('draftTargets', [])
  })

  it('saving needs a remark, then posts both scopes in one request and reloads Gold + GoldByStage + GoldLossTargets', async () => {
    postMock.mockResolvedValue(true)
    const ctx = baseCtx()
    const wrapper = mountDrawer(ctx)
    wrapper.vm.onOpen()
    wrapper.vm.draftMap['STAGE:90-SILVER'] = 8

    await wrapper.vm.onSave()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.vm.remarkError).toBe('view.productionInsight.wip.standardsRemarkRequired')

    wrapper.vm.remark = 'ปรับเป้า'
    await wrapper.vm.onSave()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock.mock.calls[0][0]).toBe('ProductionInsight/SaveGoldLossTargets')
    expect(postMock.mock.calls[0][1].items).toEqual([
      { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 3 },
      { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 3 },
      { scope: 'STAGE', workerType: 90, metal: 'SILVER', targetPercent: 8 }
    ])
    expect(ctx.reload).toHaveBeenCalledWith(['Gold', 'GoldByStage', 'GoldLossTargets'])
  })

  it('history asks for the row scope/workerType/metal and labels the modal with the metal', async () => {
    getMock.mockResolvedValue([
      { effectiveFrom: '2026-01-01T00:00:00', targetPercent: 3, createBy: 'x', remark: 'r' }
    ])
    const wrapper = mountDrawer(baseCtx())
    wrapper.vm.onOpen()
    const row = wrapper.vm.rows.find((r) => r.key === 'STAGE:90-SILVER')
    await wrapper.vm.onOpenHistory(row)
    expect(getMock).toHaveBeenCalledWith('ProductionInsight/GoldLossTargetHistory', {
      workerType: 90,
      metal: 'SILVER',
      scope: 'STAGE'
    })
    expect(wrapper.vm.historyLabel).toContain('view.productionInsight.gold.metalLabel.SILVER')
    expect(wrapper.vm.historyRows).toHaveLength(1)
  })
})
