import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ConfirmAndInvoiceModal from './confirm-and-invoice-modal.vue'

vi.mock('@/services/alert/sweetAlerts.js', () => {
  const warning = vi.fn()
  const error = vi.fn()
  const success = vi.fn()
  const swAlert = { warning, error, success }
  return { default: swAlert, warning, error, success }
})

const mockFetchCreate = vi.fn().mockResolvedValue({ invoiceNumber: 'INV-0001' })
vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: vi.fn(() => ({ fetchCreate: mockFetchCreate }))
}))

const mockConfirmStockItems = vi.fn().mockResolvedValue({ success: true })
const mockFetchGet = vi.fn().mockResolvedValue({ stockConfirm: [] })
vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({ confirmStockItems: mockConfirmStockItems, fetchGet: mockFetchGet }))
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
  {
    id: 1,
    isConfirm: true,
    isRemainProduct: true,
    invoice: false,
    stockNumber: 'S1',
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
]

function createWrapper(tMock) {
  const pinia = createPinia()
  return shallowMount(ConfirmAndInvoiceModal, {
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

describe('ConfirmAndInvoiceModal — paymentName integrity (ป้องกันบั๊กภาษารั่วลง DB)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCreate.mockResolvedValue({ invoiceNumber: 'INV-0001' })
    mockConfirmStockItems.mockResolvedValue({ success: true })
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
  })

  const runWith = async (tMock) => {
    const wrapper = createWrapper(tMock)
    await flushPromises()

    wrapper.vm.selectedItems = [1]
    await wrapper.vm.confirmAndCreateInvoice()

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

  it('paymentMethodOptions ใช้ label จาก saleOrderList.paymentMethod (ไม่ใช่ invoiceDetail.paymentMethods)', () => {
    const wrapper = createWrapper((key) => key)

    const creditOption = wrapper.vm.paymentMethodOptions.find((o) => o.id === 5)
    expect(creditOption.name).toBe('view.sale.saleOrderList.paymentMethod.creditTerm')
  })
})

describe('ConfirmAndInvoiceModal — P4-3 line-aware invoicing (saleOrderProductId)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCreate.mockResolvedValue({ invoiceNumber: 'INV-0001' })
    mockConfirmStockItems.mockResolvedValue({ success: true })
    mockFetchGet.mockResolvedValue({ stockConfirm: [] })
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
  })

  it('รายการที่ confirm อยู่แล้ว (มี id ครบ) → ส่ง saleOrderProductId ให้ทุกบรรทัด ไม่ต้อง reload SO', async () => {
    const confirmedItem = {
      id: 1,
      lineKey: 'lk-confirmed',
      isConfirm: true,
      isRemainProduct: true,
      invoice: false,
      stockNumber: 'S1',
      qty: 1,
      appraisalPrice: 100,
      discountPercent: 0
    }
    const pinia = createPinia()
    const wrapper = shallowMount(ConfirmAndInvoiceModal, {
      global: { plugins: [pinia], mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key) } },
      props: { isShowModal: true, saleOrderData: sampleSaleOrder, stockItems: [confirmedItem] }
    })
    await flushPromises()

    wrapper.vm.selectedItems = ['lk-confirmed']
    await wrapper.vm.confirmAndCreateInvoice()

    const items = mockFetchCreate.mock.calls[0][0].formValue.items
    expect(items[0].saleOrderProductId).toBe(1)
    expect(mockFetchGet).not.toHaveBeenCalled()
  })

  it('รายการที่ยังไม่ confirm → confirm ก่อน แล้ว reload SO เพื่อดึง id มาส่ง saleOrderProductId', async () => {
    const unconfirmedItem = {
      id: null,
      lineKey: 'lk-1',
      isConfirm: false,
      isRemainProduct: true,
      invoice: false,
      stockNumber: 'S2',
      qty: 1,
      appraisalPrice: 100,
      discountPercent: 0
    }
    mockFetchGet.mockResolvedValue({ stockConfirm: [{ id: 99, lineKey: 'lk-1', stockNumber: 'S2' }] })

    const pinia = createPinia()
    const wrapper = shallowMount(ConfirmAndInvoiceModal, {
      global: { plugins: [pinia], mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key) } },
      props: { isShowModal: true, saleOrderData: sampleSaleOrder, stockItems: [unconfirmedItem] }
    })
    await flushPromises()

    wrapper.vm.selectedItems = ['lk-1']
    await wrapper.vm.confirmAndCreateInvoice()

    expect(mockConfirmStockItems).toHaveBeenCalledTimes(1)
    expect(mockFetchGet).toHaveBeenCalledTimes(1)

    const items = mockFetchCreate.mock.calls[0][0].formValue.items
    expect(items[0].saleOrderProductId).toBe(99)
  })

  it('reload SO แล้วยังหา id ไม่เจอ (บาง lineKey ไม่ match) → ไม่ส่ง saleOrderProductId ให้ทุกบรรทัด + console.warn', async () => {
    const unconfirmedItem = {
      id: null,
      lineKey: 'lk-2',
      isConfirm: false,
      isRemainProduct: true,
      invoice: false,
      stockNumber: 'S3',
      qty: 1,
      appraisalPrice: 100,
      discountPercent: 0
    }
    mockFetchGet.mockResolvedValue({ stockConfirm: [] })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const pinia = createPinia()
    const wrapper = shallowMount(ConfirmAndInvoiceModal, {
      global: { plugins: [pinia], mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key) } },
      props: { isShowModal: true, saleOrderData: sampleSaleOrder, stockItems: [unconfirmedItem] }
    })
    await flushPromises()

    wrapper.vm.selectedItems = ['lk-2']
    await wrapper.vm.confirmAndCreateInvoice()

    const items = mockFetchCreate.mock.calls[0][0].formValue.items
    items.forEach((item) => expect(item.saleOrderProductId).toBeUndefined())
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})

describe('ConfirmAndInvoiceModal — sale channel lock (จุดขายต้องตรงกับใบสั่งขาย)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchActiveList.mockResolvedValue([])
    mockFetchCurrent.mockResolvedValue(null)
  })

  function mountWithSaleOrder(saleOrderData) {
    const pinia = createPinia()
    return shallowMount(ConfirmAndInvoiceModal, {
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
