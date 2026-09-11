import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PosCheckoutSheet from './pos-checkout-sheet.vue'

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
  return shallowMount(PosCheckoutSheet, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: tMock || ((key, params) => (params ? `${key}:${JSON.stringify(params)}` : key))
      },
      stubs: {
        InputTextGeneric: true,
        ButtonGeneric: true,
        DropdownGeneric: true,
        teleport: true
      }
    },
    props: {
      visible: true,
      totalToCollect: 9800,
      currencyUnit: 'THB',
      ...propsOverride
    }
  })
}

describe('PosCheckoutSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchBankList.mockResolvedValue([{ code: 'KBANK', nameTh: 'กสิกรไทย' }])
  })

  it('a) เงินสด: ทอนครบยอด → auto-commit + emit confirm 1 รายการ ไม่มี dialog ค้างชำระ', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.entry.tenderedCash = '10000'
    wrapper.vm.onConfirm()

    expect(wrapper.vm.payments.length).toBe(1)
    expect(wrapper.vm.payments[0].amount).toBe(9800)
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')[0][0][0].amount).toBe(9800)
  })

  it('b) เลือกวิธีแต่ไม่ใส่ยอด → warning warnPaymentAmountRequired ไม่ push ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.onConfirm()

    expect(warning).toHaveBeenCalledWith('view.mobile.pos.warnPaymentAmountRequired')
    expect(wrapper.vm.payments.length).toBe(0)
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('c) โอนเงินไม่เลือกธนาคาร → warning warnBankRequired ไม่ push ไม่ emit', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('transfer')
    wrapper.vm.onConfirm()

    expect(warning).toHaveBeenCalledWith('view.mobile.pos.warnBankRequired')
    expect(wrapper.vm.payments.length).toBe(0)
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('d) โอนเงินเลือกธนาคาร → payment มี bankName ที่ resolve จาก bankList + emit confirm', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('transfer')
    wrapper.vm.entry.bankCode = 'KBANK'
    wrapper.vm.onConfirm()

    expect(wrapper.vm.payments[0].bankName).toBe('กสิกรไทย')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('e) ไม่มีรายการเลย → confirmThenSubmit ถูกเรียกด้วย title confirmNoPaymentTitle แล้ว emit confirm ด้วย []', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.onConfirm()

    expect(confirmSubmit).toHaveBeenCalledTimes(1)
    expect(confirmSubmit.mock.calls[0][1]).toBe('view.mobile.pos.confirmNoPaymentTitle')
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')[0][0]).toEqual([])
  })

  it('f) แบ่งจ่าย: เงินสดบางส่วน + บัตรเครดิตส่วนที่เหลือ → payments 2 รายการ', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.entry.tenderedCash = '5000'
    wrapper.vm.addPayment()

    expect(wrapper.vm.payments.length).toBe(1)
    expect(wrapper.vm.remaining).toBe(4800)

    wrapper.vm.selectMethod('creditCard')
    expect(wrapper.vm.entry.amount).toBe('4800.00')

    wrapper.vm.onConfirm()

    expect(wrapper.vm.payments.length).toBe(2)
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')[0][0].length).toBe(2)
  })

  it('g) toggle: เลือกวิธีเดิมซ้ำ → ยกเลิกการเลือก (selectedMethod เป็น null)', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.selectMethod('cash')

    expect(wrapper.vm.selectedMethod).toBe(null)
  })

  it('h) confirmLabel เปลี่ยนตาม draft/payments', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    expect(wrapper.vm.confirmLabel).toBe('view.mobile.pos.confirmPaymentBtn')

    wrapper.vm.selectMethod('cash')
    wrapper.vm.entry.tenderedCash = '9800'

    expect(wrapper.vm.confirmLabel).toContain('confirmPaymentBtnWithAmount')
  })

  // พฤติกรรมตั้งใจ: ผู้ใช้เลือกวิธีชำระค้างไว้โดยไม่ใส่ยอด (แม้ยอดรวมจ่ายครบแล้วจาก payment อื่น)
  // → hasDraftEntry เป็น false เพราะ draftAmount ว่าง onConfirm() จึงเตือนแทนที่จะปล่อยผ่านเงียบๆ
  it('i) draft ค้างตอนจ่ายครบแล้ว → ยัง warning warnPaymentAmountRequired ตามพฤติกรรมจริงของโค้ด', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.entry.tenderedCash = '9800'
    wrapper.vm.addPayment()

    expect(wrapper.vm.remaining).toBe(0)

    wrapper.vm.selectMethod('creditCard')
    expect(wrapper.vm.entry.amount).toBe('')

    wrapper.vm.onConfirm()

    expect(warning).toHaveBeenCalledWith('view.mobile.pos.warnPaymentAmountRequired')
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('j) เลือกเครดิต + กรอกวัน + ยืนยัน → ไม่มี entry ที่ payment===5 ใน payments[] และ creditDay ถูกส่งเป็น arg ที่ 2', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('credit')
    wrapper.vm.entry.paymentDay = '30'
    wrapper.vm.onConfirm()

    expect(confirmSubmit).toHaveBeenCalledTimes(1)
    expect(confirmSubmit.mock.calls[0][1]).toBe('view.mobile.pos.confirmNoPaymentTitle')
    expect(wrapper.emitted('confirm')).toBeTruthy()

    const [payments, creditDay] = wrapper.emitted('confirm')[0]
    expect(payments).toEqual([])
    expect(payments.some((p) => p.payment === 5)).toBe(false)
    expect(payments.some((p) => p.payment === 5 && p.amount > 0)).toBe(false)
    expect(creditDay).toBe(30)
  })

  it('k) เครดิตไม่กรอกวัน + ยืนยัน → creditDay เป็น null ไม่ error', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('credit')
    wrapper.vm.onConfirm()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    const [payments, creditDay] = wrapper.emitted('confirm')[0]
    expect(payments).toEqual([])
    expect(creditDay).toBe(null)
  })

  it('l) เครดิตบางส่วน + เงินสดบางส่วน → payments มีแค่เงินสด ไม่มีรหัส 5 เลย', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.selectMethod('cash')
    wrapper.vm.entry.tenderedCash = '5000'
    wrapper.vm.addPayment()

    expect(wrapper.vm.payments.length).toBe(1)
    expect(wrapper.vm.remaining).toBe(4800)

    wrapper.vm.selectMethod('credit')
    wrapper.vm.entry.paymentDay = '15'
    wrapper.vm.onConfirm()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    const [payments, creditDay] = wrapper.emitted('confirm')[0]
    expect(payments.length).toBe(1)
    expect(payments.every((p) => p.payment !== 5)).toBe(true)
    expect(creditDay).toBe(15)
  })

  describe('m) paymentName integrity — ต้องเท่ากับ apiName เสมอ ไม่ว่าภาษา UI จะเป็นอะไร', () => {
    const runWith = (tMock) => {
      const wrapper = createWrapper({}, tMock)
      wrapper.vm.selectMethod('cash')
      wrapper.vm.entry.tenderedCash = '9800'
      wrapper.vm.onConfirm()
      return wrapper.emitted('confirm')[0][0][0].paymentName
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
