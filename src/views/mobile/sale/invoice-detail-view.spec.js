import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import MobileInvoiceDetailView from './invoice-detail-view.vue'

// Mock sweetAlerts — confirmSubmit เรียก cb ทันที (isConfirmed: true)
vi.mock('@/services/alert/sweetAlerts.js', () => {
  const confirmSubmit = vi.fn((msg, title, cb) => cb({ isConfirmed: true }))
  const warning = vi.fn()
  const success = vi.fn()
  const error = vi.fn()
  const info = vi.fn()
  const swAlert = { confirmSubmit, warning, success, error, info }
  return {
    default: swAlert,
    confirmSubmit,
    warning,
    success,
    error,
    info
  }
})

const mockCreatePayment = vi.fn()
const mockDeletePayment = vi.fn()
const mockFetchCancelWithSaleOrder = vi.fn()

vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: vi.fn(() => ({
    createPayment: mockCreatePayment,
    deletePayment: mockDeletePayment,
    fetchCancelWithSaleOrder: mockFetchCancelWithSaleOrder,
    fetchGet: vi.fn()
  }))
}))

vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({
    fetchGet: vi.fn()
  }))
}))

vi.mock('@/stores/modules/authen/authen-store.js', () => ({
  useAuthStore: vi.fn(() => ({
    getUser: { firstName: 'Test', lastName: 'User', username: 'testuser' }
  }))
}))

const mockLoadInvoiceContext = vi.fn()

vi.mock('@/services/helper/invoice/build-invoice-pdf-data.js', () => ({
  loadInvoiceContext: (...args) => mockLoadInvoiceContext(...args),
  toInvoicePdfData: vi.fn()
}))

import { success } from '@/services/alert/sweetAlerts.js'

function baseInvoiceData(overrides = {}) {
  return {
    invoiceNumber: 'INV-0001',
    soNumber: 'SO-0001',
    grandTotalRounded: 10000,
    deposit: 0,
    payments: [],
    currencyUnit: 'THB',
    ...overrides
  }
}

function createWrapper({ invoiceData = baseInvoiceData(), invoiceItems = [] } = {}) {
  mockLoadInvoiceContext.mockResolvedValue({ invoiceData, invoiceItems })

  const pinia = createPinia()
  return shallowMount(MobileInvoiceDetailView, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { params: { invoiceNumber: 'INV-0001' } },
        $router: { push: vi.fn(), back: vi.fn() }
      },
      stubs: {
        SoItemCard: true,
        PaymentRecordSheet: true,
        InputTextGeneric: true,
        CheckboxGeneric: true,
        ReceiptPrintAction: true
      }
    }
  })
}

describe('MobileInvoiceDetailView — Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleSavePayment (FormData ต้องมี key ครบและชื่อถูกตาม backend contract)', () => {
    it('a) field บังคับครบ + field optional ไม่ส่งเมื่อว่าง', async () => {
      mockCreatePayment.mockResolvedValue({ success: true })
      const wrapper = createWrapper()
      await flushPromises()

      const paymentDate = new Date('2026-09-09T00:00:00.000Z')
      await wrapper.vm.handleSavePayment({
        invoiceNumber: 'INV-0001',
        paymentDate,
        amount: 5000,
        payment: 1,
        paymentName: 'เงินสด',
        bankCode: null,
        bankBranch: null,
        referenceNumber: null,
        remark: null,
        receiptImage: null
      })
      await flushPromises()

      expect(mockCreatePayment).toHaveBeenCalledTimes(1)
      const formData = mockCreatePayment.mock.calls[0][0]
      expect(formData instanceof FormData).toBe(true)
      expect(formData.get('InvoiceNumber')).toBe('INV-0001')
      expect(formData.get('PaymentDate')).toBe(paymentDate.toISOString())
      expect(formData.get('Amount')).toBe('5000')
      expect(formData.get('Payment')).toBe('1')
      expect(formData.get('PaymentName')).toBe('เงินสด')
      expect(formData.get('BankCode')).toBe(null)
      expect(formData.get('BankBranch')).toBe(null)
      expect(formData.get('ReferenceNumber')).toBe(null)
      expect(formData.get('Remark')).toBe(null)
      expect(formData.get('ReceiptImage')).toBe(null)
    })

    it('b) field optional ครบ (โอนเงิน + รูปสลิป) → FormData มีครบทุก key', async () => {
      mockCreatePayment.mockResolvedValue({ success: true })
      const wrapper = createWrapper()
      await flushPromises()

      const receiptFile = new File(['x'], 'slip.jpg', { type: 'image/jpeg' })
      const paymentDate = new Date('2026-09-09T00:00:00.000Z')
      await wrapper.vm.handleSavePayment({
        invoiceNumber: 'INV-0001',
        paymentDate,
        amount: 3000,
        payment: 2,
        paymentName: 'โอนเงิน',
        bankCode: 'KBANK',
        bankBranch: null,
        referenceNumber: 'REF123',
        remark: 'จ่ายงวดที่ 2',
        receiptImage: receiptFile
      })
      await flushPromises()

      const formData = mockCreatePayment.mock.calls[0][0]
      expect(formData.get('BankCode')).toBe('KBANK')
      expect(formData.get('ReferenceNumber')).toBe('REF123')
      expect(formData.get('Remark')).toBe('จ่ายงวดที่ 2')
      expect(formData.get('ReceiptImage')).toBe(receiptFile)
    })

    it('c) สำเร็จ → success alert + reload ข้อมูล + ปิด sheet', async () => {
      mockCreatePayment.mockResolvedValue({ success: true })
      const wrapper = createWrapper()
      await flushPromises()
      wrapper.vm.showPaymentSheet = true

      mockLoadInvoiceContext.mockClear()

      await wrapper.vm.handleSavePayment({
        invoiceNumber: 'INV-0001',
        paymentDate: new Date(),
        amount: 5000,
        payment: 1,
        paymentName: 'เงินสด',
        bankCode: null,
        bankBranch: null,
        referenceNumber: null,
        remark: null,
        receiptImage: null
      })
      await flushPromises()

      expect(success).toHaveBeenCalledWith('view.mobile.sale.invoicePaymentSuccessMsg')
      expect(mockLoadInvoiceContext).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.showPaymentSheet).toBe(false)
    })

    it('d) backend ตอบ falsy (axios-helper ดัก error แล้ว) → ไม่ success/reload แต่ยังปิด sheet', async () => {
      mockCreatePayment.mockResolvedValue(null)
      const wrapper = createWrapper()
      await flushPromises()
      wrapper.vm.showPaymentSheet = true

      mockLoadInvoiceContext.mockClear()

      await wrapper.vm.handleSavePayment({
        invoiceNumber: 'INV-0001',
        paymentDate: new Date(),
        amount: 5000,
        payment: 1,
        paymentName: 'เงินสด',
        bankCode: null,
        bankBranch: null,
        referenceNumber: null,
        remark: null,
        receiptImage: null
      })
      await flushPromises()

      expect(success).not.toHaveBeenCalled()
      expect(mockLoadInvoiceContext).not.toHaveBeenCalled()
      expect(wrapper.vm.showPaymentSheet).toBe(false)
    })
  })

  describe('confirmDeletePayment / deletePayment', () => {
    it('e) ลบสำเร็จ → เรียก deletePayment ด้วย paymentRunning + reload + success', async () => {
      mockDeletePayment.mockResolvedValue({ success: true })
      const wrapper = createWrapper({
        invoiceData: baseInvoiceData({ payments: [{ running: 99, amount: 1000, paymentDate: '2026-09-01' }] })
      })
      await flushPromises()

      mockLoadInvoiceContext.mockClear()

      wrapper.vm.confirmDeletePayment({ running: 99, amount: 1000, paymentDate: '2026-09-01' })
      await flushPromises()

      expect(mockDeletePayment).toHaveBeenCalledWith({ formValue: { paymentRunning: 99 } })
      expect(success).toHaveBeenCalledWith('view.mobile.sale.invoiceDeletePaymentSuccessMsg')
      expect(mockLoadInvoiceContext).toHaveBeenCalledTimes(1)
    })

    it('f) payment ไม่มี running → ไม่เรียก API', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.deletePayment({ amount: 1000 })

      expect(mockDeletePayment).not.toHaveBeenCalled()
    })
  })

  describe('showRecordPaymentBtn', () => {
    it('g) ยังค้างชำระ (partial) → แสดงปุ่มบันทึกรับเงิน', async () => {
      const wrapper = createWrapper({
        invoiceData: baseInvoiceData({ grandTotalRounded: 10000, deposit: 0, payments: [{ amount: 3000 }] })
      })
      await flushPromises()

      expect(wrapper.vm.paymentStatus).toBe('partial')
      expect(wrapper.vm.showRecordPaymentBtn).toBe(true)
    })

    it('h) จ่ายครบแล้ว (paid) → ไม่แสดงปุ่มบันทึกรับเงิน', async () => {
      const wrapper = createWrapper({
        invoiceData: baseInvoiceData({ grandTotalRounded: 10000, deposit: 0, payments: [{ amount: 10000 }] })
      })
      await flushPromises()

      expect(wrapper.vm.paymentStatus).toBe('paid')
      expect(wrapper.vm.showRecordPaymentBtn).toBe(false)
    })
  })
})
