import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SaleOrderView from './sale-order-view.vue'

vi.mock('@/services/alert/sweetAlerts.js', () => {
  const warning = vi.fn()
  const error = vi.fn()
  const success = vi.fn()
  const confirmSubmit = vi.fn()
  const swAlert = { warning, error, success, confirmSubmit }
  return { default: swAlert, warning, error, success, confirmSubmit }
})

const mockFetchSave = vi.fn().mockResolvedValue('SO-0001')
vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({ fetchSave: mockFetchSave }))
}))

vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: vi.fn(() => ({ fetchDataGet: vi.fn().mockResolvedValue(null) }))
}))

const mockFetchDataList = vi.fn().mockResolvedValue({ data: [] })
vi.mock('@/stores/modules/api/user/user-store.js', () => ({
  useUserApiStore: vi.fn(() => ({ fetchDataList: mockFetchDataList }))
}))

function makeItem(stockNumber, { isConfirm = false, invoice = null } = {}) {
  return {
    stockNumber,
    isConfirm,
    invoice,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
}

function createWrapper() {
  const pinia = createPinia()
  const wrapper = shallowMount(SaleOrderView, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
      }
    }
  })
  return { wrapper, vm: wrapper.vm.$.proxy }
}

describe('SaleOrderView — moveStockItem (ย้ายลำดับสินค้าที่ยืนยันแล้ว)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSave.mockResolvedValue('SO-0001')
    mockFetchDataList.mockResolvedValue({ data: [] })
  })

  it('ย้ายลง: confirmed 2 ตัวติดกัน สลับกันถูกตำแหน่ง (ไม่บันทึกอัตโนมัติ)', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem('A', { isConfirm: true })
    const b = makeItem('B', { isConfirm: true })
    vm.stockItems = [a, b]

    vm.moveStockItem({ item: a, direction: 'down' })

    expect(vm.stockItems.map((i) => i.stockNumber)).toEqual(['B', 'A'])
    expect(mockFetchSave).not.toHaveBeenCalled()
  })

  it('ข้ามแถวกลุ่มอื่น: ลำดับสัมพัทธ์ของรายการที่ออก Invoice แล้วต้องไม่เปลี่ยน (ไม่บันทึกอัตโนมัติ)', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const inv1 = makeItem('INV1', { isConfirm: true, invoice: 'INV-001' })
    const a = makeItem('A', { isConfirm: true })
    const inv2 = makeItem('INV2', { isConfirm: true, invoice: 'INV-002' })
    const b = makeItem('B', { isConfirm: true })
    vm.stockItems = [inv1, a, inv2, b]

    vm.moveStockItem({ item: a, direction: 'down' })

    expect(vm.stockItems.map((i) => i.stockNumber)).toEqual(['INV1', 'B', 'INV2', 'A'])
    expect(mockFetchSave).not.toHaveBeenCalled()
  })

  it('หัวกลุ่มกดขึ้น และท้ายกลุ่มกดลง ต้องไม่เปลี่ยนอะไรเลย (ไม่บันทึกอัตโนมัติ)', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem('A', { isConfirm: true })
    const b = makeItem('B', { isConfirm: true })
    vm.stockItems = [a, b]

    vm.moveStockItem({ item: a, direction: 'up' })
    expect(vm.stockItems.map((i) => i.stockNumber)).toEqual(['A', 'B'])

    vm.moveStockItem({ item: b, direction: 'down' })
    expect(vm.stockItems.map((i) => i.stockNumber)).toEqual(['A', 'B'])
    expect(mockFetchSave).not.toHaveBeenCalled()
  })

  it('แถวที่มี invoice แล้ว สั่งย้าย ต้องไม่เปลี่ยนอะไรเลย (ไม่บันทึกอัตโนมัติ)', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const invoiced = makeItem('INV1', { isConfirm: true, invoice: 'INV-001' })
    const a = makeItem('A', { isConfirm: true })
    vm.stockItems = [invoiced, a]

    vm.moveStockItem({ item: invoiced, direction: 'down' })

    expect(vm.stockItems.map((i) => i.stockNumber)).toEqual(['INV1', 'A'])
    expect(mockFetchSave).not.toHaveBeenCalled()
  })
})
