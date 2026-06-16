import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import CustomerEditModal from './customer-edit-modal.vue'

// Mock sweetAlerts — default export object with named exports too
vi.mock('@/services/alert/sweetAlerts.js', () => {
  // confirmSubmit calls cb synchronously (await-safe via Promise.resolve)
  const confirmSubmit = vi.fn((msg, title, cb) => cb({ isConfirmed: true }))
  const success = vi.fn((msg, title, cb) => { if (cb) cb() })
  const warning = vi.fn()
  const error = vi.fn()
  const info = vi.fn()
  const swAlert = { confirmSubmit, success, warning, error, info }
  return {
    default: swAlert,
    confirmSubmit,
    success,
    warning,
    error,
    info
  }
})

const mockFetchUpdateCustomer = vi.fn().mockResolvedValue(true)

vi.mock('@/stores/modules/api/customer/customer-detail-store.js', () => ({
  useCustomerDetailApiStore: vi.fn(() => ({
    fetchUpdateCustomer: mockFetchUpdateCustomer
  }))
}))

vi.mock('@/components/modal/modal-view.vue', () => ({
  default: {
    name: 'ModalView',
    template: '<div><slot name="content" /></div>',
    props: ['showModal', 'width', 'clickToClose', 'fitHeight', 'isShowActionPart'],
    emits: ['closeModal']
  }
}))

const sampleCustomer = {
  code: 'CUST001',
  nameTh: 'บริษัท ทดสอบ จำกัด',
  nameEn: 'Test Company Ltd',
  address: '123 ถนนทดสอบ กรุงเทพฯ',
  telephone1: '02-123-4567',
  telephone2: '02-765-4321',
  email: 'test@example.com',
  contactName: 'คุณทดสอบ'
}

function createWrapper(propsOverride = {}) {
  const pinia = createPinia()
  const wrapper = shallowMount(CustomerEditModal, {
    global: {
      plugins: [pinia],
      stubs: {
        modal: {
          template: '<div><slot name="content" /></div>',
          props: ['showModal'],
          emits: ['closeModal']
        }
      }
    },
    props: {
      isShow: true,
      customerData: sampleCustomer,
      ...propsOverride
    }
  })
  // Call populateForm manually since watcher fires on change but not on initial mount
  wrapper.vm.populateForm()
  return wrapper
}

describe('CustomerEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchUpdateCustomer.mockResolvedValue(true)
  })

  describe('populateForm', () => {
    it('กำหนด form ครบทุก field จาก customerData', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const form = wrapper.vm.form
      expect(form.code).toBe('CUST001')
      expect(form.nameTh).toBe('บริษัท ทดสอบ จำกัด')
      expect(form.nameEn).toBe('Test Company Ltd')
      expect(form.address).toBe('123 ถนนทดสอบ กรุงเทพฯ')
      expect(form.telephone1).toBe('02-123-4567')
      expect(form.telephone2).toBe('02-765-4321')
      expect(form.email).toBe('test@example.com')
      expect(form.contactName).toBe('คุณทดสอบ')
    })

    it('เรียก populateForm อีกครั้งเมื่อ isShow เปลี่ยนเป็น true', async () => {
      const pinia = createPinia()
      const wrapper = shallowMount(CustomerEditModal, {
        global: {
          plugins: [pinia],
          stubs: {
            modal: {
              template: '<div><slot name="content" /></div>',
              props: ['showModal'],
              emits: ['closeModal']
            }
          }
        },
        props: { isShow: false, customerData: sampleCustomer }
      })
      await wrapper.setProps({ isShow: true })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.form.code).toBe('CUST001')
    })
  })

  describe('scope="document" — submitUpdateDocumentOnly', () => {
    it('ไม่เรียก fetchUpdateCustomer', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'document'
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(mockFetchUpdateCustomer).not.toHaveBeenCalled()
    })

    it('emit customerUpdated พร้อม payload ที่ถูกต้อง (กัน regression: address ต้องไม่ว่าง)', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'document'
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('customerUpdated')
      expect(emitted).toBeTruthy()
      expect(emitted.length).toBe(1)

      const payload = emitted[0][0]
      expect(payload.nameTh).toBe('บริษัท ทดสอบ จำกัด')
      expect(payload.address).toBe('123 ถนนทดสอบ กรุงเทพฯ')
      expect(payload.telephone1).toBe('02-123-4567')
      expect(payload.email).toBe('test@example.com')
    })
  })

  describe('scope="master" — submitUpdateCustomerMaster', () => {
    it('เรียก fetchUpdateCustomer 1 ครั้ง', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'master'
      await wrapper.vm.onSubmit()
      // await the async callback inside confirmSubmit
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(mockFetchUpdateCustomer).toHaveBeenCalledTimes(1)
    })

    it('เรียก fetchUpdateCustomer ด้วย argument { formValue: { code, nameTh, address, tel1, tel2, email, contactName } }', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'master'
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(mockFetchUpdateCustomer).toHaveBeenCalledWith({
        formValue: {
          code: 'CUST001',
          nameTh: 'บริษัท ทดสอบ จำกัด',
          nameEn: 'Test Company Ltd',
          address: '123 ถนนทดสอบ กรุงเทพฯ',
          tel1: '02-123-4567',
          tel2: '02-765-4321',
          email: 'test@example.com',
          contactName: 'คุณทดสอบ'
        }
      })
    })

    it('emit customerUpdated หลัง fetchUpdateCustomer สำเร็จ', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'master'
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('customerUpdated')
      expect(emitted).toBeTruthy()
      expect(emitted.length).toBe(1)
    })

    it('ไม่ emit customerUpdated เมื่อ fetchUpdateCustomer คืน false', async () => {
      mockFetchUpdateCustomer.mockResolvedValue(false)

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.scope = 'master'
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('customerUpdated')).toBeFalsy()
    })
  })

  describe('validation', () => {
    it('ไม่ submit เมื่อ nameTh ว่าง', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.form.nameTh = ''
      await wrapper.vm.onSubmit()
      await wrapper.vm.$nextTick()

      expect(mockFetchUpdateCustomer).not.toHaveBeenCalled()
      expect(wrapper.emitted('customerUpdated')).toBeFalsy()
    })
  })
})
