import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PhotoSheetDocNoModal from './photo-sheet-doc-no-modal.vue'

function createWrapper(props = {}) {
  return shallowMount(PhotoSheetDocNoModal, {
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        modal: {
          template: '<div><slot name="title" /><slot name="content" /><slot name="action" /></div>',
          props: ['showModal']
        }
      }
    },
    props: { modelValue: true, defaultDocNo: 'QT-001', ...props }
  })
}

describe('PhotoSheetDocNoModal', () => {
  it('ตั้งค่าเริ่มต้นเป็นเลขเอกสารเดิม', () => {
    expect(createWrapper().vm.docNo).toBe('QT-001')
  })

  it('เปิดซ้ำ → รีเซ็ตกลับเป็นเลขเดิม', async () => {
    const wrapper = createWrapper({ modelValue: false })
    wrapper.vm.docNo = 'แก้แล้ว'
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.vm.docNo).toBe('QT-001')
  })

  it('onConfirm: emit confirm ด้วยค่าที่ trim แล้วและปิด dialog', () => {
    const wrapper = createWrapper()
    wrapper.vm.docNo = '  X-9  '
    wrapper.vm.onConfirm()
    expect(wrapper.emitted('confirm')[0]).toEqual(['X-9'])
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('เคลียร์ทั้งหมด → confirm ด้วยสตริงว่าง (ไม่ fallback เลขเดิม)', () => {
    const wrapper = createWrapper()
    wrapper.vm.docNo = '   '
    wrapper.vm.onConfirm()
    expect(wrapper.emitted('confirm')[0]).toEqual([''])
  })

  it('onCancel: ปิดโดยไม่ emit confirm', () => {
    const wrapper = createWrapper()
    wrapper.vm.onCancel()
    expect(wrapper.emitted('confirm')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })
})
