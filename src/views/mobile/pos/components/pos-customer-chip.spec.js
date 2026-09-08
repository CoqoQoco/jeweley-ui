import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PosCustomerChip from './pos-customer-chip.vue'

// Mock sweetAlerts
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

// Mock confirmThenSubmit ตรงๆ — เรียก cb ทันที (บันทึก args ผ่าน vi.fn ปกติ)
vi.mock('@/composables/useConfirmSubmit.js', () => ({
  confirmThenSubmit: vi.fn((msg, title, cb) => cb())
}))

const mockSearch = vi.fn()
const mockCreate = vi.fn()

vi.mock('@/stores/modules/api/customer/customer-detail-store.js', () => ({
  useCustomerDetailApiStore: vi.fn(() => ({
    fetchCustomerSearch: mockSearch,
    fetchCreateCustomer: mockCreate
  }))
}))

import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

// หมายเหตุสำคัญ: component นี้มี setup() ที่ return binding (customerStore) ทำให้
// @vue/test-utils ห่อ wrapper.vm ด้วย createVMProxy พิเศษ — ใน dev-mode ctx getter ของ
// nested data property (เช่น form) จะคืนค่า object ตัวดิบ (ก่อน reactive()) ทำให้การ set ผ่าน
// wrapper.vm.form.xxx = ... ไม่ trigger watcher ใดๆ (แม้ค่าจะยังอ่านได้ถูกต้องภายหลัง)
// ใช้ wrapper.vm.$.proxy (true instance proxy) แทนเพื่อให้ reactivity/watch ทำงานถูกต้องจริง
function createWrapper(propsOverride = {}) {
  const pinia = createPinia()
  const wrapper = shallowMount(PosCustomerChip, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
      }
    },
    props: {
      ...propsOverride
    }
  })
  return { wrapper, vm: wrapper.vm.$.proxy }
}

describe('PosCustomerChip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockSearch.mockReset().mockResolvedValue({ data: [] })
    mockCreate.mockReset().mockResolvedValue({ code: 'TH999' })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('a) พิมพ์ชื่อ 2 ตัวขึ้นไป → debounce 300ms แล้วค้นด้วยชื่อ, take 5, skipLoading true', async () => {
    mockSearch.mockResolvedValueOnce({ data: [{ code: 'C1', nameTh: 'สมชาย' }] })

    const { vm } = createWrapper()
    vm.form.name = 'สม'
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(mockSearch).toHaveBeenCalledWith({
      take: 5,
      skip: 0,
      sort: [],
      formValue: { text: 'สม' },
      skipLoading: true
    })
    expect(vm.suggestions).toEqual([{ code: 'C1', nameTh: 'สมชาย' }])
  })

  it('b) พิมพ์ชื่อ 1 ตัว → ไม่ค้น suggestions เป็น []', async () => {
    const { vm } = createWrapper()
    vm.form.name = 'ส'
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(mockSearch).not.toHaveBeenCalled()
    expect(vm.suggestions).toEqual([])
  })

  it('c) เบอร์ 5 หลักไม่ค้น, เบอร์ 6 หลักค้นด้วยเบอร์', async () => {
    const { vm } = createWrapper()

    vm.form.tel = '08123'
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(300)
    expect(mockSearch).not.toHaveBeenCalled()

    vm.form.tel = '081234'
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(mockSearch).toHaveBeenCalledWith({
      take: 5,
      skip: 0,
      sort: [],
      formValue: { text: '081234' },
      skipLoading: true
    })
  })

  it('d) debounce: พิมพ์ติดกัน 3 ครั้งภายใน 300ms → ค้นครั้งเดียว', async () => {
    const { vm } = createWrapper()

    vm.form.name = 'ส'
    await vm.$nextTick()
    vi.advanceTimersByTime(100)

    vm.form.name = 'สม'
    await vm.$nextTick()
    vi.advanceTimersByTime(100)

    vm.form.name = 'สมช'
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(mockSearch).toHaveBeenCalledTimes(1)
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ formValue: { text: 'สมช' } }))
  })

  it('e) race: เรียก fetchSuggestions ซ้อนกัน → suggestions ต้องเป็นผลของครั้งหลังเสมอ', async () => {
    let resolveFirst
    let resolveSecond
    mockSearch
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve }))

    const { vm } = createWrapper()
    vm.form.name = 'สม'
    await vm.$nextTick()

    const p1 = vm.fetchSuggestions()
    const p2 = vm.fetchSuggestions()

    // resolve คำขอ "ครั้งหลัง" ก่อน แล้วค่อย resolve "ครั้งแรก" ทีหลัง — ผลลัพธ์ต้องยังเป็นของครั้งหลัง
    resolveSecond({ data: [{ code: 'B' }] })
    await p2
    resolveFirst({ data: [{ code: 'A' }] })
    await p1

    expect(vm.suggestions).toEqual([{ code: 'B' }])
  })

  it('f) selectSuggestion: emit update:customer, success, ปิดฟอร์ม, ล้าง suggestions', async () => {
    const { wrapper, vm } = createWrapper()
    vm.showForm = true
    vm.suggestions = [{ code: 'TH001', nameTh: 'สมชาย', telephone1: '0812345678' }]

    vm.selectSuggestion({ code: 'TH001', nameTh: 'สมชาย', telephone1: '0812345678' })

    expect(wrapper.emitted('update:customer')[0][0]).toEqual({
      code: 'TH001',
      name: 'สมชาย',
      tel: '0812345678'
    })
    expect(success).toHaveBeenCalled()
    expect(vm.showForm).toBe(false)
    expect(vm.suggestions).toEqual([])
  })

  it('g) onSubmit สร้างใหม่ทั้งที่มี suggestions → confirmThenSubmit ก่อน แล้วค่อยสร้าง', async () => {
    const { wrapper, vm } = createWrapper()
    vm.form.name = 'สมชาย'
    vm.suggestions = [{ code: 'TH001', nameTh: 'สมชาย' }]

    await vm.onSubmit()
    await flushPromises()

    expect(mockSearch).not.toHaveBeenCalled()
    expect(confirmThenSubmit).toHaveBeenCalledTimes(1)
    expect(confirmThenSubmit.mock.calls[0][1]).toBe('view.mobile.pos.confirmCreateDespiteMatchTitle')

    expect(mockCreate).toHaveBeenCalledWith({
      formValue: {
        autoCode: true,
        codePrefix: 'TH',
        type: { code: 'L' },
        nameTh: 'สมชาย',
        tel1: null
      }
    })
    expect(wrapper.emitted('update:customer')[0][0].code).toBe('TH999')
  })

  it('h) onSubmit ไม่มี suggestions → สร้างลูกค้าใหม่ทันทีโดยไม่ผ่าน confirmThenSubmit', async () => {
    const { wrapper, vm } = createWrapper()
    vm.form.name = 'สมชาย'
    vm.suggestions = []

    await vm.onSubmit()
    await flushPromises()

    expect(confirmThenSubmit).not.toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalled()
    expect(wrapper.emitted('update:customer')[0][0].code).toBe('TH999')
  })

  it('i) onSubmit เบอร์ตรงเป๊ะกับลูกค้าเดิม → ผูก code เดิม ไม่สร้างใหม่', async () => {
    mockSearch.mockResolvedValueOnce({
      data: [{ code: 'TH002', nameTh: 'สมหญิง', telephone1: '081-234-5678' }]
    })

    const { wrapper, vm } = createWrapper()
    vm.form.tel = '0812345678'

    await vm.onSubmit()
    await flushPromises()

    expect(wrapper.emitted('update:customer')[0][0].code).toBe('TH002')
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
