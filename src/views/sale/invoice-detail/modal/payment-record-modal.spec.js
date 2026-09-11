import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PaymentRecordModal from './payment-record-modal.vue'

vi.mock('@/services/alert/sweetAlerts.js', () => {
  const warning = vi.fn()
  const success = vi.fn()
  const swAlert = { warning, success }
  return { default: swAlert, warning, success }
})

const mockFetchBankList = vi.fn().mockResolvedValue([{ code: 'KBANK', nameTh: 'กสิกรไทย' }])
vi.mock('@/stores/modules/api/master/master-bank-store.js', () => ({
  useMasterBankStore: vi.fn(() => ({ fetchBankList: mockFetchBankList }))
}))

vi.mock('@/components/modal/modal-view.vue', () => ({
  default: {
    name: 'ModalView',
    template: '<div><slot name="content" /></div>',
    props: ['showModal', 'width'],
    emits: ['closeModal']
  }
}))

function createWrapper(tMock) {
  const pinia = createPinia()
  return shallowMount(PaymentRecordModal, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: tMock || ((key, params) => (params ? `${key}:${JSON.stringify(params)}` : key))
      }
    },
    props: {
      isShowModal: true,
      invoiceData: { invoiceNumber: 'INV-0001', grandTotal: 1000, currencyUnit: 'THB' },
      paidAmount: 0
    }
  })
}

describe('PaymentRecordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchBankList.mockResolvedValue([{ code: 'KBANK', nameTh: 'กสิกรไทย' }])
  })

  it('รหัส 5 (เครดิต) ต้องไม่อยู่ใน paymentMethods และรหัส 3 (เช็ค) ต้องอยู่ (recordableAsReceipt filter)', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    const ids = wrapper.vm.paymentMethods.map((m) => m.id)
    expect(ids).not.toContain(5)
    expect(ids).toContain(3)
  })

  describe('paymentName integrity (ป้องกันบั๊กภาษารั่วลง DB)', () => {
    const runWith = async (tMock) => {
      const wrapper = createWrapper(tMock)
      await flushPromises()

      wrapper.vm.paymentData.amount = 500
      wrapper.vm.paymentData.paymentMethod = 'cash'
      await wrapper.vm.$nextTick()

      await wrapper.vm.onSavePayment()

      return wrapper.emitted('save-payment')[0][0].paymentName
    }

    it('paymentName เท่ากันทั้ง TH mock และ EN mock และเท่ากับ apiName', async () => {
      const thResult = await runWith((key) => `TH:${key}`)
      const enResult = await runWith((key) => `EN:${key}`)

      expect(thResult).toBe('เงินสด (Cash)')
      expect(enResult).toBe('เงินสด (Cash)')
      expect(thResult).toBe(enResult)
      expect(thResult.startsWith('view.')).toBe(false)
    })
  })
})
