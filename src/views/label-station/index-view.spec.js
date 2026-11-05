// หน้า /label-station: ไม่มีคีย์ → ฟอร์มใส่คีย์, มีคีย์ → หน้าพิมพ์, เปลี่ยนคีย์/คีย์ถูกปฏิเสธ → กลับฟอร์ม
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'

vi.mock('@/stores/modules/api/print/label-print-job-store.js', () => ({
  LABEL_STATION_DEVICE_KEY_STORAGE_KEY: 'label-station-device-key',
  useLabelPrintJobApiStore: () => ({ keyInvalid: false })
}))
vi.mock('./components/label-station-board.vue', () => ({
  default: { name: 'LabelStationBoard', template: '<div class="board" />' }
}))

import IndexView from './index-view.vue'

const mountView = () =>
  shallowMount(IndexView, {
    global: { mocks: { $t: (k) => k } }
  })

describe('label-station index-view', () => {
  beforeEach(() => localStorage.clear())

  it('shows the key form when no key is stored', () => {
    const w = mountView()
    expect(w.findComponent({ name: 'DeviceKeyForm' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LabelStationBoard' }).exists()).toBe(false)
  })

  it('saves the key then shows the board', async () => {
    const w = mountView()
    w.findComponent({ name: 'DeviceKeyForm' }).vm.$emit('save', 'ABC')
    await w.vm.$nextTick()
    expect(localStorage.getItem('label-station-device-key')).toBe('ABC')
    expect(w.findComponent({ name: 'LabelStationBoard' }).exists()).toBe(true)
  })

  it('goes back to the form with a message when the key is rejected', async () => {
    localStorage.setItem('label-station-device-key', 'ABC')
    const w = mountView()
    w.findComponent({ name: 'LabelStationBoard' }).vm.$emit('keyRejected')
    await w.vm.$nextTick()
    const form = w.findComponent({ name: 'DeviceKeyForm' })
    expect(form.exists()).toBe(true)
    expect(form.props('message')).toBe('view.labelStation.keyRejectedMsg')
  })

  it('change key clears the stored key', async () => {
    localStorage.setItem('label-station-device-key', 'ABC')
    const w = mountView()
    w.findComponent({ name: 'LabelStationBoard' }).vm.$emit('changeKey')
    await w.vm.$nextTick()
    expect(localStorage.getItem('label-station-device-key')).toBeNull()
    expect(w.findComponent({ name: 'DeviceKeyForm' }).exists()).toBe(true)
  })
})
