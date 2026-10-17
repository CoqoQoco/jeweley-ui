// gold-page.smoke.spec.js — mount InsightPage กับ goldConfig จริงทั้งหน้า (block/ตาราง/toolbar/drawer ตั้งเป้าจริง) ด้วยข้อมูลจำลอง
// ตรวจ: endpoint ละ 1 ครั้ง · toggle ประเภทช่าง/คลิกแถวแผนก = 0 request · draft เป้า → Gold+GoldByStage 1 ครั้ง · includeQueue → pending 1 ครั้ง · metal ส่งถูกทุก endpoint
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'
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

function mountPage(props = {}, extraStubs = {}) {
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
        modal: true,
        ...extraStubs
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

  it('overview lens: renders every anchor, fetches only the always-open endpoints once, emits workers-loaded', async () => {
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
    // lens ภาพรวม: 4 ตารางใบงานพับตั้งต้น → ยังไม่ mount = ยังไม่ยิง request
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage', 'GoldLossTargets'])
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
        lens: 'setting',
        metal: 'SILVER',
        workerTypes: ['50'],
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
    const base = { ...buildDefaultGoldFilter(), lens: 'setting', metal: 'GOLD' }
    const wrapper = mountPage({ filter: base })
    await flushPromises()

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
    const wrapper = mountPage({ filter: { ...buildDefaultGoldFilter(), lens: 'setting', metal: 'GOLD' } })
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

describe('InsightPage + goldConfig lens (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  const filterOf = (lens, extra = {}) => ({
    ...buildDefaultGoldFilter(),
    metal: 'GOLD',
    lens,
    ...extra
  })
  const expandButton = (wrapper, id) => wrapper.find(`#insight-report-${id} button`)
  const hasAnchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
  const kpiRowTitles = (wrapper) => wrapper.findAll('.kpi-block__row-title').map((el) => el.text())

  it('overview: collapsed blocks show only the header + expand button and expanding one fetches only that table', async () => {
    const wrapper = mountPage({ filter: filterOf('all') })
    await flushPromises()
    const collapsed = [
      'goldStageOutliers',
      'goldStagePending',
      'goldWorkers',
      'goldOverSlips',
      'goldUncovered'
    ]
    collapsed.forEach((id) => {
      expect(hasAnchor(wrapper, id), id).toBe(true)
      expect(expandButton(wrapper, id).attributes('aria-expanded'), id).toBe('false')
      expect(wrapper.find(`#insight-report-${id} table`).exists(), id).toBe(false)
    })
    expect(kpiRowTitles(wrapper)).toHaveLength(2)

    clearMocks()
    await expandButton(wrapper, 'goldOverSlips').trigger('click')
    await flushPromises()
    expect(requestedNames()).toEqual(['GoldOverSlips'])
    expect(expandButton(wrapper, 'goldOverSlips').attributes('aria-expanded')).toBe('true')

    clearMocks()
    await expandButton(wrapper, 'goldOverSlips').trigger('click')
    await flushPromises()
    expect(expandButton(wrapper, 'goldOverSlips').attributes('aria-expanded')).toBe('false')
    expect(requestedNames()).toEqual([])
  })

  it('switching the lens resets the collapsed state back to the lens default', async () => {
    const wrapper = mountPage({ filter: filterOf('all') })
    await flushPromises()
    await expandButton(wrapper, 'goldWorkers').trigger('click')
    expect(expandButton(wrapper, 'goldWorkers').attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({ filter: filterOf('setting') })
    await flushPromises()
    expect(wrapper.find('#insight-report-goldWorkers').exists()).toBe(true)
    expect(expandButton(wrapper, 'goldWorkers').attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({ filter: filterOf('all') })
    await flushPromises()
    expect(expandButton(wrapper, 'goldWorkers').attributes('aria-expanded')).toBe('false')
  })

  it('setting lens: one KPI row, only the setting department, tables open and filtered to workerType 80 / department setting', async () => {
    const wrapper = mountPage({ filter: filterOf('setting') })
    await flushPromises()
    expect(kpiRowTitles(wrapper)).toEqual(['view.productionInsight.gold.workerType.80'])
    expect(wrapper.findAll('#insight-report-goldStage tbody tr')).toHaveLength(1)
    expect(wrapper.find('#insight-report-goldStage').text()).toContain('view.executive.department.setting')
    expect(wrapper.html()).toContain('view.productionInsight.gold.stageDetailTitle')
    expect(postsTo('Gold')[0][1].workerTypes).toEqual([80])
    expect(postsTo('GoldByStage')).toHaveLength(1)
    expect(postsTo('GoldOverSlips')[0][1].workerTypes).toEqual([80])
    expect(postsTo('GoldUncoveredJobs')[0][1].workerTypes).toEqual([80])
    expect(postsTo('GoldStageOutlierJobs')[0][1].departmentKeys).toEqual(['setting'])
    expect(postsTo('GoldStagePendingReturn')[0][1].departmentKeys).toEqual(['setting'])
  })

  it('tang lens: KPI row 50, only the trim department, tables filtered to workerType 50 / department trim', async () => {
    const wrapper = mountPage({ filter: filterOf('tang') })
    await flushPromises()
    expect(kpiRowTitles(wrapper)).toEqual(['view.productionInsight.gold.workerType.50'])
    expect(wrapper.findAll('#insight-report-goldStage tbody tr')).toHaveLength(1)
    expect(wrapper.find('#insight-report-goldStage').text()).toContain('view.executive.department.trim')
    expect(postsTo('Gold')[0][1].workerTypes).toEqual([50])
    expect(postsTo('GoldOverSlips')[0][1].workerTypes).toEqual([50])
    expect(postsTo('GoldStageOutlierJobs')[0][1].departmentKeys).toEqual(['trim'])
    expect(postsTo('GoldStagePendingReturn')[0][1].departmentKeys).toEqual(['trim'])
  })

  it('department lens: worker-type blocks are gone, stage table + selectable detail stay, tables follow the selected department', async () => {
    const wrapper = mountPage({ filter: filterOf('dept') })
    await flushPromises()
    ;['goldKpi', 'goldTrend', 'goldWorkers', 'goldOverSlips', 'goldUncovered'].forEach((id) =>
      expect(hasAnchor(wrapper, id), id).toBe(false)
    )
    ;['goldStage', 'goldStageOutliers', 'goldStagePending'].forEach((id) =>
      expect(hasAnchor(wrapper, id), id).toBe(true)
    )
    expect(wrapper.findAll('#insight-report-goldStage tbody tr')).toHaveLength(3)
    expect(wrapper.html()).toContain('view.productionInsight.gold.stageDetailTitle')
    expect(postsTo('GoldOverSlips')).toHaveLength(0)
    expect(postsTo('GoldUncoveredJobs')).toHaveLength(0)
    expect(postsTo('GoldStageOutlierJobs').at(-1)[1].departmentKeys).toEqual(['setting'])

    clearMocks()
    await wrapper.findAll('#insight-report-goldStage tbody tr')[0].trigger('click')
    await flushPromises()
    expect(wrapper.vm.state.stageDept).toBe('trim')
    expect(requestedNames()).toEqual(['GoldStageOutlierJobs', 'GoldStagePendingReturn'])
    expect(postsTo('GoldStageOutlierJobs')[0][1].departmentKeys).toEqual(['trim'])
    expect(postsTo('GoldStagePendingReturn')[0][1].departmentKeys).toEqual(['trim'])
  })

  it('lens only refetches what depends on it: all -> setting = Gold + the tables that mount; dept <-> all = nothing for Gold/GoldByStage', async () => {
    const wrapper = mountPage({ filter: filterOf('all') })
    await flushPromises()

    clearMocks()
    await wrapper.setProps({ filter: filterOf('dept') })
    await flushPromises()
    expect(postsTo('Gold')).toHaveLength(0)
    expect(postsTo('GoldByStage')).toHaveLength(0)

    clearMocks()
    await wrapper.setProps({ filter: filterOf('setting') })
    await flushPromises()
    expect(postsTo('Gold')).toHaveLength(1)
    expect(postsTo('Gold')[0][1].workerTypes).toEqual([80])
    expect(postsTo('GoldByStage')).toHaveLength(0)
  })

  it('findings boxes follow the lens: worker-type / department items of the other side disappear, generic ones stay', async () => {
    const problems = [
      { code: 'P_SETTING', severity: 'warning', params: { workerType: 80 } },
      { code: 'P_TANG', severity: 'warning', params: { workerType: 50 } },
      { code: 'P_PLATING', severity: 'warning', params: { deptKey: 'plating' } },
      { code: 'P_GENERIC', severity: 'warning', params: { count: 1 } }
    ]
    postMock.mockImplementation(async (path) => (path.endsWith('/Gold') ? { ...respond(path), problems } : respond(path)))
    const wrapper = mountPage({ filter: filterOf('all') })
    await flushPromises()
    const shown = () => ['P_SETTING', 'P_TANG', 'P_PLATING', 'P_GENERIC'].filter((code) => wrapper.text().includes(`rules.${code}`))
    expect(shown()).toEqual(['P_SETTING', 'P_TANG', 'P_PLATING', 'P_GENERIC'])

    await wrapper.setProps({ filter: filterOf('setting') })
    await flushPromises()
    expect(shown()).toEqual(['P_SETTING', 'P_GENERIC'])

    await wrapper.setProps({ filter: filterOf('tang') })
    await flushPromises()
    expect(shown()).toEqual(['P_TANG', 'P_GENERIC'])

    await wrapper.setProps({ filter: filterOf('dept') })
    await flushPromises()
    expect(wrapper.vm.state.stageDept).toBe('setting')
    expect(shown()).toEqual(['P_GENERIC'])
  })

  it('department lens: the picker lists the weighed departments, is bound to stageDept, and is absent in other lenses', async () => {
    const wrapper = mountPage({ filter: filterOf('dept') })
    await flushPromises()
    const tabs = () => wrapper.findAll('.gold-dept-picker [role="tab"]')
    expect(tabs().map((tab) => tab.text())).toEqual(['view.executive.department.trim', 'view.executive.department.setting'])
    expect(tabs()[1].attributes('aria-selected')).toBe('true')

    clearMocks()
    await tabs()[0].trigger('click')
    await flushPromises()
    expect(wrapper.vm.state.stageDept).toBe('trim')
    expect(tabs()[0].attributes('aria-selected')).toBe('true')
    // แถวในตารางรายแผนกซิงก์ตามตัวเลือก และ outliers/pending ตามแผนกที่เลือก
    expect(postsTo('GoldStageOutlierJobs')[0][1].departmentKeys).toEqual(['trim'])

    await wrapper.findAll('#insight-report-goldStage tbody tr')[1].trigger('click')
    await flushPromises()
    expect(wrapper.vm.state.stageDept).toBe('setting')
    expect(tabs()[1].attributes('aria-selected')).toBe('true')

    await wrapper.setProps({ filter: filterOf('all') })
    await flushPromises()
    expect(wrapper.find('.gold-dept-picker').exists()).toBe(false)
  })

  it('worker code buttons open the drill-down state from the ranking table and the stage detail table; apply-filter pushes the page filter', async () => {
    const wrapper = mountPage({ filter: filterOf('setting') })
    await flushPromises()
    const codeButton = (selector, code) => wrapper.findAll(`${selector} button`).find((b) => b.text() === code)

    await codeButton('#insight-report-goldWorkers', 'W1').trigger('click')
    expect(wrapper.vm.state.workerModal).toEqual({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย' })

    wrapper.vm.setState('workerModal', null)
    await codeButton('.insight-node__card-body', 'W9').trigger('click')
    // รายละเอียดแผนก setting → ช่าง W9 ไม่มีประเภทในแถว อนุมานเป็น 80 (ช่างฝัง)
    expect(wrapper.vm.state.workerModal).toEqual({ workerType: 80, workerCode: 'W9', workerName: '' })

    await flushPromises()

    wrapper.findComponent({ name: 'GoldWorkerModal' }).vm.$emit('apply-filter', { workerTypes: ['80'], workerCodes: ['W9'] })
    await flushPromises()
    expect(wrapper.emitted('update-filter')[0][0]).toEqual({ workerTypes: ['80'], workerCodes: ['W9'] })
    expect(wrapper.vm.state.workerModal).toBeNull()
  })

  it('the drill-down modal opened from the page sends worker-scoped bodies to Gold, GoldOverSlips and GoldUncoveredJobs, and a second worker refetches all three', async () => {
    const modalStub = { template: '<div class="modal-stub"><slot name="title" /><slot name="content" /><slot name="action" /></div>' }
    const wrapper = mountPage({ filter: filterOf('setting') }, { modal: modalStub })
    await flushPromises()
    const settle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await flushPromises()
    }
    const scoped = (name) => postsTo(name).map((c) => [c[1].workerTypes, c[1].workerCodes])

    clearMocks()
    await wrapper.findAll('#insight-report-goldWorkers button').find((b) => b.text() === 'W1').trigger('click')
    await settle()
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => expect(scoped(name), name).toEqual([[[80], ['W1']]]))

    wrapper.vm.setState('workerModal', null)
    await settle()
    clearMocks()
    await wrapper.findAll('.insight-node__card-body button').find((b) => b.text() === 'W9').trigger('click')
    await settle()
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => expect(scoped(name), name).toEqual([[[80], ['W9']]]))
  })

  it('a reactive-wrapped config (as index-view data() does) renders without Vue reactive-component warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountPage({ config: reactive({ config: goldConfig }).config, filter: filterOf('dept') })
    await flushPromises()
    await wrapper.setProps({ filter: filterOf('setting') })
    await flushPromises()
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('reactive object'))).toHaveLength(0)
    warn.mockRestore()
  })

  it('locked lens: the 80/50 trend toggle is hidden; overview keeps it', async () => {
    const wrapper = mountPage({ filter: filterOf('all') })
    await flushPromises()
    expect(wrapper.find('#insight-report-goldTrend [role="tablist"]').exists()).toBe(true)
    await wrapper.setProps({ filter: filterOf('tang') })
    await flushPromises()
    expect(wrapper.find('#insight-report-goldTrend [role="tablist"]').exists()).toBe(false)
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
