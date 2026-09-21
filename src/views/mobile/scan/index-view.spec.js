import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MobileScanView from './index-view.vue'

vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: vi.fn(() => ({}))
}))

vi.mock('@/services/alert/sweetAlerts.js', () => ({
  warning: vi.fn(),
  error: vi.fn(),
  success: vi.fn()
}))

function createWrapper() {
  return shallowMount(MobileScanView, {
    global: {
      mocks: {
        $t: (key) => key
      }
    }
  })
}

describe('MobileScanView — onManualInput', () => {
  it('uppercase อย่างเดียว ไม่เติมขีด (เลขใหม่ไม่มีขีด)', () => {
    const wrapper = createWrapper()
    wrapper.vm.manualInput = 'dk20i001'
    wrapper.vm.onManualInput()

    expect(wrapper.vm.manualInput).toBe('DK20I001')
  })

  it('เลขเก่ามีขีดอยู่แล้ว → uppercase แต่ไม่แตะขีด', () => {
    const wrapper = createWrapper()
    wrapper.vm.manualInput = 'dk-20h-014'
    wrapper.vm.onManualInput()

    expect(wrapper.vm.manualInput).toBe('DK-20H-014')
  })

  it('searchField เป็น stockNumberOrigin → uppercase เหมือนกัน', () => {
    const wrapper = createWrapper()
    wrapper.vm.searchField = 'stockNumberOrigin'
    wrapper.vm.manualInput = '9k16478'
    wrapper.vm.onManualInput()

    expect(wrapper.vm.manualInput).toBe('9K16478')
  })
})
