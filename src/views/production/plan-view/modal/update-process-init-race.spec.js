// update-process-view.vue — initForm race: ปุ่มบันทึกต้องล็อกระหว่างโหลด, พลอย/ช่างไม่หลุดเมื่อ lookup พัง, run เก่าไม่ทับ run ใหม่
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

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

const RowCtx = {
  props: ['row'],
  provide() {
    return { stubRow: this.row }
  },
  template: '<div><slot /></div>'
}

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const makeModel = (overrides = {}) => ({
  id: 1,
  wo: 'WO',
  woNumber: 1,
  tbtProductionPlanStatusHeader: [
    {
      id: 9,
      status: 70,
      workerCode: 'W1',
      remark1: '',
      remark2: '',
      tbtProductionPlanStatusDetail: [
        { itemNo: 1, worker: 'W1', workerSub: null, goldQtySend: 1 }
      ],
      tbtProductionPlanStatusGem: [
        { id: 55, code: 'G55', name: 'Ruby', itemNo: 1, qty: 2, weight: 1, price: 10 }
      ],
      ...overrides
    }
  ]
})

const mountView = (model = makeModel()) => {
  const wrapper = mount(UpdateProcessView, {
    props: {
      isShow: false,
      modelValue: model,
      modelMatValue: [],
      masterStatus: [],
      masterGold: [],
      statusCode: 70
    },
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        modal: { template: '<div><slot name="content" /></div>' },
        AutoComplete: true,
        Calendar: true,
        Dropdown: true,
        DataTable: true,
        Column: true,
        BaseDataTable: true,
        planOverview: true
      }
    }
  })
  wrapper.setProps({ isShow: true })
  return wrapper
}

const saveBtn = (w) => w.find('button[type="submit"]')
const submittedPayload = () => postMock.mock.calls.find((c) => c[0].includes('UpdateStatusDetail'))?.[1]

describe('update-process-view initForm race', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('ปุ่มบันทึก disabled ขณะโหลด แล้วเปิดเมื่อเสร็จ', async () => {
    const gem = deferred()
    postMock.mockImplementation((url) => {
      if (url === 'StockGem/Search') return gem.promise
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1' }] })
      return Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    expect(saveBtn(w).attributes('disabled')).toBeDefined()
    gem.resolve([{ id: 55, code: 'G55', name: 'Ruby' }])
    await flushPromises()
    expect(saveBtn(w).attributes('disabled')).toBeUndefined()
  })

  it('gem lookup คืน null/ว่าง -> payload ยังมี id/code/name', async () => {
    postMock.mockImplementation((url) => {
      if (url === 'StockGem/Search') return Promise.resolve(null)
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1' }] })
      return Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    await w.vm.onSubmit()
    await flushPromises()
    const gems = submittedPayload().gems
    expect(gems).toHaveLength(1)
    expect(gems[0]).toMatchObject({ id: 55, code: 'G55', name: 'Ruby' })
  })

  it('gem/worker lookup ล้ม (helper กลืน error) -> payload ยังมี id/code และช่างยังส่ง code', async () => {
    postMock.mockImplementation((url) => {
      if (url === 'StockGem/Search' || url === 'Worker/Search') return Promise.reject(new Error('x'))
      return Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    expect(w.vm.initFailed).toBe(false)
    await w.vm.onSubmit()
    await flushPromises()
    const p = submittedPayload()
    expect(p.gems[0]).toMatchObject({ id: 55, code: 'G55' })
    expect(p.golds[0].worker).toBe('W1')
  })

  it('error นอกระดับแถว -> initFailed, ปุ่ม disabled, ไม่ส่ง API', async () => {
    postMock.mockResolvedValue({})
    const w = mountView(makeModel({ tbtProductionPlanStatusDetail: { notAnArray: true } }))
    await flushPromises()
    expect(w.vm.initFailed).toBe(true)
    expect(saveBtn(w).attributes('disabled')).toBeDefined()
    await w.vm.onSubmit()
    await flushPromises()
    expect(submittedPayload()).toBeUndefined()
  })

  it('run เก่าไม่ทับ run ใหม่', async () => {
    const slow = deferred()
    let first = true
    postMock.mockImplementation((url) => {
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1' }] })
      if (url === 'StockGem/Search') {
        if (first) {
          first = false
          return slow.promise
        }
        return Promise.resolve([{ id: 55, code: 'NEW', name: 'New' }])
      }
      return Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    w.vm.initForm()
    await flushPromises()
    expect(w.vm.gemAssign[0].gem.code).toBe('NEW')
    expect(w.vm.isInitLoading).toBe(false)
    slow.resolve([{ id: 55, code: 'OLD', name: 'Old' }])
    await flushPromises()
    expect(w.vm.gemAssign[0].gem.code).toBe('NEW')
    expect(w.vm.isInitLoading).toBe(false)
  })

  const okMocks = (extra = {}) =>
    postMock.mockImplementation((url) => {
      if (extra[url]) return extra[url]()
      if (url === 'StockGem/Search') return Promise.resolve([{ id: 55, code: 'G55', name: 'Ruby' }])
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1', nameTh: 'ช่าง' }] })
      return Promise.resolve({})
    })

  it('submit ล้มแล้ว retry ยังส่ง gem id/code และ state ไม่ถูกแก้', async () => {
    let n = 0
    okMocks({
      'ProductionPlan/ProductionPlanUpdateStatusDetail': () =>
        ++n === 1 ? Promise.reject(new Error('net')) : Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    await w.vm.submit().catch(() => null)
    expect(w.vm.gemAssign[0].gem.id).toBe(55)
    expect(w.vm.matAssign[0].workers.code).toBe('W1')
    await w.vm.submit()
    const calls = postMock.mock.calls.filter((c) => c[0].includes('UpdateStatusDetail'))
    expect(calls).toHaveLength(2)
    expect(calls[1][1].gems[0]).toMatchObject({ id: 55, code: 'G55' })
  })

  it('ล้างช่างแล้วส่ง worker เป็น null', async () => {
    okMocks()
    const w = mountView()
    await flushPromises()
    w.vm.matAssign[0].workers = null
    await w.vm.submit()
    expect(submittedPayload().golds[0].worker).toBeNull()
  })

  it('ปิด modal ระหว่างโหลด run ที่มาทีหลังไม่เขียน state', async () => {
    const slow = deferred()
    postMock.mockImplementation((url) => {
      if (url === 'StockGem/Search') return slow.promise
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1' }] })
      return Promise.resolve({})
    })
    const w = mountView()
    await flushPromises()
    w.vm.closeModal()
    expect(w.vm.isInitLoading).toBe(false)
    const before = w.vm.gemAssign.length
    slow.resolve([{ id: 55, code: 'LATE', name: 'Late' }])
    await flushPromises()
    expect(w.vm.gemAssign).toHaveLength(before)
    expect(w.vm.form.headerId).not.toBe(9)
  })

  it('initFailed แสดงข้อความแจ้งใกล้ปุ่ม', async () => {
    postMock.mockResolvedValue({})
    const w = mountView(makeModel({ tbtProductionPlanStatusDetail: { notAnArray: true } }))
    await flushPromises()
    expect(w.text()).toContain('โหลดข้อมูลไม่สำเร็จ')
  })
})

describe('update-process-view delete gold row button', () => {
  it('ปุ่มลบแถวทองเป็น type=button: ลบแถวได้ และไม่ submit/ไม่เปิด confirm', async () => {
    postMock.mockImplementation((url) => {
      if (url === 'Worker/Search') return Promise.resolve({ data: [{ code: 'W1' }] })
      return Promise.resolve([])
    })
    const w = mount(UpdateProcessView, {
      props: {
        isShow: false,
        modelValue: makeModel(),
        modelMatValue: [],
        masterStatus: [],
        masterGold: [],
        statusCode: 70
      },
      global: {
        mocks: { $t: (k) => k },
        stubs: {
          modal: { template: '<div><slot name="content" /></div>' },
          AutoComplete: true,
          Calendar: true,
          Dropdown: true,
          BaseDataTable: true,
          planOverview: true,
          DataTable: {
            props: ['value'],
            components: { RowCtx },
            template: '<div><RowCtx v-for="(row, i) in value" :key="i" :row="row"><slot /></RowCtx></div>'
          },
          Column: {
            inject: ['stubRow'],
            template: '<span v-if="$slots.body"><slot name="body" :data="stubRow" /></span>'
          }
        }
      }
    })
    w.setProps({ isShow: true })
    await flushPromises()
    const delBtn = w.findAll('button.btn-red').find((b) => b.find('i.bi-trash-fill').exists())
    expect(delBtn).toBeTruthy()
    expect(delBtn.attributes('type')).toBe('button')
    const before = w.vm.matAssign.length
    const row = w.vm.matAssign[0]
    const submitSpy = vi.spyOn(w.vm, 'onSubmit')
    // click ก่อน await ใดๆ: ถ้าปุ่มเป็น submit จะยิง submit ใน tick เดียวกัน ไม่ให้ลำดับ async มาบัง
    await delBtn.trigger('click')
    expect(w.vm.matAssign.length).toBe(before - 1)
    expect(w.vm.matAssign).not.toContain(row)
    await flushPromises()
    expect(submitSpy).not.toHaveBeenCalled()
    expect(postMock.mock.calls.some((c) => c[0].includes('UpdateStatusDetail'))).toBe(false)
  })
})
