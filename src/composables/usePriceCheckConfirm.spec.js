import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

const priceCheck = vi.fn()
vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: () => ({ priceCheck })
}))

import priceCheckConfirm from './usePriceCheckConfirm.js'

const mountHost = () =>
  mount(
    defineComponent({
      mixins: [priceCheckConfirm],
      render() {
        return h('div')
      }
    })
  )

const outlierResponse = {
  items: [{ key: 'a', isOutlier: true, reasons: [{ code: 'SAME_WO', reference: 61000 }], suggestedPrice: 61100 }]
}

describe('confirmPriceOrAbort', () => {
  beforeEach(() => priceCheck.mockReset())

  it('ไม่มี outlier → true ทันที ไม่เปิด modal', async () => {
    priceCheck.mockResolvedValue({ items: [{ key: 'a', isOutlier: false, reasons: [] }] })
    const wrapper = mountHost()
    expect(await wrapper.vm.confirmPriceOrAbort([{ key: 'a', price: 100 }])).toBe(true)
    expect(wrapper.vm.priceCheckModal.show).toBe(false)
  })

  it('API ล้มเหลว (null) → true', async () => {
    priceCheck.mockResolvedValue(null)
    const wrapper = mountHost()
    expect(await wrapper.vm.confirmPriceOrAbort([{ key: 'a', price: 100 }])).toBe(true)
  })

  it('มี outlier แล้วกดยืนยัน → true', async () => {
    priceCheck.mockResolvedValue(outlierResponse)
    const wrapper = mountHost()
    const p = wrapper.vm.confirmPriceOrAbort([{ key: 'a', price: 611000 }])
    await vi.waitFor(() => expect(wrapper.vm.priceCheckModal.show).toBe(true))
    wrapper.vm.onPriceCheckConfirm()
    expect(await p).toBe(true)
    expect(wrapper.vm.priceCheckModal.show).toBe(false)
  })

  it('กดแก้ไขราคา → false และเรียก onFocus', async () => {
    priceCheck.mockResolvedValue(outlierResponse)
    const onFocus = vi.fn()
    const wrapper = mountHost()
    const p = wrapper.vm.confirmPriceOrAbort([{ key: 'a', price: 611000 }], { onFocus })
    await vi.waitFor(() => expect(wrapper.vm.priceCheckModal.show).toBe(true))
    wrapper.vm.onPriceCheckEdit()
    expect(await p).toBe(false)
    await wrapper.vm.$nextTick()
    expect(onFocus).toHaveBeenCalled()
  })

  it('ใช้ราคาที่แนะนำ → false และส่ง suggestion ให้ caller', async () => {
    priceCheck.mockResolvedValue(outlierResponse)
    const onApplySuggestions = vi.fn()
    const wrapper = mountHost()
    const p = wrapper.vm.confirmPriceOrAbort([{ key: 'a', price: 611000 }], { onApplySuggestions })
    await vi.waitFor(() => expect(wrapper.vm.priceCheckModal.show).toBe(true))
    wrapper.vm.onPriceCheckUseSuggested()
    expect(await p).toBe(false)
    expect(onApplySuggestions).toHaveBeenCalledWith([{ key: 'a', price: 61100 }])
  })
})
