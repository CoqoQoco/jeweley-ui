// gold-page.smoke.spec.js — mount InsightPage กับ goldConfig จริงทั้งหน้า (โหมดแท็บ: block/ตาราง/toolbar/drawer ตั้งเป้า/modal เจาะช่างจริง) ด้วยข้อมูลจำลอง
// ตรวจ: แท็บตั้งต้น = ปัญหา (ยิงแค่ Gold + GoldByStage) · แท็บข้อมูล mount/ยิง request เมื่อเปิดครั้งแรก · แท็บ due แสดงตารางทีละอัน + scope ประเภทช่าง ·
// "ดู ›"/การ์ด KPI กระโดดข้ามแท็บ (ตาม workerType/deptKey) · modal เจาะช่างเปิดจาก 3 ทาง · apply-filter · ไม่มี Vue warn เรื่อง reactive component
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
import InsightFindingList from '@/components/insight/insight-finding-list.vue'
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
      problems: [
        { code: 'P_SETTING', severity: 'warning', params: { workerType: 80 }, reportRef: 'goldKpi' },
        { code: 'P_TANG', severity: 'warning', params: { workerType: 50 }, reportRef: 'goldOverSlips' },
        { code: 'P_STAGE', severity: 'warning', params: { deptKey: 'trim' }, reportRef: 'goldStage' }
      ],
      forecasts: [{ code: 'FC_GEN', severity: 'info', params: {}, reportRef: 'goldTrend' }],
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
        },
        {
          workerType: 50,
          lossPercent: 1,
          allowedPercent: 1,
          targetPercent: 2,
          excessGram: 2,
          excessMoney: 300,
          coverageJobs: 5,
          coverageTotalJobs: 5,
          coveragePercent: 100
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
        },
        {
          workerType: 50,
          bucketEnd: '2026-09-07T00:00:00',
          rawLossGram: 1,
          allowedGram: 1,
          lossPercent: 1,
          allowedPercent: 1
        }
      ],
      targets: [
        { workerType: 80, metal: 'GOLD', targetPercent: 3, source: 'saved' },
        { workerType: 50, metal: 'GOLD', targetPercent: 2, source: 'saved' }
      ],
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
        },
        {
          workerType: 50,
          workerCode: 'T1',
          workerName: 'ช่างแต่ง',
          slipCount: 2,
          receivedGram: 8,
          lossPercent: 1,
          allowedPercent: 1,
          targetPercent: 2,
          excessGram: 0,
          excessMoney: 0,
          netMoney: 0,
          overBuckets: 0,
          qualifyingBuckets: 1
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

const modalStub = { template: '<div class="modal-stub"><slot name="title" /><slot name="content" /><slot name="action" /></div>' }
const settle = async () => {
  await flushPromises()
  await flushPromises()
}
const settleLong = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  await flushPromises()
}
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const filterOf = (extra = {}) => ({ ...buildDefaultGoldFilter(), metal: 'GOLD', ...extra })
const tabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

describe('InsightPage + goldConfig tabs (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('default tab is problems: only Gold + GoldByStage are fetched, workers are emitted, all findings show and no data-tab block is mounted', async () => {
    const wrapper = mountPage()
    await settle()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage'])
    ;['goldKpi', 'goldKpiTang', 'goldKpiSetting', 'goldStage', 'goldOverSlips'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(wrapper.emitted('workers-loaded')).toHaveLength(1)
    expect(wrapper.vm.currentSub).toBe('problems')
    // ทุก finding ของหมวดอยู่ในแท็บปัญหา (ไม่มี filter ตามประเภทช่างอีกแล้ว)
    ;['P_SETTING', 'P_TANG', 'P_STAGE'].forEach((code) => expect(wrapper.text()).toContain(`rules.${code}`))
    expect(tabs(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (3)',
      'view.productionInsight.tabs.forecasts (1)',
      'view.productionInsight.tabs.actions (0)',
      'view.productionInsight.gold.tabs.overview',
      'view.productionInsight.gold.tabs.tang',
      'view.productionInsight.gold.tabs.setting',
      'view.productionInsight.gold.tabs.dept',
      'view.productionInsight.gold.tabs.due'
    ])
  })

  it('overview shows both KPI rows with no extra request; GoldLossTargets is not fetched yet', async () => {
    const wrapper = mountPage()
    await settle()
    clearMocks()
    wrapper.vm.selectSub('overview')
    await settle()
    expect(requestedNames()).toEqual([])
    expect(wrapper.findAll('.kpi-block__row-title').map((el) => el.text())).toEqual(['view.productionInsight.gold.workerType.80', 'view.productionInsight.gold.workerType.50'])
    expect(anchor(wrapper, 'goldKpi')).toBe(true)
  })

  it('tang / setting tabs: one KPI row, the type-locked trend with the target drawer and the ranking of that type; GoldLossTargets loads once on the first of them', async () => {
    const wrapper = mountPage()
    await settle()
    clearMocks()
    wrapper.vm.selectSub('tang')
    await settle()
    expect(requestedNames()).toEqual(['GoldLossTargets'])
    expect(wrapper.findAll('#insight-report-goldKpiTang .kpi-block__row-title').map((el) => el.text())).toEqual(['view.productionInsight.gold.workerType.50'])
    expect(anchor(wrapper, 'goldTrendTang') && anchor(wrapper, 'goldWorkersTang')).toBe(true)
    expect(wrapper.find('#insight-report-goldWorkersTang').text()).toContain('T1')
    expect(wrapper.find('#insight-report-goldWorkersTang').text()).not.toContain('W1')
    expect(wrapper.findComponent(TargetDrawer).exists()).toBe(true)

    clearMocks()
    wrapper.vm.selectSub('setting')
    await settle()
    expect(requestedNames()).toEqual([])
    expect(wrapper.findAll('#insight-report-goldKpiSetting .kpi-block__row-title').map((el) => el.text())).toEqual(['view.productionInsight.gold.workerType.80'])
    expect(wrapper.find('#insight-report-goldWorkersSetting').text()).toContain('W1')
    expect(wrapper.find('#insight-report-goldWorkersSetting').text()).not.toContain('T1')
  })

  it('dept tab: picker (weighed departments) bound to stageDept with the worst-over-target default; table, detail and the all-department chart', async () => {
    const wrapper = mountPage()
    await settle()
    clearMocks()
    wrapper.vm.selectSub('dept')
    await settle()
    expect(requestedNames()).toEqual([])
    const pickerTabs = () => wrapper.findAll('.gold-dept-picker [role="tab"]')
    expect(pickerTabs().map((b) => b.text())).toEqual(['view.executive.department.trim', 'view.executive.department.setting'])
    expect(pickerTabs()[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('#insight-report-goldStage tbody tr')).toHaveLength(3)
    expect(wrapper.html()).toContain('view.productionInsight.gold.stageDetailTitle')
    expect(anchor(wrapper, 'goldStageTrend')).toBe(true)

    await pickerTabs()[0].trigger('click')
    await settle()
    expect(wrapper.vm.state.stageDept).toBe('trim')
    expect(pickerTabs()[0].attributes('aria-selected')).toBe('true')
    await wrapper.findAll('#insight-report-goldStage tbody tr')[1].trigger('click')
    await settle()
    expect(wrapper.vm.state.stageDept).toBe('setting')
    expect(pickerTabs()[1].attributes('aria-selected')).toBe('true')
    expect(requestedNames()).toEqual([])
  })

  it('due tab: one table at a time (worst first); each switch fetches only the selected table', async () => {
    const wrapper = mountPage()
    await settle()
    clearMocks()
    wrapper.vm.selectSub('due')
    await settle()
    expect(requestedNames()).toEqual(['GoldOverSlips'])
    expect(anchor(wrapper, 'goldOverSlips')).toBe(true)
    expect(['goldUncovered', 'goldStageOutliers', 'goldStagePending'].some((id) => anchor(wrapper, id))).toBe(false)

    const dueButtons = () => wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('gold.tabs.dueOptions'))
    expect(dueButtons().map((b) => b.text())).toEqual([
      'view.productionInsight.gold.tabs.dueOptions.overSlips',
      'view.productionInsight.gold.tabs.dueOptions.uncovered',
      'view.productionInsight.gold.tabs.dueOptions.outliers',
      'view.productionInsight.gold.tabs.dueOptions.pending'
    ])
    const expected = ['GoldUncoveredJobs', 'GoldStageOutlierJobs', 'GoldStagePendingReturn']
    for (let i = 0; i < expected.length; i += 1) {
      clearMocks()
      await dueButtons()[i + 1].trigger('click')
      await settle()
      expect(requestedNames(), expected[i]).toEqual([expected[i]])
    }
    expect(anchor(wrapper, 'goldOverSlips')).toBe(false)
  })

  it('due scope (all / setting / tang) drives workerTypes for the slip tables and departmentKeys for the stage tables; includeQueue refetches pending only', async () => {
    const wrapper = mountPage({ sub: 'due' })
    await settle()
    const scopeButtons = () => wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('gold.lens.'))
    expect(scopeButtons().map((b) => b.text())).toEqual(['view.productionInsight.gold.lens.all', 'view.productionInsight.gold.lens.setting', 'view.productionInsight.gold.lens.tang'])
    expect(postsTo('GoldOverSlips')[0][1].workerTypes).toEqual([])

    clearMocks()
    await scopeButtons()[1].trigger('click')
    await settle()
    expect(requestedNames()).toEqual(['GoldOverSlips'])
    expect(postsTo('GoldOverSlips')[0][1].workerTypes).toEqual([80])

    wrapper.vm.setState('dueTable', 'outliers')
    await settle()
    clearMocks()
    await scopeButtons()[2].trigger('click')
    await settle()
    expect(requestedNames()).toEqual(['GoldStageOutlierJobs'])
    expect(postsTo('GoldStageOutlierJobs')[0][1].departmentKeys).toEqual(['trim'])

    wrapper.vm.setState('dueTable', 'pending')
    await settle()
    clearMocks()
    wrapper.vm.setState('includeQueue', true)
    await settle()
    expect(requestedNames()).toEqual(['GoldStagePendingReturn'])
    expect(postsTo('GoldStagePendingReturn')[0][1]).toMatchObject({ includeQueue: true, departmentKeys: ['trim'] })

    wrapper.vm.setState('dueTable', 'uncovered')
    await settle()
    expect(postsTo('GoldUncoveredJobs').at(-1)[1].workerTypes).toEqual([50])
  })

  it('the drawer worker filter reaches Gold and the slip tables when the scope is all; the scope wins when it locks a type', async () => {
    const wrapper = mountPage({ sub: 'due', filter: filterOf({ workerTypes: ['80'], workerCodes: ['W1'] }) })
    await settle()
    expect(postsTo('Gold')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'] })
    expect(postsTo('GoldOverSlips')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'] })
    expect(postsTo('GoldByStage')[0][1].workerCodes).toBeUndefined()
    wrapper.vm.setState('dueScope', 'tang')
    await settle()
    expect(postsTo('GoldOverSlips').at(-1)[1]).toMatchObject({ workerTypes: [50], workerCodes: ['W1'] })
  })

  it('filter changes: range -> Gold + GoldByStage + the open table; olderThanDays -> only the tables that use it', async () => {
    const wrapper = mountPage({ sub: 'due' })
    await settle()
    wrapper.vm.setState('dueTable', 'uncovered')
    await settle()
    clearMocks()
    await wrapper.setProps({ filter: filterOf({ olderThanDays: 30 }) })
    await settle()
    expect(requestedNames()).toEqual(['GoldUncoveredJobs'])
    clearMocks()
    await wrapper.setProps({ filter: filterOf({ olderThanDays: 30, start: new Date('2026-01-01'), end: new Date('2026-02-01') }) })
    await settle()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage', 'GoldUncoveredJobs'])
  })

  it('draft targets (both scopes) -> Gold and GoldByStage once each, nothing else; clearing the draft refetches both once', async () => {
    const wrapper = mountPage()
    await settle()
    clearMocks()
    const draft = [
      { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 4 },
      { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 6 }
    ]
    wrapper.vm.setState('draftTargets', draft)
    await settle()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage'])
    expect(postsTo('Gold')[0][1].draftTargets).toEqual(draft)
    clearMocks()
    wrapper.vm.setState('draftTargets', [])
    await settle()
    expect(requestedNames()).toEqual(['Gold', 'GoldByStage'])
    expect(postsTo('Gold')[0][1].draftTargets).toBeUndefined()
  })

  it('saving targets from the drawer (in a worker-type tab): one SaveGoldLossTargets with both scopes, then Gold + GoldByStage + GoldLossTargets once each', async () => {
    const wrapper = mountPage({ sub: 'setting' })
    await settle()
    const drawer = wrapper.findComponent(TargetDrawer)
    drawer.vm.onOpen()
    drawer.vm.draftMap['SLIP:80-GOLD'] = 4
    drawer.vm.draftMap['STAGE:80-GOLD'] = 6
    wrapper.vm.setState('draftTargets', [{ scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 4 }])
    await settle()
    clearMocks()

    drawer.vm.remark = 'ปรับเป้า'
    await drawer.vm.onSave()
    await settle()
    const save = postsTo('SaveGoldLossTargets')
    expect(save).toHaveLength(1)
    expect(save[0][1].items.map((item) => item.scope)).toEqual(['SLIP', 'STAGE'])
    expect(postsTo('Gold')).toHaveLength(1)
    expect(postsTo('GoldByStage')).toHaveLength(1)
    expect(getsTo('GoldLossTargets')).toHaveLength(1)
    expect(wrapper.vm.state.draftTargets).toEqual([])
  })

  it('finding links route by workerType / deptKey: tab, due toggle and scope are set and only that table is fetched', async () => {
    const wrapper = mountPage()
    await settle()
    const list = wrapper.findAllComponents(InsightFindingList)[0]

    list.vm.$emit('goto-report', 'goldKpi', { workerType: 80 })
    await settle()
    expect(wrapper.vm.currentSub).toBe('setting')
    list.vm.$emit('goto-report', 'goldKpi', { workerType: 50 })
    await settle()
    expect(wrapper.vm.currentSub).toBe('tang')
    list.vm.$emit('goto-report', 'goldStage', { deptKey: 'trim' })
    await settle()
    expect(wrapper.vm.currentSub).toBe('dept')
    expect(wrapper.vm.state.stageDept).toBe('trim')

    clearMocks()
    list.vm.$emit('goto-report', 'goldOverSlips', { workerType: 50 })
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('overSlips')
    expect(wrapper.vm.state.dueScope).toBe('tang')
    expect(requestedNames()).toEqual(['GoldOverSlips'])
    expect(postsTo('GoldOverSlips')[0][1].workerTypes).toEqual([50])

    clearMocks()
    list.vm.$emit('goto-report', 'goldStagePending', {})
    await settle()
    expect(wrapper.vm.state.dueTable).toBe('pending')
    expect(wrapper.vm.state.dueScope).toBe('all')
    expect(requestedNames()).toEqual(['GoldStagePendingReturn'])
    expect(postsTo('GoldStagePendingReturn')[0][1].departmentKeys).toEqual([])
  })

  it('KPI cards keep their links: the row worker type decides the tab / due scope', async () => {
    const wrapper = mountPage({ sub: 'overview' })
    await settle()
    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(6)

    await cards[0].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('setting')

    wrapper.vm.selectSub('overview')
    await settle()
    clearMocks()
    await cards[4].trigger('click')
    await settle()
    expect(wrapper.vm.currentSub).toBe('due')
    expect(wrapper.vm.state.dueTable).toBe('overSlips')
    expect(wrapper.vm.state.dueScope).toBe('tang')
    expect(postsTo('GoldOverSlips').at(-1)[1].workerTypes).toEqual([50])

    wrapper.vm.selectSub('overview')
    await settle()
    await cards[2].trigger('click')
    await settle()
    expect(wrapper.vm.state.dueTable).toBe('uncovered')
    expect(wrapper.vm.state.dueScope).toBe('setting')
  })

  it('the worker modal opens from the setting ranking, the tang ranking and the stage detail; each opening sends worker-scoped bodies', async () => {
    const wrapper = mountPage({ sub: 'setting' }, { modal: modalStub })
    await settle()
    const codeButton = (selector, code) => wrapper.findAll(`${selector} button`).find((b) => b.text() === code)
    const modalBodies = async (workerType, workerCode) => {
      await settleLong()
      ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => {
        expect(postsTo(name).at(-1)[1], name).toMatchObject({ workerTypes: [workerType], workerCodes: [workerCode] })
      })
    }

    await codeButton('#insight-report-goldWorkersSetting', 'W1').trigger('click')
    expect(wrapper.vm.state.workerModal).toEqual({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย', deptKey: 'setting' })
    await modalBodies(80, 'W1')

    wrapper.vm.setState('workerModal', null)
    await settleLong()
    wrapper.vm.selectSub('tang')
    await settle()
    clearMocks()
    await codeButton('#insight-report-goldWorkersTang', 'T1').trigger('click')
    expect(wrapper.vm.state.workerModal).toEqual({ workerType: 50, workerCode: 'T1', workerName: 'ช่างแต่ง', deptKey: 'trim' })
    await modalBodies(50, 'T1')

    wrapper.vm.setState('workerModal', null)
    await settleLong()
    wrapper.vm.selectSub('dept')
    await settle()
    clearMocks()
    await codeButton('.insight-node__card-body', 'W9').trigger('click')
    expect(wrapper.vm.state.workerModal).toEqual({ workerType: 80, workerCode: 'W9', workerName: '', deptKey: 'setting' })
    await modalBodies(80, 'W9')
  })

  it('apply-filter from the modal updates the page filter and closes the modal', async () => {
    const wrapper = mountPage({ sub: 'setting' }, { modal: modalStub })
    await settle()
    wrapper.vm.setState('workerModal', { workerType: 80, workerCode: 'W1', workerName: 'สมชาย', deptKey: 'setting' })
    await settleLong()
    wrapper.findComponent({ name: 'WorkerProfileModal' }).vm.$emit('apply-filter', { workerTypes: ['80'], workerCodes: ['W1'] })
    await settle()
    expect(wrapper.emitted('update-filter')[0][0]).toEqual({ workerTypes: ['80'], workerCodes: ['W1'] })
    expect(wrapper.vm.state.workerModal).toBeNull()
    // หน้าแม่นำไปใช้ → Gold ยิงใหม่พร้อม workerCodes และตารางอันดับเหลือช่างนั้น
    clearMocks()
    await wrapper.setProps({ filter: filterOf({ workerTypes: ['80'], workerCodes: ['W1'] }) })
    await settle()
    expect(postsTo('Gold')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'] })
  })

  it('a reactive-wrapped config (as index-view data() does) renders without Vue reactive-component warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountPage({ config: reactive({ config: goldConfig }).config, sub: 'due' })
    await settle()
    wrapper.vm.selectSub('dept')
    await settle()
    wrapper.vm.selectSub('setting')
    await settle()
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('reactive object'))).toHaveLength(0)
    warn.mockRestore()
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
