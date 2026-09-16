import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import StockItemsTable from './stock-items-table.vue'

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

function createWrapper(copyItems) {
  const pinia = createPinia()
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
