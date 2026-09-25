import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import QuotationView from './quotation-view.vue'
import { createLineKey } from '@/services/utils/line-key.js'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'

vi.mock('@/stores/modules/api/master-store.js', () => ({
  useMasterApiStore: vi.fn(() => ({
    fetchGold: vi.fn().mockResolvedValue([]),
    fetchGem: vi.fn().mockResolvedValue([]),
    fetchDiamondGrade: vi.fn().mockResolvedValue([]),
    fetchProductType: vi.fn().mockResolvedValue([]),
    gold: [],
    gem: [],
    diamondGrade: [],
    productType: []
  }))
}))

vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: vi.fn(() => ({
    fetchDataGet: vi.fn().mockResolvedValue(null)
  }))
}))

vi.mock('@/stores/modules/api/sale/quotation-store.js', () => ({
  usrQuotationApiStore: vi.fn(() => ({
    fetchGenerateNumber: vi.fn().mockResolvedValue('QT-0001'),
    fetchSave: vi.fn().mockResolvedValue('QT-0001'),
    fetchGet: vi.fn().mockResolvedValue(null)
  }))
}))

vi.mock('@/services/helper/breakdown-setting-store.js', () => ({
  getBreakdownSetting: vi.fn().mockResolvedValue({ goldLossPercent: 12 })
}))

function makeItem(overrides = {}) {
  return {
    lineKey: createLineKey(),
    appraisalPrice: 100,
    discountPercent: 0,
    qty: 1,
    materials: [],
    ...overrides
  }
}

function createWrapper() {
  const pinia = createPinia()
  const wrapper = shallowMount(QuotationView, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
      }
    },
    props: {
      modelForm: {},
      modelQuotation: {}
    }
  })
  return { wrapper, vm: wrapper.vm.$.proxy }
}

describe('QuotationView — copyItem (แทรกบรรทัดใหม่ต่อจากต้นทางทันที)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('คัดลอกบรรทัดกลาง → บรรทัดใหม่แทรกต่อจากต้นทางทันที ไม่ไปต่อท้าย', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    const c = makeItem({ stockNumber: 'C' })
    vm.customer.quotationItems = [a, b, c]

    vm.copyItem(a, 0)

    expect(vm.customer.quotationItems).toHaveLength(4)
    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['A', null, 'B', 'C'])

    const copied = vm.customer.quotationItems[1]
    expect(copied.lineKey).not.toBe(a.lineKey)
    expect(copied.lineKey).toBeTruthy()
  })

  it('ไม่ส่ง index มา (fallback indexOf) ก็ยังแทรกถูกตำแหน่ง', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    vm.customer.quotationItems = [a, b]

    vm.copyItem(a)

    expect(vm.customer.quotationItems).toHaveLength(3)
    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['A', null, 'B'])
  })
})

describe('QuotationView — moveQuotationItem / moveQuotationItemTo (จัดลำดับรายการ)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ย้ายลง: A กับ B สลับตำแหน่งกัน', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    vm.customer.quotationItems = [a, b]

    vm.moveQuotationItem({ item: a, direction: 'down' })

    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['B', 'A'])
  })

  it('ย้ายขึ้น: B กับ A สลับตำแหน่งกัน', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    vm.customer.quotationItems = [a, b]

    vm.moveQuotationItem({ item: b, direction: 'up' })

    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['B', 'A'])
  })

  it('หัวแถวกดขึ้น / ท้ายแถวกดลง ต้องไม่เปลี่ยนอะไรเลย', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    vm.customer.quotationItems = [a, b]

    vm.moveQuotationItem({ item: a, direction: 'up' })
    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['A', 'B'])

    vm.moveQuotationItem({ item: b, direction: 'down' })
    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['A', 'B'])
  })

  it('ลาก A ไปวาง after B → สลับตำแหน่ง', async () => {
    const { vm } = createWrapper()
    await flushPromises()

    const a = makeItem({ stockNumber: 'A' })
    const b = makeItem({ stockNumber: 'B' })
    vm.customer.quotationItems = [a, b]

    vm.moveQuotationItemTo({ fromLineKey: a.lineKey, toLineKey: b.lineKey, position: 'after' })

    expect(vm.customer.quotationItems.map((i) => i.stockNumber)).toEqual(['B', 'A'])
  })
})

describe('QuotationView — เติม lineKey ย้อนหลังให้ใบเสนอราคาเก่า', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchGetQuotation: รายการเก่าที่ไม่มี lineKey ต้องได้ lineKey ครบหลังโหลด', async () => {
    usrQuotationApiStore.mockReturnValueOnce({
      fetchGenerateNumber: vi.fn(),
      fetchSave: vi.fn(),
      fetchGet: vi.fn().mockResolvedValue({
        data: JSON.stringify([{ stockNumber: 'A' }, { stockNumber: 'B' }]),
        date: '2024-01-01'
      })
    })

    const { vm } = createWrapper()
    await flushPromises()

    await vm.fetchGetQuotation()

    expect(vm.customer.quotationItems).toHaveLength(2)
    vm.customer.quotationItems.forEach((item) => {
      expect(item.lineKey).toBeTruthy()
    })
  })
})
