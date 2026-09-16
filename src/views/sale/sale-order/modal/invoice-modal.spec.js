import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import InvoiceModal from './invoice-modal.vue'

vi.mock('@/services/alert/sweetAlerts.js', () => {
  const warning = vi.fn()
  const success = vi.fn()
  const swAlert = { warning, success }
  return { default: swAlert, warning, success }
})

const mockFetchCreate = vi.fn().mockResolvedValue({ invoiceNumber: 'INV-0001' })
vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: vi.fn(() => ({ fetchCreate: mockFetchCreate }))
}))

const mockFetchActiveList = vi.fn().mockResolvedValue([])
const mockFetchCurrent = vi.fn().mockResolvedValue(null)
vi.mock('@/stores/modules/api/sale/sale-channel-store.js', () => ({
  useSaleChannelApiStore: vi.fn(() => ({
    fetchActiveList: mockFetchActiveList,
    fetchCurrent: mockFetchCurrent
  }))
}))

// D5: SO deposit balance — default ไม่มีมัดจำค้าง (balance: 0) เพื่อไม่กระทบพฤติกรรมเดิมของเทสต์ชุดนี้
const mockDepositFetchList = vi.fn().mockResolvedValue({ balance: 0, totalReceived: 0, totalApplied: 0, deposits: [] })
vi.mock('@/stores/modules/api/sale/sale-order-deposit-store.js', () => ({
  usrSaleOrderDepositApiStore: vi.fn(() => ({ fetchList: mockDepositFetchList }))
}))

vi.mock('@/components/modal/modal-view.vue', () => ({
  default: {
    name: 'ModalView',
    template: '<div><slot name="content" /></div>',
    props: ['showModal', 'width'],
    emits: ['closeModal']
  }
}))

const sampleSaleOrder = { number: 'SO-0001', customerName: 'Test Customer', currencyUnit: 'THB', currencyRate: 1 }
const sampleStockItems = [
  { id: 1, isConfirm: true, invoice: false, stockNumber: 'S1', qty: 1, appraisalPrice: 100, discountPercent: 0 }
]

function createWrapper(tMock) {
  const pinia = createPinia()
  return shallowMount(InvoiceModal, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: tMock || ((key, params) => (params ? `${key}:${JSON.stringify(params)}` : key))
      }
    },
    props: {
      isShowModal: true,
      saleOrderData: sampleSaleOrder,
      stockItems: sampleStockItems
    }
  })
}

describe('InvoiceModal — paymentName integrity (ป้องกันบั๊กภาษารั่วลง DB)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCreate.mockResolvedValue({ invoiceNumber: 'INV-0001' })
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
    mockDepositFetchList.mockResolvedValue({ balance: 0, totalReceived: 0, totalApplied: 0, deposits: [] })
  })

  const runWith = async (tMock) => {
    const wrapper = createWrapper(tMock)
    await flushPromises()

    wrapper.vm.selectedItems = [1]
    await wrapper.vm.generateInvoice()

    return mockFetchCreate.mock.calls[0][0].formValue.paymentName
  }

  it('paymentName (default cash) เท่ากันทั้ง TH mock และ EN mock และเท่ากับ apiName', async () => {
    const thResult = await runWith((key) => `TH:${key}`)
    const enResult = await runWith((key) => `EN:${key}`)

    expect(thResult).toBe('เงินสด (Cash)')
    expect(enResult).toBe('เงินสด (Cash)')
    expect(thResult).toBe(enResult)
    expect(thResult.startsWith('view.')).toBe(false)
  })
})

describe('InvoiceModal — P4-3 line-aware invoicing (saleOrderProductId)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCreate.mockResolvedValue({ invoiceNumber: 'INV-0001' })
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
  })

  it('ทุกรายการมี id → ส่ง saleOrderProductId ให้ทุกบรรทัด', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectedItems = [1]
    await wrapper.vm.generateInvoice()

    const items = mockFetchCreate.mock.calls[0][0].formValue.items
    expect(items).toHaveLength(1)
    expect(items[0].saleOrderProductId).toBe(1)
  })

  it('มีบางรายการไม่มี id → ไม่ส่ง saleOrderProductId ให้ทุกบรรทัด (fallback stockNumber-only) + console.warn', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mixedStockItems = [
      { id: 1, isConfirm: true, invoice: false, stockNumber: 'S1', qty: 1, appraisalPrice: 100, discountPercent: 0 },
      { id: null, isConfirm: true, invoice: false, stockNumber: 'S2', qty: 1, appraisalPrice: 100, discountPercent: 0 }
    ]
    const pinia = createPinia()
    const wrapper = shallowMount(InvoiceModal, {
      global: { plugins: [pinia], mocks: { $t: (key) => key } },
      props: { isShowModal: true, saleOrderData: sampleSaleOrder, stockItems: mixedStockItems }
    })
    await flushPromises()

    wrapper.vm.selectedItems = mixedStockItems.map((i) => i.id)
    await wrapper.vm.generateInvoice()

    const items = mockFetchCreate.mock.calls[0][0].formValue.items
    expect(items).toHaveLength(2)
    items.forEach((item) => expect(item.saleOrderProductId).toBeUndefined())
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})

describe('InvoiceModal — sale channel lock (จุดขายต้องตรงกับใบสั่งขาย)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
  })

  function mountWithSaleOrder(saleOrderData) {
    const pinia = createPinia()
    return shallowMount(InvoiceModal, {
      global: {
        plugins: [pinia],
        mocks: {
          $t: (key) => key
        }
      },
      props: {
        isShowModal: true,
        saleOrderData,
        stockItems: sampleStockItems
      }
    })
  }

  it('locked: SO มี saleChannelCode แล้ว → dropdown ล็อกไปที่ค่านั้น ไม่เรียก fetchCurrent', async () => {
    const wrapper = mountWithSaleOrder({
      ...sampleSaleOrder,
      saleChannelCode: 'FAIR74',
      saleChannelName: 'งานแฟร์ 74'
    })
    await flushPromises()

    expect(wrapper.vm.isSaleChannelLocked).toBe(true)
    expect(wrapper.vm.saleChannelCode).toBe('FAIR74')
    expect(mockFetchCurrent).not.toHaveBeenCalled()
  })

  it('locked แต่รหัสจุดขายไม่อยู่ใน active list → เติม option ด้วยชื่อจาก saleChannelName', async () => {
    mockFetchActiveList.mockResolvedValue([{ code: 'SHOP01', nameTh: 'หน้าร้าน' }])
    const wrapper = mountWithSaleOrder({
      ...sampleSaleOrder,
      saleChannelCode: 'FAIR74',
      saleChannelName: 'งานแฟร์ 74'
    })
    await flushPromises()

    const option = wrapper.vm.saleChannelOptions.find((o) => o.code === 'FAIR74')
    expect(option).toBeTruthy()
    expect(option.name).toBe('งานแฟร์ 74')
  })

  it('unlocked: SO ยังไม่มี saleChannelCode → คงพฤติกรรม pre-select ด้วย fetchCurrent เดิม', async () => {
    mockFetchCurrent.mockResolvedValue({ code: 'SHOP01' })
    const wrapper = mountWithSaleOrder({ ...sampleSaleOrder })
    await flushPromises()

    expect(wrapper.vm.isSaleChannelLocked).toBe(false)
    expect(mockFetchCurrent).toHaveBeenCalled()
    expect(wrapper.vm.saleChannelCode).toBe('SHOP01')
  })
})
