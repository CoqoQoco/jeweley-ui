import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SaleOrderView from './sale-order-view.vue'
import { createLineKey } from '@/services/utils/line-key.js'
import { warning, error } from '@/services/alert/sweetAlerts.js'

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
  usrStockProductApiStore: vi.fn(() => ({
    fetchDataGet: vi.fn().mockResolvedValue(null),
    fetchStockAvailability: vi.fn().mockResolvedValue([])
  }))
}))

const mockFetchDataList = vi.fn().mockResolvedValue({ data: [] })
vi.mock('@/stores/modules/api/user/user-store.js', () => ({
  useUserApiStore: vi.fn(() => ({ fetchDataList: mockFetchDataList }))
}))

function makeItem(stockNumber, { isConfirm = false, invoice = null } = {}) {
  return {
    stockNumber,
    lineKey: createLineKey(),
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
    lineKey: createLineKey(),
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

describe('SaleOrderView — onSearchProduct รองรับสแกนเลขสินค้าซ้ำ (คนละบรรทัด)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSave.mockResolvedValue('SO-0001')
    mockFetchDataList.mockResolvedValue({ data: [] })
  })

  function makeProductData(overrides = {}) {
    return {
      stockNumber: 'STK-001',
      stockNumberOrigin: 'OLD-001',
      status: 'IN_STOCK',
      qty: 5,
      qtyAvailable: 5,
      productPrice: 1000,
      productNameEn: 'Ring',
      planQty: 1,
      reservations: [],
      ...overrides
    }
  }

  it('สแกนเลขเดิมซ้ำ ได้ 2 บรรทัดที่ lineKey ต่างกันและราคาเท่ากัน', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.productStore.fetchDataGet = vi.fn().mockResolvedValue(makeProductData())

    vm.productSearch.stockNumber = 'STK-001'
    await vm.onSearchProduct()
    vm.productSearch.stockNumber = 'STK-001'
    await vm.onSearchProduct()

    expect(vm.stockItems).toHaveLength(2)
    const [first, second] = vm.stockItems

    expect(first.lineKey).toBeTruthy()
    expect(second.lineKey).toBeTruthy()
    expect(first.lineKey).not.toBe(second.lineKey)
    expect(second.appraisalPrice).toBe(first.appraisalPrice)
    expect(second.price).toBe(first.price)
  })

  it('แก้จำนวนบรรทัดที่สองแล้วบรรทัดแรกไม่เปลี่ยนตาม', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.productStore.fetchDataGet = vi.fn().mockResolvedValue(makeProductData())

    vm.productSearch.stockNumber = 'STK-001'
    await vm.onSearchProduct()
    vm.productSearch.stockNumber = 'STK-001'
    await vm.onSearchProduct()

    expect(vm.stockItems).toHaveLength(2)
    const [first, second] = vm.stockItems
    const firstQtyBefore = first.qty

    second.qty = 3
    vm.onBlurQty(second, second.stockNumber, 'qty')

    expect(vm.stockItems[1].qty).toBe(3)
    expect(vm.stockItems[0].qty).toBe(firstQtyBefore)
  })

  it('reject status 400 (ไม่พบข้อมูล) → warning stockNotFound, stockItems ไม่เปลี่ยน', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.productStore.fetchDataGet = vi.fn().mockRejectedValue({ response: { status: 400 } })

    vm.productSearch.stockNumber = 'STK-404'
    await vm.onSearchProduct()

    expect(warning).toHaveBeenCalledWith('view.sale.saleOrder.warn.stockNotFound')
    expect(error).not.toHaveBeenCalled()
    expect(vm.stockItems).toHaveLength(0)
  })

  it('reject status 500 (server crash) → error stockLookupFailed ไม่ใช่ warning stockNotFound, stockItems ไม่เปลี่ยน', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.productStore.fetchDataGet = vi.fn().mockRejectedValue({ response: { status: 500 } })

    vm.productSearch.stockNumber = 'STK-500'
    await vm.onSearchProduct()

    expect(error).toHaveBeenCalledWith(
      'view.sale.saleOrder.warn.stockLookupFailed:{"status":500}'
    )
    expect(warning).not.toHaveBeenCalled()
    expect(vm.stockItems).toHaveLength(0)
  })

  it('reject ไม่มี response (network failure) → error stockLookupFailed ใช้ status Network', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    vm.productStore.fetchDataGet = vi.fn().mockRejectedValue(new Error('Network Error'))

    vm.productSearch.stockNumber = 'STK-NET'
    await vm.onSearchProduct()

    expect(error).toHaveBeenCalledWith(
      'view.sale.saleOrder.warn.stockLookupFailed:{"status":"Network"}'
    )
    expect(vm.stockItems).toHaveLength(0)
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

describe('SaleOrderView — P4-1/P4-2 เติมของจากคลัง (copy line ↔ stock line)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSave.mockResolvedValue('SO-0001')
    mockFetchDataList.mockResolvedValue({ data: [] })
  })

  it('deleteStockItem: ลบบรรทัดที่เติมจาก copy line (unconfirmed) ต้องคืน qty กลับให้ copy line เดิม', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const copyLineKey = createLineKey()
    vm.copyItems = [{ lineKey: copyLineKey, qty: 2, orderedQty: 4, productNumber: 'R001' }]

    const stockLine = makeItem('STK-001')
    stockLine.sourceCopyLineKey = copyLineKey
    stockLine.qty = 2
    vm.stockItems = [stockLine]

    vm.deleteStockItem(stockLine)

    expect(vm.stockItems).toHaveLength(0)
    expect(vm.copyItems[0].qty).toBe(4)
  })

  it('deleteStockItem: copy line ต้นทางถูกลบไปแล้ว → ไม่ throw และไม่แก้ copyItems', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const stockLine = makeItem('STK-002')
    stockLine.sourceCopyLineKey = 'not-exist'
    vm.copyItems = []
    vm.stockItems = [stockLine]

    expect(() => vm.deleteStockItem(stockLine)).not.toThrow()
    expect(vm.stockItems).toHaveLength(0)
    expect(vm.copyItems).toHaveLength(0)
  })

  it('deleteStockItem: บรรทัดที่ confirm แล้ว ต้องไม่คืน qty กลับ copy line แม้มี sourceCopyLineKey', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const copyLineKey = createLineKey()
    vm.copyItems = [{ lineKey: copyLineKey, qty: 0, orderedQty: 4 }]

    const stockLine = makeItem('STK-003', { isConfirm: true })
    stockLine.sourceCopyLineKey = copyLineKey
    stockLine.qty = 4
    vm.stockItems = [stockLine]

    vm.deleteStockItem(stockLine)

    expect(vm.copyItems[0].qty).toBe(0)
  })

  it('onFillCopyLineFromStock: fill ครั้งแรก → ตั้ง orderedQty, ลด qty, เพิ่มบรรทัดสินค้าจริง และเรียก fetchSave', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const copyLineKey = createLineKey()
    vm.copyItems = [
      { lineKey: copyLineKey, qty: 4, productNumber: 'R001', appraisalPrice: 500, discountPercent: 10 }
    ]
    vm.stockItems = []

    const newLine = { lineKey: createLineKey(), stockNumber: 'STK-100', qty: 1, sourceCopyLineKey: copyLineKey }

    await vm.onFillCopyLineFromStock({ copyItem: vm.copyItems[0], newLine, qty: 1 })

    expect(vm.stockItems).toHaveLength(1)
    expect(vm.stockItems[0].stockNumber).toBe('STK-100')
    expect(vm.stockItems[0].sourceCopyLineKey).toBe(copyLineKey)
    expect(vm.copyItems[0].orderedQty).toBe(4)
    expect(vm.copyItems[0].qty).toBe(3)
    expect(mockFetchSave).toHaveBeenCalledTimes(1)
    expect(vm.isShow.fillFromStockModal).toBeFalsy()
  })

  it('onFillCopyLineFromStock: fill ครั้งที่สอง (orderedQty มีแล้ว) ต้องไม่ถูกเขียนทับ', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const copyLineKey = createLineKey()
    vm.copyItems = [{ lineKey: copyLineKey, qty: 3, orderedQty: 4 }]

    const newLine = { lineKey: createLineKey(), stockNumber: 'STK-101', qty: 3, sourceCopyLineKey: copyLineKey }

    await vm.onFillCopyLineFromStock({ copyItem: vm.copyItems[0], newLine, qty: 3 })

    expect(vm.copyItems[0].orderedQty).toBe(4)
    expect(vm.copyItems[0].qty).toBe(0)
  })
})
