import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

vi.mock('@/axios/axios-helper.js', () => ({
  default: {
    jewelry: {
      get: vi.fn().mockRejectedValue(new Error('network blocked in spec')),
      post: vi.fn().mockRejectedValue(new Error('network blocked in spec'))
    }
  }
}))
vi.mock('@/services/helper/print/bill-layout-store.js', () => ({
  getBillLayout: vi.fn(() => Promise.resolve(null)),
  saveBillLayout: vi.fn()
}))
vi.mock('@/services/api/print-bridge-service.js', () => ({ printGeneric: vi.fn() }))
vi.mock('@/services/helper/print/bill-print-model-builder.js', () => ({ buildBillPrintModel: vi.fn() }))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/services/storage.js', () => ({ storage: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() } }))
vi.mock('@/services/api/printer-config-service.js', () => ({
  PRINT_BRIDGE_BASE_URL: 'https://bridge.test',
  fetchPrinterList: vi.fn(() => Promise.resolve({ status: 'empty', printers: [], detail: '' }))
}))

import BillPrintLayoutView from './index-view.vue'

function findCodeModeRadio(wrapper) {
  return wrapper
    .findAllComponents({ name: 'RadioGroupGeneric' })
    .find((c) => c.props('options').some((o) => o.value === 'mold'))
}

async function mountView() {
  const wrapper = mount(BillPrintLayoutView, {
    global: {
      mocks: { $t: (k) => k },
      stubs: { AutoCompleteGeneric: true, InputTextGeneric: true, ButtonGeneric: true, CheckboxGeneric: true, RadioGroupGeneric: { name: 'RadioGroupGeneric', props: Object.keys(RadioGroupGeneric.props), template: '<div class="radio-stub" />' } }
    }
  })
  await flushPromises()
  return wrapper
}

describe('bill-print-layout product code mode radio', () => {
  it('stays visible but disabled when the product-code column is unticked, enabled when ticked', async () => {
    const wrapper = await mountView()
    const vm = wrapper.vm.$.proxy

    vm.form.showProductNumber = false
    await wrapper.vm.$nextTick()
    let radio = findCodeModeRadio(wrapper)
    expect(radio).toBeTruthy()
    expect(radio.props('disabled')).toBe(true)

    vm.form.showProductNumber = true
    await wrapper.vm.$nextTick()
    radio = findCodeModeRadio(wrapper)
    expect(radio).toBeTruthy()
    expect(radio.props('disabled')).toBe(false)
  })

  it('labels the checkbox row with product code / mold', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('แสดงคอลัมน์ รหัสสินค้า / แม่พิมพ์')
  })
})
