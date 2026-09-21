import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SaleTeamEditModal from './sale-team-edit-modal.vue'

const mockFetchUpdateSaleTeam = vi.fn()

vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({
    fetchUpdateSaleTeam: mockFetchUpdateSaleTeam
  }))
}))

const mockFetchSaleUserOptions = vi.fn()

vi.mock('@/services/helper/sale-team-options.js', () => ({
  fetchSaleUserOptions: (...args) => mockFetchSaleUserOptions(...args)
}))

vi.mock('@/components/modal/modal-view.vue', () => ({
  default: {
    name: 'ModalView',
    template: '<div><slot name="title" /><slot name="content" /><slot name="action" /></div>',
    props: ['showModal', 'width', 'clickToClose', 'fitHeight', 'isShowActionPart'],
    emits: ['closeModal']
  }
}))

function createWrapper(propsOverride = {}) {
  const pinia = createPinia()
  const wrapper = shallowMount(SaleTeamEditModal, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
      },
      stubs: {
        modal: {
          template: '<div><slot name="title" /><slot name="content" /><slot name="action" /></div>',
          props: ['showModal'],
          emits: ['closeModal']
        }
      }
    },
    props: {
      isShow: true,
      soNumber: 'SO-001',
      salePerson: 'สมชาย',
      saleSupport: 'สมหญิง',
      ...propsOverride
    }
  })
  return wrapper
}

describe('SaleTeamEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchSaleUserOptions.mockResolvedValue([
      { code: 'user1', name: 'สมชาย' },
      { code: 'user2', name: 'สมหญิง' }
    ])
    mockFetchUpdateSaleTeam.mockResolvedValue({
      soNumber: 'SO-001',
      salePerson: 'สมชาย',
      saleSupport: 'สมหญิง',
      updatedInvoiceCount: 3
    })
  })

  it('populateForm ตั้งค่าเริ่มต้นจาก props salePerson/saleSupport', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.form.salePerson).toBe('สมชาย')
    expect(wrapper.vm.form.saleSupport).toBe('สมหญิง')
  })

  it('onSalePersonSelect: เลือกจากรายการแล้ว form.salePerson เป็น string ไม่ใช่ object', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    // AutoCompleteGeneric ส่ง object ทั้งก้อนผ่าน update:modelValue ก่อน — ต้องถูกปล่อยผ่าน (ไม่เขียนทับ form)
    wrapper.vm.onSalePersonInput({ code: 'user1', name: 'สมศักดิ์' })
    expect(wrapper.vm.form.salePerson).toBe('สมชาย')

    // แล้ว @item-select เป็นคนตั้งค่าจริงเป็น string
    wrapper.vm.onSalePersonSelect({ value: { code: 'user1', name: 'สมศักดิ์' } })
    expect(wrapper.vm.form.salePerson).toBe('สมศักดิ์')
    expect(typeof wrapper.vm.form.salePerson).toBe('string')
  })

  it('onSaleSupportInput: พิมพ์เอง (string) เซ็ตตรงๆ ได้', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    wrapper.vm.onSaleSupportInput('คนใหม่')
    expect(wrapper.vm.form.saleSupport).toBe('คนใหม่')
  })

  it('onSubmit: trim ค่าว่างแล้วส่งเป็น null ให้ store', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    wrapper.vm.form.salePerson = '   '
    wrapper.vm.form.saleSupport = '  สมหญิง  '

    await wrapper.vm.onSubmit()

    expect(mockFetchUpdateSaleTeam).toHaveBeenCalledWith({
      soNumber: 'SO-001',
      salePerson: null,
      saleSupport: 'สมหญิง'
    })
  })

  it('onSubmit สำเร็จ → emit saved พร้อม response ของ store', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    await wrapper.vm.onSubmit()

    const emitted = wrapper.emitted('saved')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual({
      soNumber: 'SO-001',
      salePerson: 'สมชาย',
      saleSupport: 'สมหญิง',
      updatedInvoiceCount: 3
    })
  })

  it('onSubmit ล้มเหลว → ไม่ emit saved และปลด isSaving (modal เปิดไว้ต่อ)', async () => {
    mockFetchUpdateSaleTeam.mockRejectedValueOnce(new Error('save failed'))
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    await expect(wrapper.vm.onSubmit()).rejects.toThrow('save failed')

    expect(wrapper.emitted('saved')).toBeFalsy()
    expect(wrapper.vm.isSaving).toBe(false)
  })

  it('onCancel emit close', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    wrapper.vm.onCancel()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
