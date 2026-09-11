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
