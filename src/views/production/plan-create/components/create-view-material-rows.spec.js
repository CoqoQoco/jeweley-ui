// create-view.vue — ตารางวัตถุดิบเป็นช่องกรอกได้ตลอด: ค่าที่กรอกอยู่ใน form.material ทันที และปุ่มลบต้องลบแถวที่กด
// ใช้ PrimeVue DataTable/Column ตัวจริง (ไม่ stub)
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { get: () => Promise.resolve([]), post: () => Promise.resolve({}) } }
}))
vi.mock('@/stores/modules/api/production/pre-plan-store.js', () => ({
  usePrePlanStore: () => ({ fetchWaitingCount: () => Promise.resolve(0) })
}))
vi.mock('@/stores/modules/api/master/mold-store.js', () => ({
  useMoldStore: () => ({ fetchProductionCount: () => Promise.resolve(0) })
}))
vi.mock('@/stores/modules/master/loading-store.js', () => ({
  useLoadingStore: () => ({})
}))

import CreateView from './create-view.vue'

const mountView = async () => {
  const w = mount(CreateView, {
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (k) => k },
      stubs: {
        pageTitle: true,
        modifyPlanView: true,
        selectPrePlanItemModal: true,
        AutoCompleteGeneric: true,
        CalendarGeneric: true,
        CheckboxGeneric: true
      }
    }
  })
  await flushPromises()
  w.vm.form.material.splice(0)
  return w
}

const materialTable = (w) => w.findAll('table').at(-1)
const col = (k) => `view.production.planCreate.${k}`

describe('create-view material table always-editable cells', () => {
  it('กรอกจำนวนทอง/ขนาดพลอยแล้วอยู่ใน form.material ทันที (ไม่ต้องกด ✓)', async () => {
    const w = await mountView()
    w.vm.onAddMaterial()
    await flushPromises()
    await materialTable(w).find(`input[aria-label="${col('colGoldQty')}"]`).setValue('3')
    await materialTable(w).find(`input[aria-label="${col('colGemSize')}"]`).setValue('2x3')
    expect(w.vm.form.material[0].goldQty).toBe(3)
    expect(w.vm.form.material[0].gemSize).toBe('2x3')
  })

  it('ลบแถวกลางจาก 3 แถว: แถวนั้นหาย ที่เหลือถูก (ไม่ลบแถวสุดท้ายแทน)', async () => {
    const w = await mountView()
    w.vm.onAddMaterial()
    w.vm.onAddMaterial()
    w.vm.onAddMaterial()
    await flushPromises()
    const ids = w.vm.form.material.map((m) => m.id)
    expect(ids).toHaveLength(3)
    const dels = materialTable(w).findAll('tbody button.btn-red')
    expect(dels).toHaveLength(3)
    await dels[1].trigger('click')
    await flushPromises()
    expect(w.vm.form.material.map((m) => m.id)).toEqual([ids[0], ids[2]])
  })

  it('เลือกใบเตรียมผลิต 2 แถว แล้วเพิ่มแถวและลบแถวใหม่: แถวเตรียมผลิตยังอยู่ครบ id ไม่ซ้ำ', async () => {
    const w = await mountView()
    w.vm.onPrePlanItemSelected({
      itemId: 1,
      moldCode: 'M1',
      materials: [{ goldQty: 1 }, { goldQty: 2 }]
    })
    await flushPromises()
    w.vm.onAddMaterial()
    await flushPromises()
    const ids = w.vm.form.material.map((m) => m.id)
    expect(new Set(ids).size).toBe(3)
    const dels = materialTable(w).findAll('tbody button.btn-red')
    expect(dels).toHaveLength(3)
    await dels[2].trigger('click')
    await flushPromises()
    expect(w.vm.form.material.map((m) => m.goldQty)).toEqual([1, 2])
    expect(w.vm.form.material.map((m) => m.id)).toEqual(ids.slice(0, 2))
  })
})
