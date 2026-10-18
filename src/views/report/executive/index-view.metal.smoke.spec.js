// index-view.metal.smoke.spec.js — หน้า executive: ปุ่มสลับโลหะใน header แสดงเฉพาะเมื่อแท็บที่เปิดไม่ใช่ production (แท็บผลิตมีปุ่มเดียวกันในแถบเครื่องมือ insight)
// และ production รับ metal + ส่ง update:metal กลับมาเปลี่ยนค่าที่ executive (store/URL/summary ที่เดียว)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: vi.fn(async () => ({})), get: vi.fn(async () => ({})) } }
}))

import ExecutiveIndexView from './index-view.vue'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

function mountView(query = {}) {
  const replace = vi.fn(() => Promise.resolve())
  const wrapper = mount(ExecutiveIndexView, {
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key) => key, $route: { query: { ...query } }, $router: { replace, resolve: () => ({ meta: { permissions: [] }, href: '/x' }) } },
      stubs: { summaryView: true, salesView: true, stockHealthView: true, flowView: true, productionInsightView: true }
    }
  })
  return { wrapper, replace }
}

const metalButtons = (wrapper) => wrapper.findAll('[role="tab"]').filter((b) => b.text().includes('metalScope.options'))

describe('ExecutiveIndexView metal toggle placement (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('production tab: no header toggle; the production view gets the metal and its update:metal changes the page metal', async () => {
    const { wrapper } = mountView({ tab: 'production', metal: 'SILVER' })
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(false)
    expect(metalButtons(wrapper)).toHaveLength(0)

    const insight = wrapper.findComponent({ name: 'productionInsightView' })
    expect(insight.exists()).toBe(true)
    expect(insight.props('metal')).toBe('SILVER')

    insight.vm.$emit('update:metal', 'ALL')
    await flushPromises()
    expect(wrapper.vm.metal).toBe('ALL')
    expect(useMetalScopeStore().metal).toBe('ALL')
  })

  it('other tabs: the header toggle is shown (exactly one toggle at a time) and it still changes the metal', async () => {
    const { wrapper } = mountView({ tab: 'sales' })
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(true)
    expect(metalButtons(wrapper)).toHaveLength(3)

    wrapper.vm.onTabChange('production')
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(false)
    expect(metalButtons(wrapper)).toHaveLength(0)
    wrapper.vm.onTabChange('flow')
    await flushPromises()
    expect(wrapper.vm.showHeaderMetalToggle).toBe(true)
    expect(metalButtons(wrapper)).toHaveLength(3)
    wrapper.vm.onMetalChange('GOLD')
    expect(wrapper.vm.metal).toBe('GOLD')
  })
})
