import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const post = vi.fn()
vi.mock('@/axios/axios-helper.js', () => ({ default: { jewelry: { post: (...a) => post(...a) } } }))

import HistoryView from './history-view.vue'

const rows = [
  { running: 'A1', type: 5, status: 'process' },
  { running: 'A2', type: 5, status: 'completed' },
  { running: 'A3', type: 4, status: 'process' }
]

const BaseDataTable = {
  props: ['items'],
  template: '<div><div v-for="r in items" :key="r.running" class="row"><slot name="typeTemplate" :data="r" /></div></div>'
}

const createWrapper = () =>
  mount(HistoryView, {
    props: { isShow: true, modelGem: { code: 'G1' } },
    global: {
      mocks: { $t: (k) => k },
      stubs: { modal: { template: '<div><slot name="content" /></div>' }, GemDocLink: true, GemDocumentModal: true, BaseDataTable }
    }
  })

describe('gem history-view', () => {
  beforeEach(() => post.mockReset())

  it('ส่ง status เป็น null', async () => {
    post.mockResolvedValue({ data: rows, total: 2 })
    const wrapper = createWrapper()
    await wrapper.vm.fetchHistory()
    expect(post).toHaveBeenCalledWith('ReceiptAndIssueStockGem/ListTransection', expect.anything())
    expect(post.mock.calls[0][1].search.status).toBeNull()
  })

  it('แสดงป้ายยังไม่คืนเฉพาะแถว process', async () => {
    post.mockResolvedValue({ data: rows, total: 2 })
    const wrapper = createWrapper()
    await wrapper.vm.fetchHistory()
    await flushPromises()
    const els = wrapper.findAll('.row')
    expect(els).toHaveLength(3)
    expect(els[0].find('.not-returned-tag').exists()).toBe(true)
    expect(els[1].find('.not-returned-tag').exists()).toBe(false)
    expect(els[2].find('.not-returned-tag').exists()).toBe(false)
  })

  it('คอลัมน์ type อยู่ลำดับที่ 3 ถัดจาก running', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.columns[1].field).toBe('running')
    expect(wrapper.vm.columns[2].field).toBe('type')
  })
})
