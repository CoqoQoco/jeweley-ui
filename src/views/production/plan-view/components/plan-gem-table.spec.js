import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import PlanGemTable from './plan-gem-table.vue'

const rows = [
  { id: 9, itemNo: '1', code: 'SD0109', name: 'Sapphire', outboundRunning: 'PIO1', qty: 6, weight: 0.16 },
  { id: 9, itemNo: '2', code: 'SD0109', name: 'Sapphire', outboundRunning: 'PIO2', qty: 6, weight: 0.16 },
  { id: 3, itemNo: '3', code: 'SI1', name: 'Diamond', outboundRunning: 'PIO3', qty: 4, weight: 0.02 }
]
const returnedRows = [
  { itemNo: '0', gemCode: 'SD0109', gemName: 'Sapphire', outboundRunning: 'PIO0', returnQty: 6, returnWeight: 0.16, inboundRunning: 'INB1' }
]

const BaseDataTable = {
  props: ['items', 'columns'],
  template: `<div>
    <div class="cols">{{ columns.map((c) => c.field).join(',') }}</div>
    <div v-for="r in items" :key="r.itemNo" class="row">
      <slot name="gemActionTemplate" :data="r" /><slot name="nameTemplate" :data="r" />
    </div>
    <div class="footer"><slot name="footer" /></div>
  </div>`
}

const t = (k, p) => (p ? `${k}:${JSON.stringify(p)}` : k)

const make = (props) =>
  mount(PlanGemTable, {
    props: { rows, ...props },
    global: { mocks: { $t: t }, stubs: { BaseDataTable, CheckboxGeneric: true } }
  })

describe('plan-gem-table', () => {
  it('ไม่มีสิทธิ์: ไม่มีคอลัมน์จัดการ ไม่มีปุ่ม', () => {
    const w = make({ canReturn: false })
    expect(w.find('.cols').text()).not.toContain('gemAction')
    expect(w.find('button').exists()).toBe(false)
  })

  it('มีสิทธิ์: คอลัมน์จัดการอยู่แรก ปุ่มทุกแถว และป้ายเบิกซ้ำเฉพาะรหัสที่เลขเบิกต่างกัน', () => {
    const w = make({ canReturn: true })
    expect(w.find('.cols').text().startsWith('gemAction')).toBe(true)
    const rowEls = w.findAll('.row')
    expect(rowEls.map((r) => r.findAll('button').length)).toEqual([1, 1, 1])
    expect(rowEls.map((r) => r.find('.gem-chip--warning').exists())).toEqual([true, true, false])
    expect(rowEls[0].find('button').classes()).toContain('btn-main')
    expect(rowEls[2].find('button').classes()).toContain('btn-outline-main')
  })

  it('ใบงานสำเร็จ: ปุ่มถูก disable', () => {
    const w = make({ canReturn: true, returnDisabled: true })
    expect(w.find('button').attributes('disabled')).toBeDefined()
  })

  it('footer นับแถว (ไม่รวมจำนวนเม็ด)', () => {
    const w = make({ canReturn: true })
    expect(w.find('.footer').text()).toContain('{"count":3}')
  })

  it('toggle แสดงรายการที่คืนแล้ว: เพิ่มแถวคืนแล้ว + footer บอกจำนวนที่คืน', async () => {
    const w = make({ canReturn: true, returnedRows })
    expect(w.findAll('.row')).toHaveLength(3)
    w.vm.showReturned = true
    await w.vm.$nextTick()
    const rowEls = w.findAll('.row')
    expect(rowEls).toHaveLength(4)
    expect(rowEls[3].find('.gem-chip--returned').exists()).toBe(true)
    expect(rowEls[3].find('button').exists()).toBe(false)
    expect(w.find('.footer').text()).toContain('footerReturned')
  })
})
