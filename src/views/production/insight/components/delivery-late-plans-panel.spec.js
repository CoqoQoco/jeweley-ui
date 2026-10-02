// delivery-late-plans-panel.spec.js — ยืนยัน bug จริงที่เจอบน prod (2026-10-01, reqid 62350+62351): เปลี่ยน
// ช่วงเวลา (start+end เปลี่ยนพร้อมกันในจังหวะเดียวจาก RangePresetGeneric) ต้องยิง fetch แค่ 1 ครั้ง ไม่ใช่ 2
// (เดิม watch แยก start()/end() คนละตัว ทำให้ resetPaging() ถูกเรียกซ้ำ 2 รอบต่อการเปลี่ยนช่วง 1 ครั้ง)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args) } }
}))

import DeliveryLatePlansPanel from './delivery-late-plans-panel.vue'

function mountOptions() {
  return {
    global: {
      mocks: {
        $t: (key) => key,
        $router: { resolve: () => ({ href: '#', meta: { permissions: [] } }) }
      },
      stubs: {
        BaseDataTable: {
          name: 'BaseDataTableStub',
          props: ['items', 'columns', 'totalRecords', 'perPage', 'dataKey'],
          template: '<div class="data-table-stub"></div>'
        }
      }
    },
    props: {
      start: new Date('2026-04-01'),
      end: new Date('2026-10-01')
    }
  }
}

describe('DeliveryLatePlansPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue({ data: [], total: 0 })
  })

  it('fetches once on mount', async () => {
    mount(DeliveryLatePlansPanel, mountOptions())
    await Promise.resolve()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith('ProductionInsight/DeliveryLatePlans', expect.any(Object))
  })

  // บั๊กจริง: preset เปลี่ยน start+end พร้อมกันในจังหวะเดียว (setProps เดียวกัน จำลอง parent re-render ครั้ง
  // เดียวที่ส่ง prop ใหม่ทั้งคู่) ต้องยิง fetch รวมแค่ 1 ครั้งเพิ่ม (รวม mount = 2) ไม่ใช่ 2 ครั้งเพิ่ม (รวม = 3)
  it('fetches exactly once more when start and end change together (one range-preset click = one request)', async () => {
    const wrapper = mount(DeliveryLatePlansPanel, mountOptions())
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ start: new Date('2026-07-01'), end: new Date('2026-10-01') })
    await Promise.resolve()

    expect(postMock).toHaveBeenCalledTimes(1)
  })

  it('still fetches once when only one of start/end changes', async () => {
    const wrapper = mount(DeliveryLatePlansPanel, mountOptions())
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ end: new Date('2026-09-01') })
    await Promise.resolve()

    expect(postMock).toHaveBeenCalledTimes(1)
  })

  it('does not refetch when start/end are set to equivalent values (no real change)', async () => {
    const sameStart = new Date('2026-04-01')
    const sameEnd = new Date('2026-10-01')
    const wrapper = mount(DeliveryLatePlansPanel, { ...mountOptions(), props: { start: sameStart, end: sameEnd } })
    await Promise.resolve()
    postMock.mockClear()

    await wrapper.setProps({ start: new Date('2026-04-01'), end: new Date('2026-10-01') })
    await Promise.resolve()

    expect(postMock).not.toHaveBeenCalled()
  })
})
