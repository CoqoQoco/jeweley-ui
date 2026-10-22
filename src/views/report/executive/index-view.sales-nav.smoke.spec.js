// index-view.sales-nav.smoke.spec.js — การ์ดสรุป 6 ใบของหน้า executive พาไปแท็บ "ขายและเงิน" พร้อมแท็บย่อย/ตัวสลับของบิลนั้น (target) และ ?sub= ไม่ค้างข้ามแท็บ
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: vi.fn(async () => ({})), get: vi.fn(async () => ({})) } }
}))

import ExecutiveIndexView from './index-view.vue'

function mountView(query = {}) {
  const replace = vi.fn(() => Promise.resolve())
  const wrapper = mount(ExecutiveIndexView, {
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key) => key, $route: { query: { ...query } }, $router: { replace, resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { summaryView: true, salesInsightView: true, stockInsightView: true, flowView: true, productionInsightView: true }
    }
  })
  return { wrapper, replace }
}

const sales = (wrapper) => wrapper.findComponent({ name: 'salesInsightView' })

describe('Executive summary cards -> sales tab target (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it.each([
    ['receivablesOutstanding', { sub: 'due', dueFilter: 'unpaid' }],
    ['noDueDate', { sub: 'due', dueFilter: 'noDue' }],
    ['soNoInvoice', { sub: 'so' }]
  ])('%s opens the sales tab with %j', async (kpiKey, expected) => {
    const { wrapper } = mountView({ tab: 'production' })
    await flushPromises()
    wrapper.findComponent({ name: 'summaryView' }).vm.$emit('select-tab', 'sales', kpiKey)
    await flushPromises()
    expect(wrapper.vm.activeTab).toBe('sales')
    expect(sales(wrapper).props('target')).toEqual(expected)
  })

  it('clicking again gives a new target object so the same destination re-applies', async () => {
    const { wrapper } = mountView({ tab: 'sales' })
    await flushPromises()
    const summary = wrapper.findComponent({ name: 'summaryView' })
    summary.vm.$emit('select-tab', 'sales', 'soNoInvoice')
    await flushPromises()
    const first = sales(wrapper).props('target')
    summary.vm.$emit('select-tab', 'sales', 'soNoInvoice')
    await flushPromises()
    expect(sales(wrapper).props('target')).toEqual(first)
    expect(sales(wrapper).props('target')).not.toBe(first)
  })

  it('cards for other tabs and plain tab clicks carry no sales target', async () => {
    const { wrapper } = mountView({ tab: 'sales' })
    await flushPromises()
    wrapper.findComponent({ name: 'summaryView' }).vm.$emit('select-tab', 'stock', 'stockNoCost')
    await flushPromises()
    expect(wrapper.vm.salesTarget).toBeNull()
    wrapper.vm.onTabChange('sales')
    await flushPromises()
    expect(wrapper.vm.salesTarget).toBeNull()
  })

  it('?tab=sales&sub=… seeds the sales view; leaving the tab drops sub from the URL', async () => {
    const { wrapper, replace } = mountView({ tab: 'sales', sub: 'trend' })
    await flushPromises()
    expect(sales(wrapper).props('initialSub')).toBe('trend')
    wrapper.vm.onTabChange('stock')
    await flushPromises()
    const query = replace.mock.calls.at(-1)[0].query
    expect(query.tab).toBe('stock')
    expect(query).not.toHaveProperty('sub')
  })

  it('a sub for another tab does not leak into the sales tab', async () => {
    const { wrapper } = mountView({ tab: 'production', sub: 'trend' })
    await flushPromises()
    wrapper.vm.onTabChange('sales')
    await flushPromises()
    expect(sales(wrapper).props('initialSub')).toBe('')
  })

  it('Digest [view] on a production topic opens the production tab with that view; a sales due finding sets the sales target', async () => {
    const { wrapper } = mountView({ tab: 'stock' })
    await flushPromises()
    const digest = wrapper.findComponent({ name: 'ExecutiveDigestView' })
    digest.vm.$emit('select-tab', 'production', { tab: 'gold', reportRef: 'goldKpi', code: 'X', params: {} })
    await flushPromises()
    expect(wrapper.vm.activeTab).toBe('production')
    expect(wrapper.vm.productionTarget).toEqual({ view: 'gold' })
    digest.vm.$emit('select-tab', 'sales', { tab: 'sales', reportRef: 'salDue', code: 'SAL_NO_DUE_DATE', params: {} })
    await flushPromises()
    expect(wrapper.vm.activeTab).toBe('sales')
    expect(wrapper.vm.productionTarget).toBeNull()
    expect(sales(wrapper).props('target')).toEqual({ sub: 'due', dueFilter: 'noDue' })
  })
})
