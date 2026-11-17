import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

const fetchByStock = vi.fn()
const fetchAllForMap = vi.fn()

vi.mock('@/stores/modules/api/stock/stock-location-api.js', () => ({
  useStockLocationApiStore: () => ({ all: [], fetchAllForMap, create: vi.fn() })
}))
vi.mock('@/stores/modules/api/stock/stock-move-location-api.js', () => ({
  useStockMoveLocationApiStore: () => ({ moveUnits: vi.fn(), moveLocation: vi.fn() })
}))
vi.mock('@/stores/modules/api/stock/rfid-api.js', () => ({
  useStockRfidApiStore: () => ({ fetchByStock })
}))
vi.mock('@/services/alert/sweetAlerts.js', () => ({
  warning: vi.fn(),
  success: vi.fn(),
  confirmSubmit: vi.fn()
}))

import MoveLocationView from './move-location-view.vue'

const lotItem = {
  stockNumber: 'SN-1',
  productCode: 'P-1',
  qty: 3,
  location: 'A1',
  locations: [{ code: 'A1', qty: 3 }]
}

const modalStub = { template: '<div><slot name="content" /></div>' }

const mountView = async () => {
  const wrapper = mount(MoveLocationView, {
    props: { isShow: false, selectedItems: [lotItem] },
    global: {
      plugins: [PrimeVue],
      mocks: { $t: (key) => key },
      stubs: { modal: modalStub }
    }
  })
  await wrapper.setProps({ isShow: true })
  await flushPromises()
  return wrapper
}

const radios = (wrapper) => wrapper.findAll('input[type="radio"]')

const pick = async (wrapper, index) => {
  const input = radios(wrapper)[index]
  input.element.checked = true
  await input.trigger('change')
  await flushPromises()
}

describe('move-location-view mode radio', () => {
  beforeEach(() => {
    fetchByStock.mockReset()
    fetchByStock.mockResolvedValue({ units: [] })
  })

  it('checks the whole radio when opened with a multi-piece lot', async () => {
    const wrapper = await mountView()
    expect(wrapper.vm.$.proxy.plans['SN-1'].mode).toBe('whole')
    expect(radios(wrapper).map((r) => r.element.checked)).toEqual([true, false, false])
  })

  it('sets mode qty and renders the qty section', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('.form-row.two-col').exists()).toBe(false)
    await pick(wrapper, 1)
    expect(wrapper.vm.$.proxy.plans['SN-1'].mode).toBe('qty')
    expect(wrapper.find('.form-row.two-col').exists()).toBe(true)
    expect(fetchByStock).not.toHaveBeenCalled()
  })

  it('sets mode units and loads units from rfid store', async () => {
    const wrapper = await mountView()
    await pick(wrapper, 2)
    expect(wrapper.vm.$.proxy.plans['SN-1'].mode).toBe('units')
    expect(fetchByStock).toHaveBeenCalledWith({ stockNumber: 'SN-1', productCode: 'P-1' })
  })
})
