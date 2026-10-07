import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import EditStockView from './edit-stock-view.vue'

const masterMock = vi.hoisted(() => ({
  fetchGold: vi.fn(),
  fetchGem: vi.fn(),
  fetchDiamondGrade: vi.fn(),
  gold: [],
  gem: [],
  diamondGrade: []
}))

vi.mock('@/stores/modules/api/master-store.js', () => ({
  useMasterApiStore: vi.fn(() => masterMock)
}))

vi.mock('@/stores/modules/api/stock/product-api.js', () => ({
  usrStockProductApiStore: vi.fn(() => ({}))
}))

vi.mock('@/stores/modules/api/stock/image-api.js', () => ({
  stockProductImageApiStor: vi.fn(() => ({}))
}))

vi.mock('@/services/helper/breakdown-term-history-store.js', () => ({
  getTermHistory: vi.fn().mockResolvedValue({})
}))

describe('EditStockView — โหลด master เองตอน mount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    masterMock.fetchGold.mockResolvedValue([])
    masterMock.fetchGem.mockResolvedValue([])
    masterMock.fetchDiamondGrade.mockResolvedValue([])
  })

  it('mount แล้วเรียก fetchGold, fetchGem, fetchDiamondGrade ครบ', async () => {
    shallowMount(EditStockView, {
      global: {
        plugins: [createPinia()],
        mocks: { $t: (key) => key }
      },
      props: { isShow: false, modelStock: {} }
    })
    await flushPromises()

    expect(masterMock.fetchGold).toHaveBeenCalledTimes(1)
    expect(masterMock.fetchGem).toHaveBeenCalledTimes(1)
    expect(masterMock.fetchDiamondGrade).toHaveBeenCalledTimes(1)
  })
})
