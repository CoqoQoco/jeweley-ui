import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import AnnouncementFormView from './form-view.vue'

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

vi.mock('@/composables/useConfirmSubmit.js', () => ({
  confirmThenSubmit: vi.fn((msg, title, cb) => cb())
}))

const mockGet = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/stores/modules/api/announcement/announcement-store.js', () => ({
  useAnnouncementStore: vi.fn(() => ({
    getAnnouncement: mockGet,
    createAnnouncement: mockCreate,
    updateAnnouncement: mockUpdate
  }))
}))

import { warning } from '@/services/alert/sweetAlerts.js'

// หมายเหตุ: component นี้มี setup() ที่ return binding (announcementStore) ทำให้ต้องใช้
// wrapper.vm.$.proxy (true instance proxy) แทน wrapper.vm ตรงๆ เพื่อให้ set nested data (form.xxx) reactive ถูกต้อง
function createWrapper(routeParams = {}) {
  const pinia = createPinia()
  const wrapper = shallowMount(AnnouncementFormView, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $route: { params: routeParams },
        $router: { push: vi.fn() }
      },
      stubs: {
        PageHeaderGeneric: true,
        SectionCardGeneric: true,
        FormFieldGeneric: true,
        InputTextGeneric: true,
        TextareaGeneric: true,
        ButtonGeneric: true,
        CalendarGeneric: true,
        CheckboxGeneric: true,
        UploadImage: true
      }
    }
  })
  return { wrapper, vm: wrapper.vm.$.proxy }
}

describe('AnnouncementFormView onSubmit date normalisation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ id: 1 })
    mockUpdate.mockResolvedValue({ id: 1 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('a) publishEnd 2026-09-12 ถูกส่งเป็น ISO ของ 2026-09-12T23:59:59.999 เวลาท้องถิ่น', async () => {
    const { vm } = createWrapper()
    vm.form.title = 'ประกาศทดสอบ'
    vm.form.body = 'เนื้อหาทดสอบ'
    vm.form.publishStart = new Date(2026, 8, 1)
    vm.form.publishEnd = new Date(2026, 8, 12)

    await vm.onSubmit()
    await flushPromises()

    const formData = mockCreate.mock.calls[0][0]
    const expected = new Date(2026, 8, 12, 23, 59, 59, 999).toISOString()
    expect(formData.get('publishEnd')).toBe(expected)
  })

  it('b) publishStart เลือกเป็นวันในอนาคต ถูกส่งเป็น 00:00 เวลาท้องถิ่นของวันนั้น', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 8, 10, 30, 0))

    const { vm } = createWrapper()
    vm.form.title = 'ประกาศทดสอบ'
    vm.form.body = 'เนื้อหาทดสอบ'
    vm.form.publishStart = new Date(2026, 8, 15)
    vm.form.publishEnd = null

    await vm.onSubmit()
    await flushPromises()

    const formData = mockCreate.mock.calls[0][0]
    const expected = new Date(2026, 8, 15, 0, 0, 0, 0).toISOString()
    expect(formData.get('publishStart')).toBe(expected)
  })

  it('c) publishEnd ว่าง ไม่ถูก append เข้า FormData', async () => {
    const { vm } = createWrapper()
    vm.form.title = 'ประกาศทดสอบ'
    vm.form.body = 'เนื้อหาทดสอบ'
    vm.form.publishStart = new Date(2026, 8, 1)
    vm.form.publishEnd = null

    await vm.onSubmit()
    await flushPromises()

    const formData = mockCreate.mock.calls[0][0]
    expect(formData.get('publishEnd')).toBe(null)
  })

  it('d) publishStart กับ publishEnd เป็นวันเดียวกัน ผ่าน validate และสร้างสำเร็จ', async () => {
    const { vm } = createWrapper()
    vm.form.title = 'ประกาศทดสอบ'
    vm.form.body = 'เนื้อหาทดสอบ'
    vm.form.publishStart = new Date(2026, 8, 10)
    vm.form.publishEnd = new Date(2026, 8, 10)

    await vm.onSubmit()
    await flushPromises()

    expect(warning).not.toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
