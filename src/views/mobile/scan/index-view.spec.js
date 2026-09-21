import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import MobileScanView from './index-view.vue'

vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: vi.fn(() => ({
    fetchCreateProductCostDeatialPlan: vi.fn()
  }))
}))

vi.mock('@/services/alert/sweetAlerts.js', () => ({
  warning: vi.fn(),
  error: vi.fn(),
  success: vi.fn()
}))

const mockFetchStockProduct = vi.fn()
vi.mock('@/services/utils/stock-scan.js', () => ({
  fetchStockProduct: (...args) => mockFetchStockProduct(...args)
}))

import { warning, error } from '@/services/alert/sweetAlerts.js'

function createWrapper() {
  return shallowMount(MobileScanView, {
    global: {
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
      }
    }
  })
}

describe('MobileScanView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('onManualInput', () => {
    it('uppercase อย่างเดียว ไม่เติมขีด (เลขใหม่ไม่มีขีด)', () => {
      const wrapper = createWrapper()
      wrapper.vm.onManualInput('dk20i001')

      expect(wrapper.vm.scanInput).toBe('DK20I001')
    })

    it('เลขเก่ามีขีดอยู่แล้ว → uppercase แต่ไม่แตะขีด', () => {
      const wrapper = createWrapper()
      wrapper.vm.onManualInput('dk-20h-014')

      expect(wrapper.vm.scanInput).toBe('DK-20H-014')
    })
  })

  describe('findProduct', () => {
    it('a) ลอง stockNumberOrigin ก่อนเสมอ ไม่เจอค่อยลอง stockNumber', async () => {
      mockFetchStockProduct
        .mockResolvedValueOnce({ data: null, status: 'not-found' })
        .mockResolvedValueOnce({ data: { stockNumber: 'DK001' }, status: 'ok' })

      const wrapper = createWrapper()
      const result = await wrapper.vm.findProduct('DK001')

      expect(mockFetchStockProduct).toHaveBeenNthCalledWith(1, expect.anything(), { stockNumberOrigin: 'DK001' })
      expect(mockFetchStockProduct).toHaveBeenNthCalledWith(2, expect.anything(), { stockNumber: 'DK001' })
      expect(result).toEqual({ data: { stockNumber: 'DK001' }, status: 'ok' })
    })

    it('b) lookup แรก error → คืนผลลัพธ์ error ทันที ไม่ลอง stockNumber ต่อ', async () => {
      mockFetchStockProduct.mockResolvedValueOnce({ data: null, status: 'error', httpStatus: 500 })

      const wrapper = createWrapper()
      const result = await wrapper.vm.findProduct('DK001')

      expect(mockFetchStockProduct).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: null, status: 'error', httpStatus: 500 })
    })
  })

  describe('searchProduct', () => {
    it('b) lookup แรก error → หยุดทันที แจ้ง errorLookupFailed ไม่เรียก lookup รอบสอง', async () => {
      mockFetchStockProduct.mockResolvedValueOnce({ data: null, status: 'error', httpStatus: 500 })

      const wrapper = createWrapper()
      await wrapper.vm.searchProduct('DK001')

      expect(mockFetchStockProduct).toHaveBeenCalledTimes(1)
      expect(error).toHaveBeenCalledWith('view.mobile.scan.errorLookupFailed:{"status":500}')
      expect(wrapper.vm.scannedProduct).toBeNull()
    })

    it('c) not-found ทั้งคู่ → error ด้วย errorProductNotFound', async () => {
      mockFetchStockProduct
        .mockResolvedValueOnce({ data: null, status: 'not-found' })
        .mockResolvedValueOnce({ data: null, status: 'not-found' })

      const wrapper = createWrapper()
      await wrapper.vm.searchProduct('DK001')

      expect(error).toHaveBeenCalledWith('view.mobile.scan.errorProductNotFound', 'view.mobile.scan.errorCheckCode')
      expect(wrapper.vm.scannedProduct).toBeNull()
    })

    it('d) ok → scannedProduct ถูก set และ scanInput ถูกล้าง', async () => {
      mockFetchStockProduct.mockResolvedValueOnce({ data: { stockNumber: 'DK001' }, status: 'ok' })

      const wrapper = createWrapper()
      wrapper.vm.scanInput = 'DK001'
      await wrapper.vm.searchProduct('DK001')

      expect(wrapper.vm.scannedProduct).toEqual({ stockNumber: 'DK001' })
      expect(wrapper.vm.scanInput).toBe('')
    })

    it('ค้นหาไม่เจอ → คงสินค้าตัวก่อนหน้าไว้บนจอ ไม่เคลียร์ทิ้ง', async () => {
      mockFetchStockProduct.mockResolvedValueOnce({ data: { stockNumber: 'DK001' }, status: 'ok' })

      const wrapper = createWrapper()
      await wrapper.vm.searchProduct('DK001')
      expect(wrapper.vm.scannedProduct).toEqual({ stockNumber: 'DK001' })

      mockFetchStockProduct
        .mockResolvedValueOnce({ data: null, status: 'not-found' })
        .mockResolvedValueOnce({ data: null, status: 'not-found' })
      await wrapper.vm.searchProduct('DK999')

      expect(wrapper.vm.scannedProduct).toEqual({ stockNumber: 'DK001' })
    })
  })

  describe('onCameraDetect', () => {
    it('e) ปิดกล้องทันที แล้วค้นหาโค้ดที่สแกนได้ (uppercase/trim)', async () => {
      mockFetchStockProduct.mockResolvedValueOnce({ data: { stockNumber: 'DK001' }, status: 'ok' })

      const wrapper = createWrapper()
      wrapper.vm.showCamera = true
      wrapper.vm.onCameraDetect('  dk001  ')

      expect(wrapper.vm.showCamera).toBe(false)

      await flushPromises()

      expect(mockFetchStockProduct).toHaveBeenCalledWith(expect.anything(), { stockNumberOrigin: 'DK001' })
      expect(wrapper.vm.scannedProduct).toEqual({ stockNumber: 'DK001' })
    })
  })

  describe('handleManualSearch', () => {
    it('ไม่กรอกอะไร → warning เตือน ไม่เรียก lookup', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.handleManualSearch()

      expect(warning).toHaveBeenCalledWith('view.mobile.scan.warnEnterCode')
      expect(mockFetchStockProduct).not.toHaveBeenCalled()
    })
  })
})
