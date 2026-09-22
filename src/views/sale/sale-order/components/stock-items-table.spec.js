import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StockItemsTable from './stock-items-table.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PERMISSIONS } from '@/services/permission/config.js'

const tMock = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

function makeParent() {
  return {
    lineKey: 'parent-1',
    stockNumber: 'NEW04495',
    stockNumberOrigin: 'NEW04495',
    isPlaceholder: false,
    isConfirm: false,
    invoice: null,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
}

// บรรทัดสำเนา (copy line) ที่พิมพ์เลขที่ผลิตแล้ว — state ตรงกับที่ user รายงาน (SO260911003)
function makeCopyItemWithCode() {
  return {
    lineKey: 'copy-with-code',
    parentLineKey: 'parent-1',
    isPlaceholder: true,
    stockNumber: 'S510026TSZ9L1-02',
    stockNumberOrigin: null,
    sourceStockNumber: 'NEW04495',
    isConfirm: false,
    invoice: null,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
}

// บรรทัดสำเนาที่ยังไม่พิมพ์เลขที่ผลิต
function makeCopyItemWithoutCode() {
  return {
    lineKey: 'copy-without-code',
    parentLineKey: 'parent-1',
    isPlaceholder: true,
    stockNumber: null,
    stockNumberOrigin: null,
    sourceStockNumber: 'NEW04495',
    isConfirm: false,
    invoice: null,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
}

function createWrapper(copyItems, { withMargin = false } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore()
  // sale:view-margin — ควบคุมว่าเห็นคอลัมน์ส่วนลด % ในตารางนี้หรือไม่ (default: ไม่มีสิทธิ์)
  authStore.permissions = withMargin ? [PERMISSIONS.SALE_VIEW_MARGIN] : []
  return mount(StockItemsTable, {
    global: {
      plugins: [pinia],
      mocks: { $t: tMock },
      stubs: {
        imagePreview: true
      }
    },
    props: {
      stockItems: [makeParent()],
      copyItems,
      formSaleOrder: { currencyUnit: 'THB', currencyRate: 1 }
    }
  })
}

// คอลัมน์ "เลขที่ผลิต (เก่า)" เป็นคอลัมน์ที่ 4 ของตาราง (index, action, image, เก่า, ผลิต, ...)
const OLD_NUMBER_COL_INDEX = 3

describe('StockItemsTable — บรรทัดสำเนา (copy line) แสดงเลขที่ผลิตถูกต้อง', () => {
  it('บรรทัดสำเนาที่พิมพ์เลขแล้ว: คอลัมน์ "เลขที่ผลิต (เก่า)" ต้องว่าง ไม่ใช่เลขของบรรทัดแม่', () => {
    const wrapper = createWrapper([makeCopyItemWithCode()])
    const childRow = wrapper.find('tr.copy-child-row')
    expect(childRow.exists()).toBe(true)

    const oldNumberCell = childRow.findAll('td')[OLD_NUMBER_COL_INDEX]
    expect(oldNumberCell.text().trim()).toBe('')
    expect(oldNumberCell.text()).not.toContain('NEW04495')
  })

  it('บรรทัดสำเนาที่พิมพ์เลขแล้ว: ไม่แสดง hint "ต้องกรอกก่อนยืนยัน" อีก', () => {
    const wrapper = createWrapper([makeCopyItemWithCode()])
    const childRow = wrapper.find('tr.copy-child-row')

    expect(childRow.text()).not.toContain('view.sale.saleOrder.productionNumberHint')
    // hint แยกที่บอกว่าคัดลอกมาจากเลขอะไร ("จากเลข NEW04495") ยังต้องอยู่
    expect(childRow.text()).toContain('view.sale.saleOrder.copyFromSource')
  })

  it('บรรทัดสำเนาที่ยังไม่พิมพ์เลข: ยังแสดง hint "ต้องกรอกก่อนยืนยัน" และคอลัมน์เก่ายังว่าง', () => {
    const wrapper = createWrapper([makeCopyItemWithoutCode()])
    const childRow = wrapper.find('tr.copy-child-row')

    expect(childRow.text()).toContain('view.sale.saleOrder.productionNumberHint')

    const oldNumberCell = childRow.findAll('td')[OLD_NUMBER_COL_INDEX]
    expect(oldNumberCell.text().trim()).toBe('')
  })
})

describe('StockItemsTable — sale:view-margin ซ่อนคอลัมน์ส่วนลด % ตามสิทธิ์', () => {
  it('มีสิทธิ์ (canViewMargin): เห็นคอลัมน์ส่วนลด % ทั้ง header/body และ footer colspan เป็น 2/18', () => {
    const wrapper = createWrapper([], { withMargin: true })

    const headerTexts = wrapper.findAll('thead th').map((th) => th.text())
    expect(headerTexts).toContain('view.sale.saleOrder.discountPercent')
    expect(wrapper.find('tbody input[placeholder="0"]').exists()).toBe(true)

    const footerRows = wrapper.findAll('tfoot tr')
    // แถวรวม (Total row) — คอลัมน์ที่ 8 (index 7) คือ getSumDiscountPrice ที่ colspan ขยับตามสิทธิ์
    expect(footerRows[0].findAll('td')[7].attributes('colspan')).toBe('2')
    // แถว "ส่วนลดพิเศษ" — แถว tfoot ถัดมา (copyItemsCount=0 จึงไม่มีแถว copy/doc subtotal คั่น)
    expect(footerRows[1].findAll('td')[0].attributes('colspan')).toBe('18')
  })

  it('ไม่มีสิทธิ์ (canViewMargin=false): ไม่เห็นคอลัมน์ส่วนลด % และ footer colspan เป็น 1/17', () => {
    const wrapper = createWrapper([], { withMargin: false })

    const headerTexts = wrapper.findAll('thead th').map((th) => th.text())
    expect(headerTexts).not.toContain('view.sale.saleOrder.discountPercent')
    expect(wrapper.find('tbody input[placeholder="0"]').exists()).toBe(false)

    const footerRows = wrapper.findAll('tfoot tr')
    expect(footerRows[0].findAll('td')[7].attributes('colspan')).toBe('1')
    expect(footerRows[1].findAll('td')[0].attributes('colspan')).toBe('17')
  })
})
