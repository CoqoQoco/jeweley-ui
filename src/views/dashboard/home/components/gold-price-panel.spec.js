import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args) } }
}))

import GoldPricePanel from './gold-price-panel.vue'
import { useGoldPriceStore } from '@/stores/modules/api/dashboard/gold-price-store.js'
import goldPriceTh from '@/language/view/gold-price/th.js'

// payload จริงของ GoldPrice/Today — ไม่มี key changeFromPrevClose เลย เพราะ backend ตั้ง
// NullValueHandling.Ignore ทั้งระบบ (key หายไปจริง ไม่ได้ส่งมาเป็น null)
const TODAY_NO_CHANGE = {
  date: '2026-09-16',
  time: '14:34',
  priceSeq: 18,
  barBuy: 68000.0,
  barSell: 68200.0,
  ornamentBuy: 66643.36,
  ornamentSell: 69000.0,
  goldSpot: 4335.0,
  bahtPerUsd: 33.25,
  rounds: [
    { time: '09:05', priceSeq: 1, barBuy: 67900, barSell: 68100, ornamentBuy: 66550.12, ornamentSell: 68900, priceDiff: 200 },
    { time: '14:34', priceSeq: 18, barBuy: 68000, barSell: 68200, ornamentBuy: 66643.36, ornamentSell: 69000, priceDiff: 100 }
  ],
  isStale: false
}

const HISTORY_ITEMS = [
  { date: '2026-09-15', open: 67800, high: 68300, low: 67700, close: 68100, change: 200 },
  { date: '2026-09-16', open: 68100, high: 68400, low: 68000, close: 68200, change: 100 }
]

const UP_ARROW = '▲'
const DOWN_ARROW = '▼'

function mountOptions() {
  return {
    global: {
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $tm: () => goldPriceTh.months
      },
      stubs: {
        goldPriceChart: {
          name: 'GoldPriceChartStub',
          props: ['items', 'status', 'isStale'],
          template: '<div class="gold-price-chart-stub" :data-count="items.length"></div>'
        },
        BaseDataTable: {
          name: 'BaseDataTableStub',
          props: ['items', 'columns', 'totalRecords', 'perPage', 'paginator', 'dataKey'],
          template: '<div class="data-table-stub" :data-rows="items.length"></div>'
        }
      }
    }
  }
}

function mountPanel({ today = TODAY_NO_CHANGE, historyItems = HISTORY_ITEMS, isStale = false, status = 'loaded' } = {}) {
  const store = useGoldPriceStore()
  store.today = today
  store.todayStatus = status
  store.history = { series: 'bar-sell', items: historyItems, isStale }
  store.historyStatus = status

  return mount(GoldPricePanel, mountOptions())
}

describe('GoldPricePanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue(null)
  })

  it('renders 4 price cards with thousand separators and 2 decimals (ornamentBuy keeps .36)', () => {
    const wrapper = mountPanel()

    const values = wrapper.findAll('.kpi-grid .stat-value').map((el) => el.text())
    expect(values).toEqual(['68,200.00', '68,000.00', '69,000.00', '66,643.36'])
  })

  it('marks only the bar-sell card as the hero card (CSS hook for the bigger value)', () => {
    const wrapper = mountPanel()

    const cards = wrapper.findAll('.kpi-grid .stat-card')
    expect(cards.map((el) => el.classes().includes('gold-price-panel__hero-card'))).toEqual([true, false, false, false])
  })

  it('renders gold spot and fx values', () => {
    const wrapper = mountPanel()

    const spot = wrapper.find('.gold-price-panel__spot').text()
    expect(spot).toContain('4,335.00')
    expect(spot).toContain('33.25')
  })

  it('hides the change indicator when changeFromPrevClose key is absent from the payload', () => {
    expect('changeFromPrevClose' in TODAY_NO_CHANGE).toBe(false)

    const wrapper = mountPanel()

    const barSellCard = wrapper.findAll('.kpi-grid .stat-card')[0]
    expect(barSellCard.find('.stat-sub-label').exists()).toBe(false)
    expect(barSellCard.text()).not.toContain(UP_ARROW)
    expect(barSellCard.text()).not.toContain(DOWN_ARROW)
    expect(barSellCard.text()).not.toContain('%')
    expect(barSellCard.find('.stat-value').text()).toBe('68,200.00')
  })

  it('shows arrow + amount + percent when changeFromPrevClose is present', () => {
    const wrapper = mountPanel({ today: { ...TODAY_NO_CHANGE, changeFromPrevClose: 800.0 } })

    const subLabel = wrapper.findAll('.kpi-grid .stat-card')[0].find('.stat-sub-label')
    expect(subLabel.exists()).toBe(true)
    expect(subLabel.text()).toBe(`${UP_ARROW} +800.00 (+1.19%)`)
  })

  it('shows a downward arrow when changeFromPrevClose is negative', () => {
    const wrapper = mountPanel({ today: { ...TODAY_NO_CHANGE, changeFromPrevClose: -300.0 } })

    const subLabel = wrapper.findAll('.kpi-grid .stat-card')[0].find('.stat-sub-label')
    expect(subLabel.text()).toContain(DOWN_ARROW)
    expect(subLabel.text()).toContain('-300.00')
  })

  it('isStale=true shows the warning strip but still renders the prices', () => {
    const wrapper = mountPanel({ today: { ...TODAY_NO_CHANGE, isStale: true } })

    expect(wrapper.find('.gold-price-panel__stale').exists()).toBe(true)
    expect(wrapper.find('.gold-price-panel__stale').text()).toContain('view.goldPrice.stale.message')

    const values = wrapper.findAll('.kpi-grid .stat-value').map((el) => el.text())
    expect(values).toEqual(['68,200.00', '68,000.00', '69,000.00', '66,643.36'])
  })

  it('does not render the stale strip when isStale=false', () => {
    const wrapper = mountPanel()

    expect(wrapper.find('.gold-price-panel__stale').exists()).toBe(false)
  })

  it('shows the rounds table only after toggling, newest round first', async () => {
    const wrapper = mountPanel()

    expect(wrapper.find('.data-table-stub').exists()).toBe(false)

    await wrapper.find('.gold-price-panel__toggle-row button').trigger('click')

    const table = wrapper.find('.data-table-stub')
    expect(table.exists()).toBe(true)
    expect(table.attributes('data-rows')).toBe('2')
    expect(wrapper.findComponent({ name: 'BaseDataTableStub' }).props('items')[0].priceSeq).toBe(18)
  })

  it('error state shows the retry block instead of the price cards', () => {
    const wrapper = mountPanel({ today: null, status: 'error' })

    expect(wrapper.find('.gold-price-panel__empty').exists()).toBe(true)
    expect(wrapper.find('.kpi-grid').exists()).toBe(false)
  })

  it('passes history items down to the chart component', () => {
    const wrapper = mountPanel()

    expect(wrapper.find('.gold-price-chart-stub').attributes('data-count')).toBe('2')
  })

  it('does not call the API again when data is already loaded (tab switch back)', async () => {
    const wrapper = mountPanel()
    await Promise.resolve()

    expect(postMock).not.toHaveBeenCalled()

    wrapper.unmount()
    mountPanel()
    await Promise.resolve()

    expect(postMock).not.toHaveBeenCalled()
  })

  it('fetches today + history once on first mount, then never again', async () => {
    const store = useGoldPriceStore()
    postMock.mockImplementation((url) =>
      url === 'GoldPrice/Today'
        ? Promise.resolve(TODAY_NO_CHANGE)
        : Promise.resolve({ series: 'bar-sell', items: HISTORY_ITEMS, isStale: false })
    )

    const wrapper = mount(GoldPricePanel, mountOptions())

    await vi.waitFor(() => expect(store.todayStatus).toBe('loaded'))
    await vi.waitFor(() => expect(store.historyStatus).toBe('loaded'))
    expect(postMock).toHaveBeenCalledTimes(2)
    expect(postMock.mock.calls.map((call) => call[0]).sort()).toEqual(['GoldPrice/History', 'GoldPrice/Today'])

    wrapper.unmount()
    mount(GoldPricePanel, mountOptions())
    await Promise.resolve()

    expect(postMock).toHaveBeenCalledTimes(2)
  })
})
