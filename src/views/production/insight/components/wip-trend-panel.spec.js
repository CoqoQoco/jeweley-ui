// wip-trend-panel.spec.js — ยืนยัน bug จริงที่เจอบน prod (2026-10-02): เปลี่ยนช่วงเวลา (start+end+bucket
// เปลี่ยนพร้อมกันในจังหวะเดียวจาก RangePresetGeneric) ต้องยิง fetch แค่ 1 ครั้ง ไม่ใช่ 3 (เดิม watch แยก
// start()/end()/bucket() คนละตัว ทำให้ fetchTrend() ถูกเรียกซ้ำ 3 รอบต่อการเปลี่ยนช่วง 1 ครั้ง)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args) } }
}))

import WipTrendPanel from './wip-trend-panel.vue'

function mountOptions() {
  return {
    global: {
      mocks: {
        $t: (key) => key
      },
      stubs: {
        WipTrendCard: { name: 'WipTrendCardStub', template: '<div></div>' },
        ChartGeneric: { name: 'ChartGenericStub', template: '<div></div>' },
        BaseDataTable: {
          name: 'BaseDataTableStub',
          props: ['items', 'columns', 'paginator', 'dataKey'],
          template: '<div class="data-table-stub"></div>'
        }
      }
    },
    props: {
      start: new Date('2026-04-01'),
      end: new Date('2026-10-01'),
      bucket: 'week'
    }
  }
}

describe('WipTrendPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue({ buckets: [], departments: [], total: null })
  })

  it('fetches once on mount', async () => {
    mount(WipTrendPanel, mountOptions())
    await Promise.resolve()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith('ProductionInsight/WipTrend', expect.any(Object))
  })

  // บั๊กจริง: preset เปลี่ยน start+end+bucket พร้อมกันในจังหวะเดียว (setProps เดียวกัน จำลอง parent re-render
  // ครั้งเดียวที่ส่ง prop ใหม่ทั้ง 3 ตัว) ต้องยิง fetch รวมแค่ 1 ครั้งเพิ่ม (รวม mount = 2) ไม่ใช่ 3 ครั้งเพิ่ม
  it('fetches exactly once more when start, end, and bucket all change together (one range-preset click = one request)', async () => {
    const wrapper = mount(WipTrendPanel, mountOptions())
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ start: new Date('2026-07-01'), end: new Date('2026-10-01'), bucket: 'month' })
    await Promise.resolve()

    expect(postMock).toHaveBeenCalledTimes(1)
  })

  it('still fetches once when only one of start/end/bucket changes', async () => {
    const wrapper = mount(WipTrendPanel, mountOptions())
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ bucket: 'month' })
    await Promise.resolve()

    expect(postMock).toHaveBeenCalledTimes(1)
  })

  it('does not refetch when start/end/bucket are set to equivalent values (no real change)', async () => {
    const wrapper = mount(WipTrendPanel, mountOptions())
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ start: new Date('2026-04-01'), end: new Date('2026-10-01'), bucket: 'week' })
    await Promise.resolve()

    expect(postMock).not.toHaveBeenCalled()
  })
})
