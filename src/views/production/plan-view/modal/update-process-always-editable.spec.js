// update-process-view.vue — ตารางทอง/พลอยเป็น "ช่องกรอกได้ตลอด" (ไม่มี row editor): ค่าที่กรอกต้องถึง payload โดยไม่ต้องกด ✓ และปุ่มลบต้องลบแถวที่กด
// ใช้ PrimeVue DataTable/Column ตัวจริง (ไม่ stub) เพราะบั๊กเดิมเกิดจาก slot ส่งสำเนาแถวตอน editMode="row"
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args) } }
}))
vi.mock('@/services/alert/sweetAlerts.js', () => ({
  confirmSubmit: (a, b, cb) => cb(),
  success: vi.fn(),
  warning: vi.fn()
}))

import UpdateProcessView from './update-process-view.vue'

const L = (k) => `view.production.planUpdateCell.${k}`

const gemRow = (id, extra = {}) => ({ id, code: `G${id}`, name: `Gem${id}`, itemNo: id, qty: 2, weight: 1, price: 10, ...extra })

const makeModel = (gems) => ({
  id: 1,
  wo: 'WO',
  woNumber: 1,
  tbtProductionPlanStatusHeader: [
    {
      id: 9,
      status: 50,
      workerCode: 'W1',
      remark1: '',
      remark2: '',
      tbtProductionPlanStatusDetail: [{ itemNo: 1, worker: 'W1', workerSub: null, goldQtySend: 1 }],
      tbtProductionPlanStatusGem: gems
    }
  ]
})

const okMocks = () =>
  postMock.mockImplementation((url, params) => {
    if (url === 'StockGem/Search') {
      const id = params?.search?.id
      return Promise.resolve([{ id, code: `G${id}`, name: `Gem${id}` }])
    }
    if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1', nameTh: 'ช่าง' }] })
    return Promise.resolve({})
  })

const mountView = async (gems) => {
  const w = mount(UpdateProcessView, {
    props: {
      isShow: false,
      modelValue: makeModel(gems),
      modelMatValue: [],
      masterStatus: [],
      masterGold: [{ code: 'YG' }],
      statusCode: 50
    },
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (k) => k },
      stubs: {
        modal: { template: '<div><slot name="content" /></div>' },
        BaseDataTable: true,
        planOverview: true
      }
    }
  })
  await w.setProps({ isShow: true })
  await flushPromises()
  return w
}

const gemTable = (w) => w.findAll('table')[1]
const gemInputs = (w, key) => gemTable(w).findAll(`input[aria-label="${L(key)}"]`)
const submittedPayload = () => postMock.mock.calls.filter((c) => c[0].includes('UpdateStatusDetail')).at(-1)?.[1]

describe('update-process-view always-editable cells', () => {
  beforeEach(() => {
    postMock.mockReset()
    okMocks()
  })

  it('status 50: กรอกความยาว 18 หน่วย นิ้ว บนแถวใบเบิก แล้ว submit ได้ใน payload โดยไม่ต้องกด ✓', async () => {
    const w = await mountView([gemRow(55, { outboundRunning: 'OB-1' })])
    await gemInputs(w, 'length')[0].setValue('18')
    await gemInputs(w, 'lengthUnit')[0].setValue('นิ้ว')
    await w.vm.onSubmit()
    await flushPromises()
    const p = submittedPayload()
    expect(p.gems).toHaveLength(1)
    expect(p.gems[0]).toMatchObject({ id: 55, length: 18, lengthUnit: 'นิ้ว', outboundRunning: 'OB-1' })
  })

  it('จำนวน/น้ำหนักของแถวใบเบิกยัง disabled แต่แถวที่เพิ่มเองกรอกได้', async () => {
    const w = await mountView([gemRow(55, { outboundRunning: 'OB-1' })])
    expect(gemInputs(w, 'length')[0].attributes('disabled')).toBeUndefined()
    const qtyLabel = 'common.field.quantity'
    const weightLabel = 'common.field.weight'
    const q = () => gemTable(w).findAll(`input[aria-label="${qtyLabel}"]`)
    const wt = () => gemTable(w).findAll(`input[aria-label="${weightLabel}"]`)
    expect(q()[0].attributes('disabled')).toBeDefined()
    expect(wt()[0].attributes('disabled')).toBeDefined()
    w.vm.addGem()
    await flushPromises()
    expect(q()[1].attributes('disabled')).toBeUndefined()
    expect(wt()[1].attributes('disabled')).toBeUndefined()
  })

  it('ลบแถวกลางจาก 3 แถวพลอย: แถวนั้นหาย ที่เหลือถูก', async () => {
    const w = await mountView([gemRow(11), gemRow(22), gemRow(33)])
    expect(w.vm.gemAssign.map((g) => g.gemId)).toEqual([11, 22, 33])
    const dels = gemTable(w).findAll('tbody button.btn-red')
    expect(dels).toHaveLength(3)
    await dels[1].trigger('click')
    await flushPromises()
    expect(w.vm.gemAssign.map((g) => g.gemId)).toEqual([11, 33])
    expect(gemTable(w).findAll('tbody button.btn-red')).toHaveLength(2)
  })

  it('ลบแถวกลางของตารางทอง: ไม่ลบแถวสุดท้ายแทน', async () => {
    const model = makeModel([])
    model.tbtProductionPlanStatusHeader[0].tbtProductionPlanStatusDetail = [
      { itemNo: 1, worker: 'W1', goldQtySend: 1 },
      { itemNo: 2, worker: 'W1', goldQtySend: 2 },
      { itemNo: 3, worker: 'W1', goldQtySend: 3 }
    ]
    const w = mount(UpdateProcessView, {
      props: { isShow: false, modelValue: model, modelMatValue: [], masterStatus: [], masterGold: [{ code: 'YG' }], statusCode: 50 },
      global: {
        plugins: [PrimeVue],
        mocks: { $t: (k) => k },
        stubs: { modal: { template: '<div><slot name="content" /></div>' }, BaseDataTable: true, planOverview: true }
      }
    })
    await w.setProps({ isShow: true })
    await flushPromises()
    const dels = w.findAll('table')[0].findAll('tbody button.btn-red')
    expect(dels).toHaveLength(3)
    await dels[1].trigger('click')
    await flushPromises()
    expect(w.vm.matAssign.map((g) => g.itemNo)).toEqual([1, 3])
  })

  it('ปิด modal (onClear) แล้วเปิดใหม่ init ข้อมูลใหม่ และ submit ส่งค่าที่กรอกใหม่', async () => {
    const w = await mountView([gemRow(55)])
    await gemInputs(w, 'length')[0].setValue('99')
    w.vm.closeModal()
    await w.setProps({ isShow: false })
    await flushPromises()
    await w.setProps({ modelValue: makeModel([gemRow(77, { qty: 5 })]) })
    await w.setProps({ isShow: true })
    await flushPromises()
    expect(w.vm.gemAssign).toHaveLength(1)
    await gemInputs(w, 'length')[0].setValue('18')
    await gemInputs(w, 'lengthUnit')[0].setValue('ซม.')
    await w.vm.onSubmit()
    await flushPromises()
    const p = submittedPayload()
    expect(p.gems).toHaveLength(1)
    expect(p.gems[0]).toMatchObject({ id: 77, qty: 5, length: 18, lengthUnit: 'ซม.' })
  })
})
