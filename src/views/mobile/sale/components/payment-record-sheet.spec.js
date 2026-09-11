import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PaymentRecordSheet from './payment-record-sheet.vue'

// Mock sweetAlerts — confirmSubmit เรียก cb ทันที (isConfirmed: true)
// หมายเหตุ: confirmThenSubmit (useConfirmSubmit.js) เป็น thin wrapper รอบ confirmSubmit ตรงๆ
// mock ที่ตัว confirmSubmit จึงครอบคลุมพฤติกรรมจริงของ confirmThenSubmit ไปด้วย (ไม่ต้อง mock ซ้ำ)
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

const mockFetchBankList = vi.fn().mockResolvedValue([{ code: 'KBANK', nameTh: 'กสิกรไทย' }])

vi.mock('@/stores/modules/api/master/master-bank-store.js', () => ({
  useMasterBankStore: vi.fn(() => ({
    fetchBankList: mockFetchBankList
  }))
}))

import { warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'

function createWrapper(propsOverride = {}, tMock) {
  const pinia = createPinia()
  return shallowMount(PaymentRecordSheet, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: tMock || ((key, params) => (params ? `${key}:${JSON.stringify(params)}` : key))
      },
      stubs: {
        FormFieldGeneric: true,
        InputTextGeneric: true,
        TextareaGeneric: true,
        ButtonGeneric: true,
        DropdownGeneric: true,
        CalendarGeneric: true,
        teleport: true
      }
    },
    props: {
      visible: true,
      invoiceNumber: 'INV-0001',
      outstandingAmount: 9800,
      currencyUnit: 'THB',
      ...propsOverride
    }
  })
}

describe('PaymentRecordSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchBankList.mockResolvedValue([{ code: 'KBANK', nameTh: 'กสิกรไทย' }])
  })

  it('a) เปิด sheet → จำนวนเงิน default = ยอดคงค้าง', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    expect(wrapper.vm.paymentData.amount).toBe('9800.00')
  })

  it('b) จำนวนเงิน <= 0 → warning warnAmountRequired ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '0'
    wrapper.vm.onPaymentMethodChange(1)
    wrapper.vm.onSave()

    expect(warning).toHaveBeenCalledWith('view.mobile.sale.invoicePaymentSheetWarnAmountRequired')
    expect(wrapper.emitted('save-payment')).toBeFalsy()
  })

  it('c) ไม่เลือกวิธีชำระ → warning warnMethodRequired ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '1000'
    wrapper.vm.onSave()

    expect(warning).toHaveBeenCalledWith('view.mobile.sale.invoicePaymentSheetWarnMethodRequired')
    expect(wrapper.emitted('save-payment')).toBeFalsy()
  })

  it('d) โอนเงิน (payment=2) ไม่มี BankCode → warning warnBankRequired ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '1000'
    wrapper.vm.onPaymentMethodChange(2)
    wrapper.vm.onSave()

    expect(warning).toHaveBeenCalledWith('view.mobile.sale.invoicePaymentSheetWarnBankRequired')
    expect(wrapper.emitted('save-payment')).toBeFalsy()
  })

  it('e) เช็ค (payment=3) มี BankCode แต่ไม่มี BankBranch → warning warnBranchRequired ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '1000'
    wrapper.vm.onPaymentMethodChange(3)
    wrapper.vm.$.proxy.paymentData.bankCode = 'KBANK'
    wrapper.vm.onSave()

    expect(warning).toHaveBeenCalledWith('view.mobile.sale.invoicePaymentSheetWarnBranchRequired')
    expect(wrapper.emitted('save-payment')).toBeFalsy()
  })

  it('f) เงินสด (payment=1) ถูกต้องครบ → emit save-payment พร้อม payload ที่ถูกต้อง', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '5000'
    wrapper.vm.onPaymentMethodChange(1)
    wrapper.vm.onSave()

    expect(warning).not.toHaveBeenCalled()
    expect(wrapper.emitted('save-payment')).toBeTruthy()

    const payload = wrapper.emitted('save-payment')[0][0]
    expect(payload.invoiceNumber).toBe('INV-0001')
    expect(payload.amount).toBe(5000)
    expect(payload.payment).toBe(1)
    // paymentName ต้องเป็น apiName (getPaymentApiName) ไม่ใช่ i18n key — เดิม assert ผิดเป็นหลักฐานของบั๊กภาษารั่วลง DB
    expect(payload.paymentName).toBe('เงินสด (Cash)')
    expect(payload.bankCode).toBe(null)
    expect(payload.bankBranch).toBe(null)
    expect(payload.referenceNumber).toBe(null)
    expect(payload.remark).toBe(null)
    expect(payload.receiptImage).toBe(null)
    expect(payload.paymentDate instanceof Date).toBe(true)
  })

  it('g) โอนเงินมีธนาคารครบ → emit save-payment พร้อม bankCode', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '5000'
    wrapper.vm.onPaymentMethodChange(2)
    wrapper.vm.$.proxy.paymentData.bankCode = 'KBANK'
    wrapper.vm.onSave()

    expect(wrapper.emitted('save-payment')).toBeTruthy()
    const payload = wrapper.emitted('save-payment')[0][0]
    expect(payload.bankCode).toBe('KBANK')
    // paymentName ต้องเป็น apiName (getPaymentApiName) ไม่ใช่ i18n key — เดิม assert ผิดเป็นหลักฐานของบั๊กภาษารั่วลง DB
    expect(payload.paymentName).toBe('โอนเงิน (Transfer)')
  })

  it('g1) เลือกโอน+ธนาคารแล้วเปลี่ยนเป็นเงินสด → bankCode ต้องถูกล้างเป็น null', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '5000'
    wrapper.vm.onPaymentMethodChange(2)
    wrapper.vm.$.proxy.paymentData.bankCode = 'KBANK'

    // เปลี่ยนใจเป็นเงินสด — bankCode ของวิธีเก่าต้องไม่ติดไปด้วย
    wrapper.vm.onPaymentMethodChange(1)
    wrapper.vm.onSave()

    expect(wrapper.vm.paymentData.bankCode).toBe(null)
    expect(wrapper.emitted('save-payment')).toBeTruthy()
    const payload = wrapper.emitted('save-payment')[0][0]
    expect(payload.payment).toBe(1)
    expect(payload.bankCode).toBe(null)
  })

  it('g2) เลือกเช็ค+ธนาคาร+สาขาแล้วเปลี่ยนเป็นโอน → bankBranch ต้องว่าง แต่ bankCode ต้องยังอยู่', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '5000'
    wrapper.vm.onPaymentMethodChange(3)
    wrapper.vm.$.proxy.paymentData.bankCode = 'KBANK'
    wrapper.vm.$.proxy.paymentData.bankBranch = 'สาขาสีลม'

    // เปลี่ยนเป็นโอน — สาขาใช้ได้เฉพาะเช็คเท่านั้นต้องถูกล้าง แต่ธนาคารวิธีโอนยังต้องใช้อยู่
    wrapper.vm.onPaymentMethodChange(2)
    wrapper.vm.onSave()

    expect(wrapper.vm.paymentData.bankBranch).toBe('')
    expect(wrapper.vm.paymentData.bankCode).toBe('KBANK')
    expect(wrapper.emitted('save-payment')).toBeTruthy()
    const payload = wrapper.emitted('save-payment')[0][0]
    expect(payload.payment).toBe(2)
    expect(payload.bankCode).toBe('KBANK')
    expect(payload.bankBranch).toBe(null)
  })

  it('h) จำนวนเงินเกินยอดคงค้าง → confirmThenSubmit ถูกเรียกด้วย title confirmOverpay แล้ว emit save-payment', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '20000'
    wrapper.vm.onPaymentMethodChange(1)
    wrapper.vm.onSave()

    expect(confirmSubmit).toHaveBeenCalledTimes(1)
    expect(confirmSubmit.mock.calls[0][1]).toBe('view.mobile.sale.invoicePaymentSheetConfirmOverpayTitle')
    expect(wrapper.emitted('save-payment')).toBeTruthy()
    expect(wrapper.emitted('save-payment')[0][0].amount).toBe(20000)
  })

  it('i) จำนวนเงินไม่เกินยอดคงค้าง → ไม่เรียก confirmThenSubmit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.$.proxy.paymentData.amount = '5000'
    wrapper.vm.onPaymentMethodChange(1)
    wrapper.vm.onSave()

    expect(confirmSubmit).not.toHaveBeenCalled()
    expect(wrapper.emitted('save-payment')).toBeTruthy()
  })

  it('j) ปิดแล้วเปิดใหม่ (visible false → true) → ฟอร์มถูก reset', async () => {
    const wrapper = createWrapper({ visible: false })
    await flushPromises()

    await wrapper.setProps({ visible: true })
    await flushPromises()

    expect(wrapper.vm.paymentData.amount).toBe('9800.00')
    expect(wrapper.vm.paymentData.payment).toBe(null)
    expect(wrapper.vm.paymentData.bankCode).toBe(null)
  })

  it('k) onClose → emit close', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.onClose()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('l) รหัส 5 (เครดิต) ต้องไม่อยู่ใน paymentMethodOptions และรหัส 3 (เช็ค) ต้องอยู่ (recordableAsReceipt filter)', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    const codes = wrapper.vm.paymentMethodOptions.map((m) => m.code)
    expect(codes).not.toContain(5)
    expect(codes).toContain(3)
  })

  describe('m) paymentName integrity — ต้องเท่ากับ apiName เสมอ ไม่ว่าภาษา UI จะเป็นอะไร', () => {
    const runWith = (tMock) => {
      const wrapper = createWrapper({}, tMock)
      wrapper.vm.$.proxy.paymentData.amount = '5000'
      wrapper.vm.onPaymentMethodChange(1)
      wrapper.vm.onSave()
      return wrapper.emitted('save-payment')[0][0].paymentName
    }

    it('paymentName เท่ากันทั้ง TH mock และ EN mock และเท่ากับ apiName', () => {
      const thResult = runWith((key) => `TH:${key}`)
      const enResult = runWith((key) => `EN:${key}`)

      expect(thResult).toBe('เงินสด (Cash)')
      expect(enResult).toBe('เงินสด (Cash)')
      expect(thResult).toBe(enResult)
      expect(thResult.startsWith('view.')).toBe(false)
    })
  })
})
