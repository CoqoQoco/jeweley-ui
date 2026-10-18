// index-view.tabs.smoke.spec.js — ProductionInsightView จริง (InsightPage/wipConfig จริง): query sub= sync กับแท็บย่อย + ปุ่มสลับโลหะในแถบเครื่องมือ
// router/route ถูก mock (replace เก็บ query ล่าสุด) · request ถูก mock ด้วยข้อมูลว่าง
import { describe, it, expect, beforeEach, vi } from 'vitest'
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

function mountView({ query = { view: 'wip' }, props = {} } = {}) {
  const replace = vi.fn(() => Promise.resolve())
  const $route = { query: { ...query } }
  const wrapper = mount(ProductionInsightView, {
    props,
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key) => key,
        $route,
        $router: { replace, resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: { ChartGeneric: true, DrawerGeneric: true, FilterPanelGeneric: true, modal: true, TargetDrawer: true, InfoTipGeneric: true }
    }
  })
  const lastQuery = () => replace.mock.calls.at(-1)?.[0].query
  return { wrapper, replace, lastQuery }
}

const settle = async () => {
  await flushPromises()
  await flushPromises()
}

describe('ProductionInsightView tabs + metal toggle (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockResolvedValue({ status: 'ok', problems: [], forecasts: [], actions: [], data: [], total: 0, report: {}, departments: [], capacity: {} })
    getMock.mockResolvedValue([])
  })

  const insightTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

  it('?sub=<data tab> opens that tab of the wip section on load', async () => {
    const { wrapper } = mountView({ query: { view: 'wip', sub: 'leadtime' } })
    await settle()
    const page = wrapper.findComponent({ name: 'InsightPage' })
    expect(page.vm.currentSub).toBe('leadtime')
    expect(insightTabs(wrapper)[5].attributes('aria-selected')).toBe('true')
  })

  it('unknown ?sub= falls back to the problems tab and is not written back to the URL', async () => {
    const { wrapper, lastQuery } = mountView({ query: { view: 'wip', sub: 'bogus' } })
    await settle()
    expect(wrapper.findComponent({ name: 'InsightPage' }).vm.currentSub).toBe('problems')
    wrapper.vm.activeSection = 'delivery'
    await settle()
    wrapper.vm.activeSection = 'wip'
    await settle()
    expect(lastQuery()).not.toHaveProperty('sub')
  })

  it('selecting tabs writes sub= (default tab omits it) and keeps the other query keys', async () => {
    const { wrapper, lastQuery } = mountView({ query: { view: 'wip', tab: 'production', metal: 'SILVER' } })
    await settle()

    await insightTabs(wrapper)[1].trigger('click')
    await settle()
    expect(lastQuery()).toMatchObject({ view: 'wip', tab: 'production', metal: 'SILVER', sub: 'forecast' })

    await insightTabs(wrapper)[6].trigger('click')
    await settle()
    expect(lastQuery().sub).toBe('due')

    await insightTabs(wrapper)[0].trigger('click')
    await settle()
    expect(lastQuery()).not.toHaveProperty('sub')
    expect(lastQuery()).toMatchObject({ view: 'wip', tab: 'production', metal: 'SILVER' })
  })

  it('sub= belongs to the tabbed section only: leaving wip removes it from the URL', async () => {
    const { wrapper, lastQuery } = mountView({ query: { view: 'wip', sub: 'trend' } })
    await settle()
    await insightTabs(wrapper)[2].trigger('click')
    await settle()
    expect(lastQuery().sub).toBe('actions')
    wrapper.vm.activeSection = 'gold'
    await settle()
    expect(lastQuery().view).toBe('gold')
    expect(lastQuery()).not.toHaveProperty('sub')
  })

  it('metal toggle lives on the toolbar row when the executive page passes metal; it emits update:metal and is absent otherwise', async () => {
    const { wrapper } = mountView({ props: { metal: 'GOLD' } })
    await settle()
    const toolbar = wrapper.find('.production-insight__toolbar')
    const toggle = toolbar.find('.production-insight__metal')
    expect(toggle.exists()).toBe(true)
    expect(toggle.findAll('[role="tab"]').map((b) => b.text())).toEqual(['view.executive.metalScope.options.GOLD', 'view.executive.metalScope.options.SILVER', 'view.executive.metalScope.options.ALL'])
    expect(toggle.find('[aria-selected="true"]').text()).toBe('view.executive.metalScope.options.GOLD')
    // แถวเดียวกับช่วงเวลา + ปุ่มตัวกรอง
    expect(toolbar.find('.production-insight__filter-btn').exists()).toBe(true)

    await toggle.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:metal')[0]).toEqual(['SILVER'])

    const standalone = mountView()
    await settle()
    expect(standalone.wrapper.find('.production-insight__metal').exists()).toBe(false)
  })
})

describe('ProductionInsightView gold: legacy lens links and sub= sync', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockResolvedValue({ status: 'ok', problems: [], forecasts: [], actions: [], data: [], total: 0, kpi: [], series: [], workers: [], departments: [] })
    getMock.mockResolvedValue([])
  })

  const goldTabs = (wrapper) => wrapper.findAll('.insight-sub-tabs [role="tab"]')

  it('an old ?gldLens=tang link opens the tang tab; the legacy key is dropped from the URL on the next sync', async () => {
    const { wrapper, lastQuery } = mountView({ query: { view: 'gold', gldLens: 'tang' } })
    await settle()
    expect(wrapper.findComponent({ name: 'InsightPage' }).vm.currentSub).toBe('tang')
    await goldTabs(wrapper)[6].trigger('click')
    await settle()
    expect(lastQuery().sub).toBe('dept')
    expect(lastQuery()).not.toHaveProperty('gldLens')
  })

  it('legacy dept / setting values map to their tabs, unknown values and an explicit sub= are respected', async () => {
    for (const [query, expected] of [
      [{ view: 'gold', gldLens: 'dept' }, 'dept'],
      [{ view: 'gold', gldLens: 'setting' }, 'setting'],
      [{ view: 'gold', gldLens: 'all' }, 'problems'],
      [{ view: 'gold', gldLens: 'tang', sub: 'due' }, 'due']
    ]) {
      const { wrapper } = mountView({ query })
      await settle()
      expect(wrapper.findComponent({ name: 'InsightPage' }).vm.currentSub, JSON.stringify(query)).toBe(expected)
    }
  })

  it('the lens bar is gone and every tabbed section writes sub= (default omitted)', async () => {
    const { wrapper, lastQuery } = mountView({ query: { view: 'delivery' } })
    await settle()
    expect(wrapper.find('.production-insight__lens').exists()).toBe(false)
    await goldTabs(wrapper)[4].trigger('click')
    await settle()
    expect(lastQuery().sub).toBe('trend')
    await goldTabs(wrapper)[0].trigger('click')
    await settle()
    expect(lastQuery()).not.toHaveProperty('sub')
  })
})
