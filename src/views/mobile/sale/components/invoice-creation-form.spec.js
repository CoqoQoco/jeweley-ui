import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import InvoiceCreationForm from './invoice-creation-form.vue'

vi.mock('@/services/alert/sweetAlerts.js', () => {
  const confirmSubmit = vi.fn((msg, title, cb) => cb({ isConfirmed: true }))
  const warning = vi.fn()
  const success = vi.fn()
  const error = vi.fn()
  const swAlert = { confirmSubmit, warning, success, error }
  return { default: swAlert, confirmSubmit, warning, success, error }
})

const mockConfirmStockItems = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({ confirmStockItems: mockConfirmStockItems }))
}))

const mockFetchCreate = vi.fn().mockResolvedValue({ invoiceNumber: 'INV-0001' })
vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: vi.fn(() => ({ fetchCreate: mockFetchCreate }))
}))

const sampleSoData = { soNumber: 'SO-0001', customerName: 'Test Customer', currencyUnit: 'THB', currencyRate: 1 }
const sampleStockItems = [
  { stockNumber: 'S1', isConfirm: true, isInvoice: false, qty: 1, appraisalPrice: 100, discountPercent: 0 }
]

function createWrapper(tMock) {
  const pinia = createPinia()
  return shallowMount(InvoiceCreationForm, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: tMock || ((key, params) => (params ? `${key}:${JSON.stringify(params)}` : key))
      },
      stubs: {
        InputTextGeneric: true
      }
    },
    props: {
      soData: sampleSoData,
      stockItems: sampleStockItems
    }
  })
}

describe('InvoiceCreationForm — paymentName integrity (ป้องกันบั๊กภาษารั่วลง DB)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirmStockItems.mockResolvedValue({ success: true })
    mockFetchCreate.mockResolvedValue({ invoiceNumber: 'INV-0001' })
  })

  const runWith = async (tMock) => {
    const wrapper = createWrapper(tMock)
    await flushPromises()

    await wrapper.vm.createInvoice()

    return mockFetchCreate.mock.calls[0][0].formValue.paymentName
  }

  it('paymentName (default cash) เท่ากันทั้ง TH mock และ EN mock และเท่ากับ apiName ไม่ hardcode ภาษาไทยอีก', async () => {
    const thResult = await runWith((key) => `TH:${key}`)
    const enResult = await runWith((key) => `EN:${key}`)

    expect(thResult).toBe('เงินสด (Cash)')
    expect(enResult).toBe('เงินสด (Cash)')
    expect(thResult).toBe(enResult)
    expect(thResult.startsWith('view.')).toBe(false)
  })

  it('paymentMethodOptions สร้างจาก $t เสมอ ไม่ hardcode array ภาษาไทยตรงๆ', () => {
    const wrapper = createWrapper((key) => `X:${key}`)

    expect(wrapper.vm.paymentMethodOptions).toHaveLength(5)
    expect(wrapper.vm.paymentMethodOptions[0].name).toBe('X:view.mobile.sale.invoicePaymentMethodCash')
  })
})
