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
