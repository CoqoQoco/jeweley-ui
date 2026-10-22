// material-page.smoke.spec.js — แท็บคลังวัตถุดิบจริง (MaterialInsightView → InsightPage + materialGoldConfig + โมดัลตั้งขั้นต่ำ + ลิ้นชักตั้งค่าเกณฑ์) ด้วย response จำลองตาม contract
// ทุก request ถูก mock (axios helper) — ไม่มีการเรียก server จริง/ไม่เขียนข้อมูล (endpoint เขียน Min/Save, Min/Delete, Policy/Save เป็น mock ทั้งหมด)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()
const access = vi.hoisted(() => ({ manage: false }))
const alerts = vi.hoisted(() => ({ success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn(), confirmSubmit: vi.fn((message, title, callback) => callback()) }))

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/alert/sweetAlerts.js', () => alerts)
vi.mock('./material-access.js', () => ({ hasMaterialManageAccess: () => access.manage, MATERIAL_MANAGE_MIN_PERMISSION: 'material:manage-min' }))

import MaterialInsightView from '../components/material-insight-view.vue'
import InsightFindingList from '@/components/insight/insight-finding-list.vue'

const item = (over) => ({
  itemKey: 'YG|S1',
  code: 'YG',
  name: 'ทอง',
  sizeCode: 'S1',
  sizeName: 'ไซส์ 1',
  label: 'YG ไซส์ 1',
  goldCode: 'YG',
  goldName: 'ทอง',
  onHand: 100,
  onProcess: 0,
  available: 100,
  consumedInWindow: 30,
  avgDailyUsage: 1,
  avgMonthlyUsage: 30,
  coverDays: 100,
  leadTimeDays: 7,
  overrideLeadTimeDays: null,
  autoMin: 10,
  overrideMin: null,
  effectiveMin: 10,
  minSource: 'auto',
  status: 'ok',
  isDead: false,
  stockoutRisk: false,
  lastMovementDate: '2026-10-01T00:00:00',
  daysSinceMove: 20,
  neverConsumed: false,
  onProcessAgeDays: null,
  ...over
})

const overview = {
  asOf: '2026-10-22T09:00:00',
  kind: 'GOLD',
  unit: 'g',
  status: 'critical',
  policy: { windowMonths: 3, leadTimeDays: 7, safetyDays: 3, floorQty: 0, nearPercent: 150, deadStockDays: 90, forecastMonths: 6, onProcessStaleDays: 14, priceChangePercent: 20, concentrationPercent: 50, minHistoryMonths: 3, source: 'default' },
  usageHistory: { startMonth: '2026-08-01', fullMonths: 1 },
  kpi: { itemCount: 4, totalOnHand: 330, totalOnProcess: 0, totalAvailable: 330, zeroCount: 1, belowMinCount: 1, nearMinCount: 1, deadCount: 1, deadOnHand: 50, onProcessStaleCount: 0, onProcessStaleWeight: 0, onProcessAgeSupported: false, stockoutRiskCount: 0, overrideCount: 1, withUsageCount: 3, negativeCount: 0 },
  items: [
    item({}),
    item({ itemKey: 'YG|S2', label: 'YG ไซส์ 2', sizeCode: 'S2', onHand: 0, available: 0, coverDays: 0, status: 'zero' }),
    item({ itemKey: 'WG|S1', code: 'WG', goldCode: 'WG', goldName: 'ขาว', label: 'WG ไซส์ 1', onHand: 5, coverDays: 4, status: 'below', overrideMin: 20, effectiveMin: 20, minSource: 'override', overrideLeadTimeDays: 14 }),
    item({ itemKey: 'PG|S1', code: 'PG', goldCode: 'PG', goldName: 'พิงค์', label: 'PG ไซส์ 1', onHand: 50, coverDays: null, status: 'dead', isDead: true, neverConsumed: true, lastMovementDate: null, daysSinceMove: 200 })
  ],
  groups: [
    { code: 'YG', name: 'ทอง', itemCount: 2, onHand: 100, onProcess: 0 },
    { code: 'WG', name: 'ขาว', itemCount: 1, onHand: 5, onProcess: 0 },
    { code: 'PG', name: 'พิงค์', itemCount: 1, onHand: 50, onProcess: 0 }
  ],
  series: [
    { month: '2026-09-01', inflow: 50, consumed: 30, returned: 2, other: 0, endStock: 320 },
    { month: '2026-10-01', inflow: 10, consumed: 5, returned: 0, other: 1, endStock: 330 }
  ],
  problems: [
    { code: 'MAT_ZERO_STOCK', severity: 'critical', params: { count: 1, topItems: ['YG ไซส์ 2'] }, reportRef: 'matItems' },
    { code: 'MAT_BELOW_MIN', severity: 'warning', params: { count: 1, topItems: ['WG ไซส์ 1', 'YG ไซส์ 1'] }, reportRef: 'matItems' },
    { code: 'MAT_NEAR_MIN', severity: 'warning', params: { count: 1, topItems: ['YG ไซส์ 1'] }, reportRef: 'matItems' },
    { code: 'MAT_DEAD_STOCK', severity: 'warning', params: { count: 1, totalOnHand: 50, days: 90 }, reportRef: 'matItems' }
  ],
  forecasts: [{ code: 'FC_MAT_STOCKOUT', severity: 'warning', params: { count: 1, topItems: ['WG ไซส์ 1'], leadDays: 7, minCoverDays: 4, historyMonths: 3, windowMonths: 3 }, reportRef: 'matTrend' }],
  actions: [{ code: 'ACT_REORDER_MATERIAL', priority: 1, ownerRole: 'planner', relatedCodes: ['MAT_ZERO_STOCK'], params: { zeroCount: 1, belowCount: 1, stockoutCount: 1 } }]
}

const goldStage = { departments: [{ key: 'setting', pendingWithWorkerCount: 3, pendingWithWorkerGram: 10.5, pendingQueueCount: 1, pendingQueueGram: 99 }, { key: 'trim', pendingWithWorkerCount: 2, pendingWithWorkerGram: 4.25 }] }

const warnings = []
let lastQuery

function mountView({ initialSub = '', initialKind = '' } = {}) {
  const replace = vi.fn((arg) => {
    lastQuery = arg.query
    return Promise.resolve()
  })
  const wrapper = mount(MaterialInsightView, {
    props: { initialSub, initialKind },
    global: {
      plugins: [PrimeVue],
      config: { warnHandler: (message) => warnings.push(message) },
      components: { apexchart: { name: 'apexchart', props: ['type', 'series', 'options', 'height'], template: '<div class="apex-stub" :data-type="type" />' } },
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { query: { tab: 'material', other: '1' } },
        $router: { replace, push: vi.fn(), resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: {
        InfoTipGeneric: true,
        modal: { template: '<div class="modal-stub"><slot name="title" /><slot name="content" /><slot name="action" /></div>' },
        teleport: true
      }
    }
  })
  return { wrapper, replace }
}

const callsTo = (path) => postMock.mock.calls.filter((c) => c[0] === path)
const settle = async () => {
  await flushPromises()
  await flushPromises()
}
const page = (wrapper) => wrapper.findComponent({ name: 'InsightPage' })
const anchor = (wrapper, id) => wrapper.find(`#insight-report-${id}`).exists()
const subTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')
const editButtons = (wrapper) => wrapper.findAll('button[title="view.productionInsight.materialInsight.editTitle"]')
const rowsText = (wrapper) => wrapper.findAll('tbody tr').map((tr) => tr.text())

describe('Material tab (InsightPage + materialGoldConfig) smoke', { timeout: 30000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    Object.values(alerts).forEach((fn) => fn.mockClear?.())
    warnings.length = 0
    lastQuery = undefined
    access.manage = false
    postMock.mockImplementation(async (path) => (path === 'MaterialInsight/Overview' ? overview : path === 'ProductionInsight/GoldByStage' ? goldStage : {}))
    getMock.mockImplementation(async () => ({}))
  })

  it('default tab is problems: one Overview request with exactly {kind, months} (no metal); findings carry the topItems list and the forecast history months', async () => {
    const { wrapper } = mountView()
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['MaterialInsight/Overview'])
    expect(postMock.mock.calls[0][1]).toEqual({ kind: 'GOLD', months: 12 })
    ;['matKpi', 'matGroups', 'matTrend', 'matItems'].forEach((id) => expect(anchor(wrapper, id), id).toBe(false))
    expect(subTabs(wrapper).map((b) => b.text())).toEqual([
      'view.productionInsight.tabs.problems (4)',
      'view.productionInsight.tabs.forecasts (1)',
      'view.productionInsight.tabs.actions (1)',
      ...['overview', 'groups', 'trend', 'items'].map((k) => `view.productionInsight.materialInsight.tabs.${k}`)
    ])
    const html = wrapper.html()
    expect(html).toContain('rules.MAT_ZERO_STOCK:')
    expect(html).toContain('"topItems":"YG ไซส์ 2"')
    expect(html).toContain('"topItems":"WG ไซส์ 1, YG ไซส์ 1"')
    expect(html).toContain('"totalOnHand":"50"')

    page(wrapper).vm.selectSub('forecast')
    await settle()
    expect(wrapper.html()).toContain('rules.FC_MAT_STOCKOUT:')
    expect(wrapper.html()).toContain('"historyMonths":3')
    page(wrapper).vm.selectSub('actions')
    await settle()
    expect(wrapper.html()).toContain('rules.ACT_REORDER_MATERIAL')
    expect(wrapper.html()).toContain('view.productionInsight.ownerRole.planner')
  })

  it('kind switch: gold is selected, gems are disabled with a coming-soon title; kind= is never written for gold', async () => {
    const { wrapper } = mountView()
    await settle()
    const buttons = wrapper.findAll('.material-insight-view > .toggle-group [role="tab"]')
    expect(buttons.map((b) => b.text())).toEqual(['view.productionInsight.materialInsight.kind.GOLD', 'view.productionInsight.materialInsight.kind.GEM'])
    expect(buttons[0].attributes('aria-selected')).toBe('true')
    expect(buttons[1].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('title')).toBe('view.productionInsight.materialInsight.kind.comingSoon')
    await buttons[1].trigger('click')
    expect(postMock.mock.calls).toHaveLength(1)
    expect(wrapper.emitted('update:kind')).toBeUndefined()
    page(wrapper).vm.selectSub('items')
    await settle()
    expect(lastQuery).toMatchObject({ tab: 'material', other: '1', sub: 'items' })
    expect(lastQuery).not.toHaveProperty('kind')
  })

  it('data tabs mount on first open without extra requests; donut / bar / trend render without recursive-update or reactive warnings', async () => {
    const { wrapper } = mountView()
    await settle()
    postMock.mockClear()
    for (const [tab, ids] of [['overview', ['matKpi', 'matShare']], ['groups', ['matGroups', 'matGroupTable', 'matSizeTable']], ['trend', ['matTrend']], ['items', ['matItems']]]) {
      page(wrapper).vm.selectSub(tab)
      await settle()
      ids.forEach((id) => expect(anchor(wrapper, id), `${tab}:${id}`).toBe(true))
    }
    // ข้อมูลเสริม GoldByStage ยิงครั้งเดียวตอนเปิดแท็บภาพรวม — นอกนั้นไม่มี request เพิ่ม
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['ProductionInsight/GoldByStage'])
    const types = wrapper.findAll('.apex-stub').map((el) => el.attributes('data-type'))
    expect(types).toEqual(expect.arrayContaining(['donut', 'bar']))
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
    // ตารางขนาดสรุปจากรายการ (client-side)
    page(wrapper).vm.selectSub('groups')
    await settle()
    expect(wrapper.text()).toContain('ไซส์ 1')
  })

  it('the trend tab shows the usage-history hint; the items tab too', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('trend')
    await settle()
    expect(wrapper.text()).toContain('"start":"ส.ค. 2026"')
    expect(wrapper.text()).toContain('"months":1')
    page(wrapper).vm.selectSub('items')
    await settle()
    expect(wrapper.find('#insight-report-matItems').text()).toContain('"start":"ส.ค. 2026"')
  })

  it('items table is sorted by severity and the toggle filters client-side without requests; a finding / KPI card opens the matching toggle', async () => {
    const { wrapper } = mountView()
    await settle()
    page(wrapper).vm.selectSub('items')
    await settle()
    const order = rowsText(wrapper).map((text) => ['YG ไซส์ 2', 'WG ไซส์ 1', 'PG ไซส์ 1', 'YG ไซส์ 1'].findIndex((label) => text.includes(label)))
    expect(order).toEqual([0, 1, 2, 3])
    postMock.mockClear()

    page(wrapper).vm.setState('itemsFilter', 'dead')
    await settle()
    expect(rowsText(wrapper)).toHaveLength(1)
    expect(rowsText(wrapper)[0]).toContain('PG ไซส์ 1')
    expect(postMock.mock.calls).toHaveLength(0)

    const list = wrapper.findAllComponents(InsightFindingList)[0]
    for (const [code, expected] of [['MAT_ZERO_STOCK', 'zero'], ['MAT_BELOW_MIN', 'below'], ['MAT_NEAR_MIN', 'near'], ['MAT_DEAD_STOCK', 'dead']]) {
      list.vm.$emit('goto-report', 'matItems', { findingCode: code })
      await settle()
      expect([page(wrapper).vm.currentSub, page(wrapper).vm.state.itemsFilter], code).toEqual(['items', expected])
    }
    list.vm.$emit('goto-report', 'matTrend', {})
    await settle()
    expect(page(wrapper).vm.currentSub).toBe('trend')

    page(wrapper).vm.selectSub('overview')
    await settle()
    const cards = wrapper.findAll('.stat-card')
    expect(cards).toHaveLength(7)
    const expected = [['items', 'all'], ['groups', 'dead'], ['items', 'zero'], ['items', 'negative'], ['items', 'near'], ['items', 'dead']]
    for (let i = 0; i < expected.length; i += 1) {
      page(wrapper).vm.selectSub('overview')
      page(wrapper).vm.setState('itemsFilter', 'dead')
      await settle()
      await cards[i].trigger('click')
      await settle()
      const sub = page(wrapper).vm.currentSub
      expect([sub, sub === 'items' ? page(wrapper).vm.state.itemsFilter : 'dead'], `card ${i}`).toEqual(expected[i])
    }
  })

  it('GoldByStage is fetched only when the overview / items tab is opened (once), with {start, end, metal: GOLD}; the card shows the summed grams and jobs', async () => {
    const { wrapper } = mountView()
    await settle()
    expect(callsTo('ProductionInsight/GoldByStage')).toHaveLength(0)
    page(wrapper).vm.selectSub('groups')
    await settle()
    expect(callsTo('ProductionInsight/GoldByStage')).toHaveLength(0)
    page(wrapper).vm.selectSub('overview')
    await settle()
    expect(callsTo('ProductionInsight/GoldByStage')).toHaveLength(1)
    const body = callsTo('ProductionInsight/GoldByStage')[0][1]
    expect(Object.keys(body).sort()).toEqual(['end', 'metal', 'start'])
    expect(body.metal).toBe('GOLD')
    expect(wrapper.text()).toContain('14.75 g')
    expect(wrapper.text()).toContain('"count":"5"')
    expect(wrapper.text()).toContain('view.productionInsight.materialInsight.kpi.withWorkerNote')
    page(wrapper).vm.selectSub('items')
    await settle()
    expect(callsTo('ProductionInsight/GoldByStage')).toHaveLength(1)
    expect(wrapper.find('#insight-report-matItems').text()).toContain('withWorkerLine')
  })

  it('if GoldByStage fails the Overview tab still renders (card says the data is unavailable) and the items hint has no worker line', async () => {
    postMock.mockImplementation(async (path) => {
      if (path === 'ProductionInsight/GoldByStage') throw new Error('500')
      return path === 'MaterialInsight/Overview' ? overview : {}
    })
    const { wrapper } = mountView({ initialSub: 'overview' })
    await settle()
    expect(anchor(wrapper, 'matKpi')).toBe(true)
    expect(anchor(wrapper, 'matShare')).toBe(true)
    expect(wrapper.text()).toContain('view.productionInsight.materialInsight.kpi.withWorkerNone')
    page(wrapper).vm.selectSub('items')
    await settle()
    expect(wrapper.find('#insight-report-matItems').text()).not.toContain('withWorkerLine')
    expect(page(wrapper).vm.responses.Overview).toBeTruthy()
  })

  it('prod mirror: five negative items, no receipts ever recorded, status warning — notice, invalid-balance rows, red numbers, empty donut and the right finding / action', async () => {
    const negItem = (itemKey, code, name, onHand) => item({ itemKey, code, goldCode: code, goldName: name, label: `${code} ${name}`, sizeCode: itemKey.split('|')[1], sizeName: `ขนาด ${itemKey.split('|')[1]}`, onHand, available: onHand, status: 'negative', coverDays: null, avgMonthlyUsage: 12.5, autoMin: 3, effectiveMin: 3, lastMovementDate: '2026-10-10T00:00:00', daysSinceMove: 12 })
    const negative = {
      ...overview,
      status: 'warning',
      kpi: { ...overview.kpi, itemCount: 5, totalOnHand: 0, totalAvailable: 0, zeroCount: 0, belowMinCount: 0, nearMinCount: 0, deadCount: 0, deadOnHand: 0, negativeCount: 5, negativeWeight: -123.4, inboundRecorded: false, withUsageCount: 5 },
      items: [negItem('SV|9', 'SV', 'เงิน', -10), negItem('WG|7', 'WG', 'ทองขาว', -20), negItem('YG|3', 'YG', 'ทองเหลือง', -30), negItem('YG|5', 'YG', 'ทองเหลือง', -40), negItem('YG|7', 'YG', 'ทองเหลือง', -23.4)],
      groups: [
        { code: 'SV', name: 'เงิน', itemCount: 1, onHand: -10, onProcess: 0, negativeCount: 1 },
        { code: 'WG', name: 'ทองขาว', itemCount: 1, onHand: -20, onProcess: 0, negativeCount: 1 },
        { code: 'YG', name: 'ทองเหลือง', itemCount: 3, onHand: -93.4, onProcess: 0, negativeCount: 3 }
      ],
      problems: [{ code: 'MAT_NEGATIVE_BALANCE', severity: 'warning', params: { count: 5, totalWeight: 123.4, topItems: ['YG ทองเหลือง', 'WG ทองขาว'], ledgerHasInbound: false }, reportRef: 'matItems' }],
      forecasts: [],
      actions: [{ code: 'ACT_RECORD_OPENING_BALANCE', priority: 1, ownerRole: 'deptHead', relatedCodes: ['MAT_NEGATIVE_BALANCE'], params: { count: 5, totalWeight: 123.4 } }]
    }
    postMock.mockImplementation(async (path) => (path === 'MaterialInsight/Overview' ? negative : path === 'ProductionInsight/GoldByStage' ? goldStage : {}))
    const { wrapper } = mountView()
    await settle()
    // ปัญหา/วิธีแก้: มีเฉพาะยอดติดลบ (ไม่มี "หมดสต็อก") + ผู้รับผิดชอบหัวหน้าแผนก
    let html = wrapper.html()
    expect(html).toContain('rules.MAT_NEGATIVE_BALANCE:')
    expect(html).toContain('"totalWeight":"123.4"')
    expect(html).not.toContain('MAT_ZERO_STOCK')
    page(wrapper).vm.selectSub('actions')
    await settle()
    expect(wrapper.html()).toContain('rules.ACT_RECORD_OPENING_BALANCE')
    expect(wrapper.html()).toContain('view.productionInsight.ownerRole.deptHead')

    // ภาพรวม: ข้อความแจ้งเตือน + การ์ดยอดรวมเป็น "—" + การ์ดยอดไม่ถูกต้อง + โดนัทว่าง
    page(wrapper).vm.selectSub('overview')
    await settle()
    expect(wrapper.find('.note-block').text()).toContain('materialInsight.negativeNotice')
    const cardTexts = wrapper.findAll('.stat-card').map((c) => c.text())
    expect(cardTexts.some((text) => text.includes('—'))).toBe(true)
    expect(cardTexts.some((text) => text.includes('5') && text.includes('123.4 g'))).toBe(true)
    expect(wrapper.findAll('.apex-stub').filter((el) => el.attributes('data-type') === 'donut')).toHaveLength(0)

    // กลุ่ม: ไม่พล็อตแท่งติดลบ แต่ตารางแสดงตัวเลขจริง
    page(wrapper).vm.selectSub('groups')
    await settle()
    expect(wrapper.findAll('.apex-stub').filter((el) => el.attributes('data-type') === 'bar')).toHaveLength(0)
    expect(wrapper.text()).toContain('-93.4')

    // รายการ: ข้อความแจ้งเตือน + ตัวสลับ "ยอดไม่ถูกต้อง 5" + ทุกแถวเป็นยอดไม่ถูกต้อง ตัวเลขสีแดง
    page(wrapper).vm.selectSub('items')
    await settle()
    // แท็บที่เปิดแล้วค้างอยู่ (v-show): ภาพรวม 1 + รายการ 1
    expect(wrapper.findAll('.note-block')).toHaveLength(2)
    expect(wrapper.text()).toContain('view.productionInsight.materialInsight.filter.negative')
    expect(wrapper.text()).toContain('"count":"5"')
    const rows = wrapper.findAll('#insight-report-matItems tbody tr')
    expect(rows).toHaveLength(5)
    rows.forEach((row) => expect(row.text()).toContain('view.productionInsight.materialInsight.status.negative'))
    expect(wrapper.html()).toContain('var(--base-red)')
    page(wrapper).vm.setState('itemsFilter', 'zero')
    await settle()
    expect(wrapper.findAll('#insight-report-matItems tbody tr').filter((r) => r.text().includes('SV'))).toHaveLength(0)
    expect(warnings.filter((w) => /Maximum recursive updates|reactive object/.test(w))).toEqual([])
  })

  it('a finding of the negative-balance kind opens the items tab on the "invalid balance" toggle', async () => {
    const { wrapper } = mountView()
    await settle()
    wrapper.findAllComponents(InsightFindingList)[0].vm.$emit('goto-report', 'matItems', { findingCode: 'MAT_NEGATIVE_BALANCE' })
    await settle()
    expect([page(wrapper).vm.currentSub, page(wrapper).vm.state.itemsFilter]).toEqual(['items', 'negative'])
  })

  it('without the permission the table is read-only: no edit column, no policy button, only the read-only table exists', async () => {
    access.manage = false
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    expect(anchor(wrapper, 'matItems')).toBe(true)
    expect(anchor(wrapper, 'matItemsEdit')).toBe(false)
    expect(editButtons(wrapper)).toHaveLength(0)
    expect(wrapper.text()).not.toContain('view.productionInsight.materialInsight.policyButton')
  })

  it('with the permission each row has an edit button and the toolbar has the thresholds button', async () => {
    access.manage = true
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    expect(anchor(wrapper, 'matItemsEdit')).toBe(true)
    expect(anchor(wrapper, 'matItems')).toBe(false)
    expect(editButtons(wrapper)).toHaveLength(4)
    expect(wrapper.text()).toContain('view.productionInsight.materialInsight.policyButton')
  })

  it('modal: saving posts exactly {kind,itemKey,minQty,leadTimeDays,note} then refetches Overview; invalid input posts nothing', async () => {
    access.manage = true
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    // แถวแรกหลังเรียง = YG ไซส์ 2 (หมด)
    await editButtons(wrapper)[0].trigger('click')
    await settle()
    const modal = wrapper.find('.modal-stub')
    expect(modal.text()).toContain('YG ไซส์ 2')
    expect(modal.text()).toContain('"autoMin":10')
    postMock.mockClear()

    const inputs = modal.findAll('input')
    await inputs[0].setValue('-5')
    await modal.findAll('button').find((b) => b.text().includes('common.btn.save')).trigger('click')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)

    await inputs[0].setValue('25.5')
    await inputs[1].setValue('14')
    await modal.find('textarea').setValue('สั่งเพิ่ม')
    await modal.findAll('button').find((b) => b.text().includes('common.btn.save')).trigger('click')
    await settle()
    expect(callsTo('MaterialInsight/Min/Save')).toHaveLength(1)
    expect(callsTo('MaterialInsight/Min/Save')[0][1]).toEqual({ kind: 'GOLD', itemKey: 'YG|S2', minQty: 25.5, leadTimeDays: 14, note: 'สั่งเพิ่ม' })
    expect(callsTo('MaterialInsight/Overview')).toHaveLength(1)
    expect(alerts.success).toHaveBeenCalled()
    expect(page(wrapper).vm.state.minModal).toBeNull()
    expect(callsTo('MaterialInsight/Min/Delete')).toHaveLength(0)
  })

  it('modal: an item with an override offers "use automatic minimum"; it confirms, posts Min/Delete {kind,itemKey}, then refetches Overview', async () => {
    access.manage = true
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    // WG ไซส์ 1 (ตั้งเอง) คือแถวที่ 2
    await editButtons(wrapper)[1].trigger('click')
    await settle()
    const modal = wrapper.find('.modal-stub')
    expect(modal.text()).toContain('WG ไซส์ 1')
    postMock.mockClear()
    const deleteButton = modal.findAll('button').find((b) => b.text().includes('deleteOverride'))
    expect(deleteButton).toBeTruthy()
    await deleteButton.trigger('click')
    await settle()
    expect(alerts.confirmSubmit).toHaveBeenCalledTimes(1)
    expect(callsTo('MaterialInsight/Min/Delete')[0][1]).toEqual({ kind: 'GOLD', itemKey: 'WG|S1' })
    expect(callsTo('MaterialInsight/Overview')).toHaveLength(1)
    expect(callsTo('MaterialInsight/Min/Save')).toHaveLength(0)
  })

  it('modal: an item without an override has no delete button', async () => {
    access.manage = true
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    await editButtons(wrapper)[0].trigger('click')
    await settle()
    expect(wrapper.find('.modal-stub').findAll('button').some((b) => b.text().includes('deleteOverride'))).toBe(false)
  })

  it('drawer: opens from the thresholds button, saves kind + only the changed fields, then refetches; no change posts nothing', async () => {
    access.manage = true
    const { wrapper } = mountView({ initialSub: 'items' })
    await settle()
    await wrapper.findAll('button').find((b) => b.text().includes('policyButton')).trigger('click')
    await settle()
    const drawer = wrapper.find('.drawer-panel')
    expect(drawer.exists()).toBe(true)
    expect(drawer.text()).toContain('view.productionInsight.materialInsight.drawer.field.windowMonths')
    expect(drawer.text()).not.toContain('onProcessStaleDays')
    expect(drawer.findAll('input')).toHaveLength(7)
    postMock.mockClear()

    const save = () => drawer.findAll('button').find((b) => b.text().includes('common.btn.save'))
    await save().trigger('click')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)
    expect(alerts.info).toHaveBeenCalled()

    const inputs = drawer.findAll('input')
    await inputs[0].setValue('99')
    await save().trigger('click')
    await settle()
    expect(postMock.mock.calls).toHaveLength(0)

    await inputs[0].setValue('3')
    await inputs[1].setValue('10')
    await save().trigger('click')
    await settle()
    expect(callsTo('MaterialInsight/Policy/Save')).toHaveLength(1)
    expect(callsTo('MaterialInsight/Policy/Save')[0][1]).toEqual({ kind: 'GOLD', leadTimeDays: 10 })
    expect(callsTo('MaterialInsight/Overview')).toHaveLength(1)
    expect(page(wrapper).vm.state.policyDrawer).toBe(false)
  })

  it('initialSub opens that tab; refreshToken reloads Overview only; the page never calls a write endpoint on its own', async () => {
    const { wrapper } = mountView({ initialSub: 'groups' })
    await settle()
    expect(page(wrapper).vm.currentSub).toBe('groups')
    postMock.mockClear()
    await wrapper.setProps({ refreshToken: 1 })
    await settle()
    expect(postMock.mock.calls.map((c) => c[0])).toEqual(['MaterialInsight/Overview'])
    expect(postMock.mock.calls.some((c) => /Min\/|Policy\/Save/.test(c[0]))).toBe(false)
  })
})
