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
const mockFetchGet = vi.fn().mockResolvedValue(null)
vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({ fetchSave: mockFetchSave, fetchGet: mockFetchGet }))
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

function makeHeavyItem(stockNumber) {
  return {
    stockNumber,
    isConfirm: false,
    invoice: null,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0,
    materials: [{ type: 'Gold', weight: 5 }],
    imageBase64: 'data:image/png;base64,AAAA',
    priceTransactions: [{ id: 1 }],
    planPriceItems: [{ id: 2 }]
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

describe('SaleOrderView — fetchSaveSaleOrder payload (ลดขนาด payload)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSave.mockResolvedValue('SO-0001')
    mockFetchGet.mockResolvedValue(null)
    mockFetchDataList.mockResolvedValue({ data: [] })
  })

  it('data ที่ส่งเข้า fetchSave ต้องไม่มี allItems / imageBase64 / priceTransactions / planPriceItems แต่ต้องยังมี materials', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const heavyItem = makeHeavyItem('A')
    vm.stockItems = [heavyItem]

    await vm.fetchSaveSaleOrder()

    expect(mockFetchSave).toHaveBeenCalledTimes(1)
    const sentData = JSON.parse(mockFetchSave.mock.calls[0][0].formValue.data)

    expect(sentData.allItems).toBeUndefined()
    expect(sentData.stockItems).toHaveLength(1)

    const sentItem = sentData.stockItems[0]
    expect(sentItem.imageBase64).toBeUndefined()
    expect(sentItem.priceTransactions).toBeUndefined()
    expect(sentItem.planPriceItems).toBeUndefined()
    expect(sentItem.materials).toEqual(heavyItem.materials)
  })

  it('this.stockItems ต้นฉบับต้องไม่ถูก mutate — ยังมีฟิลด์หนักครบหลังบันทึก', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const heavyItem = makeHeavyItem('A')
    vm.stockItems = [heavyItem]

    await vm.fetchSaveSaleOrder()

    expect(vm.stockItems[0].imageBase64).toBe(heavyItem.imageBase64)
    expect(vm.stockItems[0].priceTransactions).toEqual(heavyItem.priceTransactions)
    expect(vm.stockItems[0].planPriceItems).toEqual(heavyItem.planPriceItems)
    expect(vm.stockItems[0].materials).toEqual(heavyItem.materials)
  })
})

describe('SaleOrderView — ย้ายจังหวะบันทึก (openConfirmStockModal / onStockItemsConfirmed)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSave.mockResolvedValue('SO-0001')
    mockFetchGet.mockResolvedValue({
      stockConfirm: [],
      data: JSON.stringify({ stockItems: [], copyItems: [] })
    })
    mockFetchDataList.mockResolvedValue({ data: [] })
  })

  it('openConfirmStockModal ต้องไม่เรียก fetchSave และต้องเปิดโมดัลทันที', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.formSaleOrder.customerCode = 'C001'
    vm.formSaleOrder.customerName = 'Test Customer'
    vm.stockItems = [makeItem('A')]

    await vm.openConfirmStockModal()

    expect(mockFetchSave).not.toHaveBeenCalled()
    expect(vm.isShow.confirmStockModal).toBe(true)
  })

  it('onStockItemsConfirmed ต้องเรียก fetchSave ก่อน fetchGet', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.formSaleOrder.number = 'SO-0001'
    vm.stockItems = [makeItem('A')]

    await vm.onStockItemsConfirmed()

    expect(mockFetchSave).toHaveBeenCalledTimes(1)
    expect(mockFetchGet).toHaveBeenCalledTimes(1)
    expect(mockFetchSave.mock.invocationCallOrder[0]).toBeLessThan(mockFetchGet.mock.invocationCallOrder[0])
  })
})
