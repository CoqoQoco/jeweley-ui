import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuotationItemsTable from './quotation-items-table.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PERMISSIONS } from '@/services/permission/config.js'

const tMock = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

function makeCustomer() {
  return {
    quotationItems: [
      {
        appraisalPrice: 100,
        discountPercent: 10,
        qty: 1,
        materials: []
      }
    ],
    currencyUnit: 'THB',
    currencyMultiplier: 1
  }
}

function createWrapper({ withMargin = false } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore()
  // sale:view-margin — ควบคุมว่าเห็นคอลัมน์ส่วนลด % ในตารางนี้หรือไม่ (default: ไม่มีสิทธิ์)
  authStore.permissions = withMargin ? [PERMISSIONS.SALE_VIEW_MARGIN] : []

  return mount(QuotationItemsTable, {
    global: {
      plugins: [pinia],
      mocks: { $t: tMock },
      stubs: {
        imagePreview: true
      }
    },
    props: {
      customer: makeCustomer(),
      sumNetWeight: 0,
      sumGoldWeight: 0,
      sumDiamondWeight: 0,
      sumGemWeight: 0,
      sumAppraisalPrice: 0,
      sumDiscountPrice: 0,
      sumConvertedPrice: 0,
      sumQty: 0,
      sumTotalConvertedPrice: 0,
      totalAfterDiscountAndAddition: 0,
      totalBeforeVat: 0,
      vatAmount: 0,
      grandTotalRaw: 0,
      grandTotalRounded: 0
    }
  })
}

describe('QuotationItemsTable — sale:view-margin ซ่อนคอลัมน์ส่วนลด % ตามสิทธิ์', () => {
  it('มีสิทธิ์ (canViewMargin): เห็นคอลัมน์ส่วนลด % ทั้ง header/body และ footer colspan เป็น 2/16', () => {
    const wrapper = createWrapper({ withMargin: true })

    const headerTexts = wrapper.findAll('thead th').map((th) => th.text())
    expect(headerTexts).toContain('view.sale.quotation.discount')
    expect(wrapper.find('tbody input[placeholder="0"]').exists()).toBe(true)

    const footerRows = wrapper.findAll('tfoot tr')
    // แถวรวม (Total row) — คอลัมน์ที่ 7 (index 6) คือ sumDiscountPrice ที่ colspan ขยับตามสิทธิ์
    expect(footerRows[0].findAll('td')[6].attributes('colspan')).toBe('2')
    // แถว "ส่วนลดพิเศษ" — แถว tfoot ถัดมา
    expect(footerRows[1].findAll('td')[0].attributes('colspan')).toBe('16')
  })

  it('ไม่มีสิทธิ์ (canViewMargin=false): ไม่เห็นคอลัมน์ส่วนลด % และ footer colspan เป็น 1/15', () => {
    const wrapper = createWrapper({ withMargin: false })

    const headerTexts = wrapper.findAll('thead th').map((th) => th.text())
    expect(headerTexts).not.toContain('view.sale.quotation.discount')
    expect(wrapper.find('tbody input[placeholder="0"]').exists()).toBe(false)

    const footerRows = wrapper.findAll('tfoot tr')
    expect(footerRows[0].findAll('td')[6].attributes('colspan')).toBe('1')
    expect(footerRows[1].findAll('td')[0].attributes('colspan')).toBe('15')
  })
})

describe('QuotationItemsTable — reorder (drag handle + ปุ่มขึ้น/ลง)', () => {
  function makeMultiItemCustomer(count) {
    return {
      quotationItems: Array.from({ length: count }, (_, i) => ({
        lineKey: `line-${i}`,
        stockNumber: `STK-${i}`,
        appraisalPrice: 100,
        discountPercent: 0,
        qty: 1,
        materials: []
      })),
      currencyUnit: 'THB',
      currencyMultiplier: 1
    }
  }

  function createWrapperWithItems(count) {
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.permissions = []

    return mount(QuotationItemsTable, {
      global: {
        plugins: [pinia],
        mocks: { $t: tMock },
        stubs: { imagePreview: true }
      },
      props: {
        customer: makeMultiItemCustomer(count),
        sumNetWeight: 0,
        sumGoldWeight: 0,
        sumDiamondWeight: 0,
        sumGemWeight: 0,
        sumAppraisalPrice: 0,
        sumDiscountPrice: 0,
        sumConvertedPrice: 0,
        sumQty: 0,
        sumTotalConvertedPrice: 0,
        totalAfterDiscountAndAddition: 0,
        totalBeforeVat: 0,
        vatAmount: 0,
        grandTotalRaw: 0,
        grandTotalRounded: 0
      }
    })
  }

  it('แถวแรก: ปุ่มขึ้น disabled — แถวสุดท้าย: ปุ่มลง disabled', () => {
    const wrapper = createWrapperWithItems(3)

    const upButtons = wrapper.findAll('[title="view.sale.quotation.moveUpTitle"]')
    const downButtons = wrapper.findAll('[title="view.sale.quotation.moveDownTitle"]')

    expect(upButtons).toHaveLength(3)
    expect(downButtons).toHaveLength(3)

    expect(upButtons[0].attributes('disabled')).toBeDefined()
    expect(downButtons[0].attributes('disabled')).toBeUndefined()

    expect(upButtons[1].attributes('disabled')).toBeUndefined()
    expect(downButtons[1].attributes('disabled')).toBeUndefined()

    expect(upButtons[2].attributes('disabled')).toBeUndefined()
    expect(downButtons[2].attributes('disabled')).toBeDefined()
  })

  it('กดปุ่มลงยิง move-item พร้อม item และ direction', async () => {
    const wrapper = createWrapperWithItems(2)
    const downButtons = wrapper.findAll('[title="view.sale.quotation.moveDownTitle"]')

    await downButtons[0].trigger('click')

    expect(wrapper.emitted('move-item')).toBeTruthy()
    expect(wrapper.emitted('move-item')[0][0]).toEqual({
      item: wrapper.props('customer').quotationItems[0],
      direction: 'down'
    })
  })

  it('กดปุ่มคัดลอกยิง copy-item พร้อม item และ index', async () => {
    const wrapper = createWrapperWithItems(2)
    const copyButtons = wrapper.findAll('[title="common.btn.copy"]')

    await copyButtons[1].trigger('click')

    expect(wrapper.emitted('copy-item')).toBeTruthy()
    expect(wrapper.emitted('copy-item')[0]).toEqual([
      wrapper.props('customer').quotationItems[1],
      1
    ])
  })
})
