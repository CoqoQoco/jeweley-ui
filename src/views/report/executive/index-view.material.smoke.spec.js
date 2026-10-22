// index-view.material.smoke.spec.js — แท็บใหม่ "คลังวัตถุดิบ" ของหน้า executive: อยู่ระหว่างคลังสินค้ากับการไหลของงาน, ไม่มีปุ่มสลับโลหะ, sub=/kind= ตั้งต้นเฉพาะตอนเข้าด้วย tab=material และไม่ค้างข้ามแท็บ
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
      stubs: { summaryView: true, salesInsightView: true, stockInsightView: true, materialInsightView: true, flowView: true, productionInsightView: true }
    }
  })
  return { wrapper, replace }
}

const metalButtons = (wrapper) => wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('metalScope.options'))
const material = (wrapper) => wrapper.findComponent({ name: 'materialInsightView' })

describe('Executive material tab (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('the tab sits between stock and flow and opens from ?tab=material with its sub / kind', async () => {
    const { wrapper } = mountView({ tab: 'material', sub: 'items', kind: 'gold' })
    await flushPromises()
    const labels = wrapper.vm.tabsConfig.map((t) => t.value)
    expect(labels).toEqual(['production', 'sales', 'stock', 'material', 'flow'])
    expect(wrapper.vm.tabsConfig[3].label).toBe('view.executive.tabs.material')
    expect(wrapper.vm.activeTab).toBe('material')
    expect(material(wrapper).exists()).toBe(true)
    expect(material(wrapper).props('initialSub')).toBe('items')
    expect(material(wrapper).props('initialKind')).toBe('gold')
  })

  it('no metal toggle anywhere on this tab (the metal scope does not apply); other non-production tabs still show it', async () => {
    const { wrapper } = mountView({ tab: 'material' })
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(false)
    expect(metalButtons(wrapper)).toHaveLength(0)
    wrapper.vm.onTabChange('stock')
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(true)
    expect(metalButtons(wrapper).length).toBeGreaterThan(0)
  })

  it('leaving the tab drops sub and kind from the URL; a sub from another tab does not leak into it', async () => {
    const { wrapper, replace } = mountView({ tab: 'material', sub: 'items', kind: 'gold' })
    await flushPromises()
    wrapper.vm.onTabChange('stock')
    await flushPromises()
    const query = replace.mock.calls.at(-1)[0].query
    expect(query.tab).toBe('stock')
    expect(query).not.toHaveProperty('sub')
    expect(query).not.toHaveProperty('kind')

    const other = mountView({ tab: 'production', sub: 'trend' })
    await flushPromises()
    other.wrapper.vm.onTabChange('material')
    await flushPromises()
    expect(material(other.wrapper).props('initialSub')).toBe('')
  })

  it('the refresh button bumps the token passed to the material view', async () => {
    const { wrapper } = mountView({ tab: 'material' })
    await flushPromises()
    const before = material(wrapper).props('refreshToken')
    wrapper.vm.onRefresh()
    await flushPromises()
    expect(material(wrapper).props('refreshToken')).toBe(before + 1)
  })
})
