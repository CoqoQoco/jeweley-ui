// index-view.quality.smoke.spec.js — แท็บ "คุณภาพข้อมูล" ของหน้า executive: เป็นแท็บสุดท้าย, เปิดจาก ?tab=quality พร้อม sub, ใช้ metal ของหน้า (มีปุ่มสลับ), [ดู ›] พาไปแท็บปลายทาง
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
      stubs: { summaryView: true, salesInsightView: true, stockInsightView: true, materialInsightView: true, qualityInsightView: true, flowView: true, productionInsightView: true }
    }
  })
  return { wrapper, replace }
}

const quality = (wrapper) => wrapper.findComponent({ name: 'qualityInsightView' })

describe('Executive data quality tab (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('is the last tab and opens from ?tab=quality with its sub and the page metal', async () => {
    const { wrapper } = mountView({ tab: 'quality', sub: 'overview', metal: 'silver' })
    await flushPromises()
    expect(wrapper.vm.tabsConfig.at(-1)).toEqual({ value: 'quality', label: 'view.executive.tabs.quality' })
    expect(wrapper.vm.activeTab).toBe('quality')
    expect(quality(wrapper).exists()).toBe(true)
    expect(quality(wrapper).props('initialSub')).toBe('overview')
    expect(quality(wrapper).props('metal')).toBe('SILVER')
    expect(wrapper.vm.showHeaderMetalToggle).toBe(true)
  })

  it('leaving the tab drops sub from the URL and a sub from another tab does not leak in', async () => {
    const { wrapper, replace } = mountView({ tab: 'quality', sub: 'overview' })
    await flushPromises()
    wrapper.vm.onTabChange('stock')
    await flushPromises()
    expect(replace.mock.calls.at(-1)[0].query.tab).toBe('stock')
    expect(replace.mock.calls.at(-1)[0].query).not.toHaveProperty('sub')

    const other = mountView({ tab: 'stock', sub: 'age' })
    await flushPromises()
    other.wrapper.vm.onTabChange('quality')
    await flushPromises()
    expect(quality(other.wrapper).props('initialSub')).toBe('')
  })

  it('navigate from the tab switches to the target tab the same way as a Digest card', async () => {
    const { wrapper } = mountView({ tab: 'quality' })
    await flushPromises()
    quality(wrapper).vm.$emit('navigate', 'sales', { tab: 'sales', reportRef: 'salDue', code: 'DQ_INVOICE_NO_DUE', params: { dueFilter: 'noDue' } })
    await flushPromises()
    expect(wrapper.vm.activeTab).toBe('sales')
    expect(wrapper.vm.salesTarget).toEqual({ sub: 'due', dueFilter: 'noDue' })

    wrapper.vm.onTabChange('quality')
    quality(wrapper).vm.$emit('navigate', 'production', { tab: 'workers', reportRef: 'wrkTable', code: 'DQ_PLACEHOLDER_WIP', params: {} })
    await flushPromises()
    expect(wrapper.vm.activeTab).toBe('production')
    expect(wrapper.vm.productionTarget).toEqual({ view: 'workers' })
  })
})
