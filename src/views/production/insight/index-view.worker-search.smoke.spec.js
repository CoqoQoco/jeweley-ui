// index-view.worker-search.smoke.spec.js — กล่อง "ค้นหาช่าง" บนแถบเครื่องมือ ProductionInsightView จริง (InsightPage/workersConfig/goldConfig จริง)
// ตรวจ: โผล่เฉพาะหมวดช่างและค่าแรง/ทองและ Loss · ยิง Workers ครั้งแรกตอนพิมพ์เท่านั้น (ไม่ใช่ตอนโหลดหน้า) + cache ตามช่วงเวลา ·
// เลือกตัวเลือกแล้วเปิดโปรไฟล์ของหมวดนั้นด้วย payload ถูก (แผนกไม่มีใบทอง = แท็บค่าแรง, ช่างฝัง = Loss ทอง) แล้วล้างช่อง · object ใน v-model ไม่รั่ว
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => false }))

import ProductionInsightView from './index-view.vue'

const WORKER_ROWS = [
  { code: 'W1', name: 'สมชาย ใจดี', deptKey: 'setting', employmentType: 'IN_HOUSE', wages: 100, jobs: 1, plans: 1, wagePerJob: 100, shareOfDeptJobs: 100 },
  { code: 'P1', name: 'พิมพ์ชนก', deptKey: 'plating', employmentType: 'OUTSIDE', wages: 200, jobs: 2, plans: 2, wagePerJob: 100, shareOfDeptJobs: 100 },
  { code: 'CG9K', name: 'รอจ่ายขัดชุบ 9K', deptKey: 'plating', employmentType: 'OUTSIDE', wages: 1, jobs: 1, plans: 1, wagePerJob: 1, shareOfDeptJobs: 1 },
  { code: 'W1', name: 'สมชาย ใจดี', deptKey: 'setting', employmentType: 'IN_HOUSE', wages: 100, jobs: 1, plans: 1, wagePerJob: 100, shareOfDeptJobs: 100 }
]

function respond(path) {
  if (path.endsWith('/Workers')) return { status: 'ok', problems: [], forecasts: [], actions: [], kpi: {}, series: [], seriesTotal: [], workers: WORKER_ROWS }
  if (path.endsWith('/Gold')) return { status: 'ok', problems: [], forecasts: [], actions: [], kpi: [], series: [], targets: [], workers: [] }
  return { status: 'ok', problems: [], forecasts: [], actions: [], data: [], total: 0, report: {}, departments: [], capacity: {}, series: [], workers: [] }
}

const modalStub = { template: '<div class="modal-stub"><slot name="title" /><slot name="content" /><slot name="action" /></div>' }

function mountView(view) {
  const replace = vi.fn(() => Promise.resolve())
  const wrapper = mount(ProductionInsightView, {
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { query: { view } },
        $router: { replace, resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: { ChartGeneric: true, DrawerGeneric: true, FilterPanelGeneric: true, modal: modalStub, TargetDrawer: true, InfoTipGeneric: true }
    }
  })
  return wrapper
}

const settle = async () => {
  await flushPromises()
  await flushPromises()
}

const workersCalls = () => postMock.mock.calls.filter((c) => c[0].endsWith('/Workers'))
// body ของกล่องค้นหาไม่มี key departmentKeys เลย (หน้าช่างและค่าแรงส่งเสมอ แม้ค่า undefined)
const searchCalls = () => workersCalls().filter((c) => !('departmentKeys' in c[1]))

describe('ProductionInsightView worker search (smoke)', { timeout: 30000 }, () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.body.innerHTML = ''
  })

  const box = () => wrapper.findComponent({ name: 'WorkerSearchBox' })
  const complete = async (query) => {
    box().findComponent({ name: 'AutoCompleteGeneric' }).vm.$emit('complete', { query })
    await settle()
  }
  const suggestions = () => box().findComponent({ name: 'AutoCompleteGeneric' }).props('suggestions')

  it('shows only in the workers and gold sections', async () => {
    for (const [view, expected] of [['wip', false], ['delivery', false], ['capacity', false], ['materials', false], ['workers', true], ['gold', true]]) {
      wrapper = mountView(view)
      await settle()
      expect(wrapper.find('.production-insight__toolbar .worker-search-box').exists(), view).toBe(expected)
      wrapper.unmount()
    }
    wrapper = mountView('wip')
    await settle()
    wrapper.vm.activeSection = 'workers'
    await settle()
    expect(box().exists()).toBe(true)
    wrapper.vm.activeSection = 'delivery'
    await settle()
    expect(box().exists()).toBe(false)
  })

  it('has an accessible name and the placeholder', async () => {
    wrapper = mountView('workers')
    await settle()
    const input = wrapper.find('.worker-search-box input')
    expect(input.attributes('placeholder')).toBe('view.productionInsight.workerSearch.placeholder')
    expect(input.attributes('aria-label')).toBe('view.productionInsight.workerSearch.aria')
  })

  it('does not fetch on page load; first search fetches once for the whole range (no dept/employment filter), then uses the cache', async () => {
    wrapper = mountView('workers')
    await settle()
    expect(searchCalls()).toHaveLength(0)
    expect(workersCalls()).toHaveLength(1)

    await complete('สม')
    expect(searchCalls()).toHaveLength(1)
    expect(Object.keys(searchCalls()[0][1]).sort()).toEqual(['end', 'metal', 'start'])
    expect(suggestions().map((o) => o.key)).toEqual(['W1|setting'])

    await complete('พิ')
    await complete('w1')
    expect(searchCalls()).toHaveLength(1)
  })

  it('queue slots (name starts with "รอ") are never offered and duplicate rows appear once', async () => {
    wrapper = mountView('workers')
    await settle()
    await complete('c')
    expect(suggestions().map((o) => o.code)).toEqual([])
    await complete('9k')
    expect(suggestions()).toEqual([])
    await complete('1')
    expect(suggestions().map((o) => o.key).sort()).toEqual(['P1|plating', 'W1|setting'])
  })

  it('a range change invalidates the cache: the next search refetches once for the new range', async () => {
    wrapper = mountView('workers')
    await settle()
    await complete('สม')
    expect(searchCalls()).toHaveLength(1)
    const firstBody = searchCalls()[0][1]

    wrapper.vm.onRangePresetChange({ preset: '1m', start: new Date('2026-09-01T00:00:00'), end: new Date('2026-09-30T23:59:59') })
    await settle()
    expect(searchCalls()).toHaveLength(1)

    await complete('สม')
    expect(searchCalls()).toHaveLength(2)
    expect(searchCalls()[1][1]).not.toEqual(firstBody)
    await complete('สม')
    expect(searchCalls()).toHaveLength(2)
  })

  it('workers section: a plating worker opens the profile on the wages tab with the table payload; the input is cleared', async () => {
    wrapper = mountView('workers')
    await settle()
    await complete('พิม')
    const [option] = suggestions()
    const ac = box().findComponent({ name: 'AutoCompleteGeneric' })
    // PrimeVue เขียน object ลง v-model ก่อน emit item-select
    ac.vm.$emit('update:modelValue', option)
    ac.vm.$emit('item-select', { value: option })
    await settle()

    const page = wrapper.findComponent({ ref: 'workersPage' })
    expect(page.vm.state.workerModal).toEqual({ workerType: null, workerCode: 'P1', workerName: 'พิมพ์ชนก', deptKey: 'plating', employmentType: 'OUTSIDE' })
    const tabs = wrapper.findAll('.modal-stub [role="tab"]')
    expect(tabs.map((b) => b.text())).toEqual(['wages', 'jobs'].map((key) => `view.productionInsight.workerProfile.tabs.${key}`))
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(box().vm.query).toBe('')
    expect(wrapper.find('.worker-search-box input').element.value).toBe('')
  })

  it('gold section: a setting worker opens the profile on the Loss tab with worker type 80, through the gold page state', async () => {
    wrapper = mountView('gold')
    await settle()
    await complete('w1')
    const [option] = suggestions()
    box().findComponent({ name: 'AutoCompleteGeneric' }).vm.$emit('item-select', { value: option })
    await settle()

    const page = wrapper.findComponent({ ref: 'goldPage' })
    expect(page.vm.state.workerModal).toMatchObject({ workerType: 80, workerCode: 'W1', deptKey: 'setting' })
    const tabs = wrapper.findAll('.modal-stub [role="tab"]')
    expect(tabs.map((b) => b.text())[0]).toBe('view.productionInsight.workerProfile.tabs.loss')
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    // ไม่ไปเปิด state ของหมวดอื่น
    expect(wrapper.vm.$refs.workersPage).toBeUndefined()
  })

  it('an object written into v-model never stays in the box', async () => {
    wrapper = mountView('workers')
    await settle()
    box().findComponent({ name: 'AutoCompleteGeneric' }).vm.$emit('update:modelValue', { code: 'W1' })
    await settle()
    expect(box().vm.query).toBe('')
    box().findComponent({ name: 'AutoCompleteGeneric' }).vm.$emit('update:modelValue', 'abc')
    await settle()
    expect(box().vm.query).toBe('abc')
  })

  it('real typing opens the list; no match shows the empty message', async () => {
    wrapper = mountView('workers')
    await settle()
    const input = wrapper.find('.worker-search-box input')
    await input.setValue('zzzz-none')
    await new Promise((resolve) => setTimeout(resolve, 450))
    await settle()
    expect(searchCalls()).toHaveLength(1)
    expect(document.body.textContent).toContain('view.productionInsight.workerSearch.empty')

    await input.setValue('สมชาย')
    await new Promise((resolve) => setTimeout(resolve, 450))
    await settle()
    expect(document.body.textContent).toContain('view.productionInsight.workerSearch.optionLabel')
  })

  it('no reactive-component warning and no extra page requests from using the box', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    wrapper = mountView('workers')
    await settle()
    const pageCalls = workersCalls().length
    await complete('สม')
    const option = suggestions()[0]
    box().findComponent({ name: 'AutoCompleteGeneric' }).vm.$emit('item-select', { value: option })
    await settle()
    expect(workersCalls().length - searchCalls().length).toBe(pageCalls)
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('reactive object') || String(c[0]).includes('Maximum recursive'))).toHaveLength(0)
    warn.mockRestore()
  })
})
