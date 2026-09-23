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

// บรรทัดสินค้าจริงที่ยืนยันแล้ว ไม่มี invoice — ใช้เทียบว่า handle/ปุ่มลูกศรโผล่เฉพาะแถวนี้
function makeConfirmedStock(lineKey = 'parent-confirmed') {
  return {
    lineKey,
    stockNumber: 'NEW04496',
    stockNumberOrigin: 'NEW04496',
    isPlaceholder: false,
    isConfirm: true,
    invoice: null,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }
}

function createDragWrapper({ stockItems, copyItems = [], isViewMode = false } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore()
  authStore.permissions = []
  return mount(StockItemsTable, {
    global: {
      plugins: [pinia],
      mocks: { $t: tMock },
      stubs: {
        imagePreview: true
      }
    },
    props: {
      stockItems,
      copyItems,
      formSaleOrder: { currencyUnit: 'THB', currencyRate: 1 },
      isViewMode
    }
  })
}

describe('StockItemsTable — drag handle เห็นเฉพาะแถวที่ลากจัดลำดับได้ (isMovableRow)', () => {
  it('แถวสินค้ายืนยันแล้ว ไม่มี invoice ไม่ใช่ view mode: มี drag handle', () => {
    const wrapper = createDragWrapper({ stockItems: [makeConfirmedStock()] })
    expect(wrapper.findAll('.row-drag-handle').length).toBe(1)
  })

  it('บรรทัดรอผลิต/รอแปลง (placeholder) ที่ยืนยันแล้ว: ไม่มี drag handle', () => {
    const placeholderConfirmed = {
      ...makeConfirmedStock('parent-placeholder'),
      isPlaceholder: true,
      stockNumber: null,
      stockNumberOrigin: null
    }
    const wrapper = createDragWrapper({ stockItems: [placeholderConfirmed] })
    expect(wrapper.findAll('.row-drag-handle').length).toBe(0)
  })

  it('แถวที่ออกใบแจ้งหนี้แล้ว (มี invoice): ไม่มี drag handle', () => {
    const invoiced = { ...makeConfirmedStock('parent-invoiced'), invoice: 'INV001' }
    const wrapper = createDragWrapper({ stockItems: [invoiced] })
    expect(wrapper.findAll('.row-drag-handle').length).toBe(0)
  })

  it('isViewMode: ไม่มี drag handle แม้แถวยืนยันแล้ว', () => {
    const wrapper = createDragWrapper({ stockItems: [makeConfirmedStock()], isViewMode: true })
    expect(wrapper.findAll('.row-drag-handle').length).toBe(0)
  })

  it('บรรทัดลูก (copy line ผูกกับบรรทัดแม่) แม้ยืนยันแล้ว: ไม่มี drag handle (_rowKind !== stock)', () => {
    const parent = makeConfirmedStock()
    const child = {
      lineKey: 'child-confirmed',
      parentLineKey: parent.lineKey,
      isPlaceholder: true,
      stockNumber: 'S1',
      isConfirm: true,
      invoice: null,
      qty: 1,
      appraisalPrice: 100,
      discountPercent: 0
    }
    const wrapper = createDragWrapper({ stockItems: [parent], copyItems: [child] })
    // มีแค่บรรทัดแม่เท่านั้นที่มี handle — บรรทัดลูกไม่มี
    expect(wrapper.findAll('.row-drag-handle').length).toBe(1)
  })
})

describe('StockItemsTable — onRowsDrop / onRowsDragOver ยิง move-item-to ตาม payload ที่ล็อกไว้', () => {
  it('มี draggingLineKey + dropTargetLineKey ที่ valid: emit move-item-to พร้อม payload ถูกต้อง', async () => {
    const wrapper = createDragWrapper({
      stockItems: [makeConfirmedStock('a'), makeConfirmedStock('b')]
    })
    const vm = wrapper.vm.$.proxy

    vm.draggingLineKey = 'a'
    vm.dropTargetLineKey = 'b'
    vm.dropPosition = 'after'

    vm.onRowsDrop()

    expect(wrapper.emitted('move-item-to')).toBeTruthy()
    expect(wrapper.emitted('move-item-to')[0]).toEqual([
      { fromLineKey: 'a', toLineKey: 'b', position: 'after' }
    ])
    expect(vm.draggingLineKey).toBe(null)
    expect(vm.dropTargetLineKey).toBe(null)
    expect(vm.dropPosition).toBe(null)
  })

  it('ไม่มี dropTargetLineKey (drop นอกแถวที่ valid): ไม่ emit move-item-to', () => {
    const wrapper = createDragWrapper({
      stockItems: [makeConfirmedStock('a'), makeConfirmedStock('b')]
    })
    const vm = wrapper.vm.$.proxy

    vm.draggingLineKey = 'a'
    vm.dropTargetLineKey = null
    vm.dropPosition = null

    vm.onRowsDrop()

    expect(wrapper.emitted('move-item-to')).toBeFalsy()
  })

  it('onRowsDragOver: target ไม่ movable (มี invoice) — เคลียร์ dropTargetLineKey ไม่ set ค่าใหม่', () => {
    const wrapper = createDragWrapper({
      stockItems: [
        makeConfirmedStock('a'),
        { ...makeConfirmedStock('b'), invoice: 'INV001' }
      ]
    })
    const vm = wrapper.vm.$.proxy
    vm.draggingLineKey = 'a'
    vm.dropTargetLineKey = 'stale'
    vm.dropPosition = 'before'

    const tr = document.createElement('tr')
    tr.dataset.pIndex = '1' // แถว index 1 = แถวที่มี invoice ('b')
    tr.getBoundingClientRect = () => ({ top: 0, height: 40 })

    const fakeEvent = {
      target: { closest: () => tr },
      clientY: 10,
      dataTransfer: {}
    }

    vm.onRowsDragOver(fakeEvent)

    expect(vm.dropTargetLineKey).toBe(null)
    expect(vm.dropPosition).toBe(null)
  })

  it('onRowsDragOver: ไม่มี draggingLineKey — return ทันที ไม่แตะ state', () => {
    const wrapper = createDragWrapper({ stockItems: [makeConfirmedStock('a')] })
    const vm = wrapper.vm.$.proxy
    vm.draggingLineKey = null
    vm.dropTargetLineKey = 'unchanged'

    vm.onRowsDragOver({ target: { closest: () => null }, dataTransfer: {} })

    expect(vm.dropTargetLineKey).toBe('unchanged')
  })
})
