import { describe, it, expect, vi } from 'vitest'
import { computeDocumentTotals, roundHalfUp } from '@/services/utils/money.js'
import { toMaterialInvoiceItems } from './material-invoice-items.js'
import { buildVatPrintModel } from '@/services/helper/print/vat-print-model-builder.js'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import { InvoiceSummaryPdfBuilder } from '@/services/helper/pdf/invoice-summary/invoice-summary-builder.js'

// ตัดการพึ่งพา company-info-store → axios-helper/router/pinia ที่ต้องมี app context จริง (เหมือน invoice-pdf-builder.spec.js)
vi.mock('@/config/company-info.js', () => ({
  COMPANY_INFO: { name: 'Test Co', address: '', phone: '', fax: '', email: '' },
  COMPANY_TAX_ID: '0000000000000',
  COMPANY_BANK: { bankName: '', accountName: '', accountNumber: '', swift: '', branch: '' },
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: {} })
}))

// ข้อมูลจริงจาก prod: SM260916004
const MATERIAL_ITEMS = [
  { itemNo: 1, gemCode: 'G001', gemName: 'Ruby', gemGroup: 'Ruby', gemShape: 'Round', gemSize: '3mm', gemGrade: 'A', description: null, qtyPiece: 11, qtyWeight: 16.2, priceInclVat: 2500, priceExclVat: 0, amount: 0, remark: null },
  { itemNo: 2, gemCode: 'G002', gemName: 'Sapphire', gemGroup: 'Sapphire', gemShape: 'Oval', gemSize: '4mm', gemGrade: 'B', description: null, qtyPiece: 4, qtyWeight: 13.97, priceInclVat: 4400, priceExclVat: 0, amount: 0, remark: null },
  { itemNo: 3, gemCode: 'G003', gemName: 'Emerald', gemGroup: 'Emerald', gemShape: 'Round', gemSize: '5mm', gemGrade: 'A', description: null, qtyPiece: 13, qtyWeight: 29.74, priceInclVat: 4100, priceExclVat: 0, amount: 0, remark: null }
]

// walk pdfmake node tree แบบ generic (stack/columns/table.body เป็น array ซ้อนกันได้หลายชั้น) หา text ที่ตรงกับค่าที่ให้มา
function treeContainsText(node, value) {
  if (node == null) return false
  if (Array.isArray(node)) return node.some((n) => treeContainsText(n, value))
  if (typeof node === 'object') {
    if (node.text === value) return true
    return Object.values(node).some((v) => treeContainsText(v, value))
  }
  return false
}

describe('toMaterialInvoiceItems', () => {
  const adapted = toMaterialInvoiceItems(MATERIAL_ITEMS, { vatPercent: 7, pieceLabel: 'เม็ด' })

  it('map ครบทุก field ตาม contract', () => {
    expect(adapted).toHaveLength(3)
    const first = adapted[0]
    expect(first.itemNo).toBe(1)
    expect(first.gemCode).toBe('G001')
    expect(first.isMaterial).toBe(true)
    expect(first.stockNumber).toBe('G001')
    expect(first.productNumber).toBe('')
    expect(first.description).toBe('Ruby 3mm')
    expect(first.productNameEN).toBe('Ruby 3mm (11 เม็ด)')
    expect(first.discountPercent).toBe(0)
    expect(first.qty).toBe(16.2)
    expect(first.qtyPiece).toBe(11)
    expect(first.qtyWeight).toBe(16.2)
    expect(first.materials).toEqual([{ type: 'Gem', typeCode: 'Round', qty: 11, weight: 16.2 }])
  })

  it('appraisalPrice คำนวณใหม่ดิบจาก priceInclVat/vat (ไม่ใช้ priceExclVat ที่ backend snapshot มา)', () => {
    expect(adapted[0].appraisalPrice).toBeCloseTo(2336.44859813084, 8)
  })

  it('description ใช้ description ที่ backend ส่งมาก่อนเสมอถ้ามี', () => {
    const withDesc = toMaterialInvoiceItems(
      [{ ...MATERIAL_ITEMS[0], description: 'Custom desc' }],
      { vatPercent: 7, pieceLabel: 'เม็ด' }
    )
    expect(withDesc[0].description).toBe('Custom desc')
    expect(withDesc[0].productNameEN).toBe('Custom desc (11 เม็ด)')
  })

  it('null/[] → []', () => {
    expect(toMaterialInvoiceItems(null, { vatPercent: 7 })).toEqual([])
    expect(toMaterialInvoiceItems([], { vatPercent: 7 })).toEqual([])
    expect(toMaterialInvoiceItems(undefined, { vatPercent: 7 })).toEqual([])
  })
})

describe('toMaterialInvoiceItems → computeDocumentTotals (rate 1, vat 7) — regression 223,902.18 → 223,902.00', () => {
  const adapted = toMaterialInvoiceItems(MATERIAL_ITEMS, { vatPercent: 7, pieceLabel: 'เม็ด' })

  it('grandTotalRounded === 223902', () => {
    const totals = computeDocumentTotals({ items: adapted, currencyRate: 1, currencyUnit: 'THB', vatPercent: 7 })
    expect(totals.grandTotalRounded).toBe(223902)
    expect(roundHalfUp(totals.subTotal, 2)).toBe(209254.21)
    expect(roundHalfUp(totals.vatAmount, 2)).toBe(14647.79)
  })
})

describe('buildVatPrintModel — adapted material items ต้องพิมพ์ทศนิยม 2 ตำแหน่งของกะรัต (เดิม 16.2 พิมพ์เป็น "16")', () => {
  const adapted = toMaterialInvoiceItems(MATERIAL_ITEMS, { vatPercent: 7, pieceLabel: 'เม็ด' })

  const invoice = {
    invoiceNo: 'INVM260921001',
    invoiceDate: '2026-09-21',
    customer: { name: 'Test Customer', address: '' },
    customerTaxId: '',
    currencyRate: 1,
    vatPercent: 7,
    items: adapted
  }

  function primitiveTexts(model) {
    return model.pages.flat().map((p) => p.text)
  }

  it('qty ของแต่ละแถวพิมพ์ 2 ตำแหน่งทศนิยม (16.20 / 13.97 / 29.74)', () => {
    const model = buildVatPrintModel(invoice, null, { showDecimals: true })
    const texts = primitiveTexts(model)
    expect(texts).toContain('16.20')
    expect(texts).toContain('13.97')
    expect(texts).toContain('29.74')
  })

  it('ราคาต่อหน่วยแถวแรกพิมพ์ 2,336.45 และจำนวนเงินแถวแรกพิมพ์ 37,850.47', () => {
    const model = buildVatPrintModel(invoice, null, { showDecimals: true })
    const texts = primitiveTexts(model)
    expect(texts).toContain('2,336.45')
    expect(texts).toContain('37,850.47')
  })

  it('ยอดรวม/VAT/สุทธิ พิมพ์ 209,254.21 / 14,647.79 / 223,902.00 และคำอ่านบาทถูกต้อง', () => {
    const model = buildVatPrintModel(invoice, null, { showDecimals: true })
    const texts = primitiveTexts(model)
    expect(texts).toContain('209,254.21')
    expect(texts).toContain('14,647.79')
    expect(texts).toContain('223,902.00')
    expect(texts).toContain('สองแสนสองหมื่นสามพันเก้าร้อยสองบาทถ้วน')
    expect(convertAmountToThaiText(223902)).toBe('สองแสนสองหมื่นสามพันเก้าร้อยสองบาทถ้วน')
  })

  it('สินค้าจำนวนเต็มยังพิมพ์ "1" (product behavior ต้องไม่เปลี่ยน)', () => {
    const productInvoice = {
      ...invoice,
      items: [{ productNameEN: 'Ring A', appraisalPrice: 1000, discountPercent: 0, qty: 1 }]
    }
    const model = buildVatPrintModel(productInvoice, null, { showDecimals: true })
    const texts = primitiveTexts(model)
    expect(texts).toContain('1')
    expect(texts).not.toContain('1.00')
  })
})

describe('InvoiceSummaryPdfBuilder — adapted material items (SM ref meta + qty 2 decimals)', () => {
  it('qty cell ของแถวที่ 1 คือ "16.20" และ meta แสดง SM260916004 แทน SO No.', () => {
    const adapted = toMaterialInvoiceItems(MATERIAL_ITEMS, { vatPercent: 7, pieceLabel: 'เม็ด' })

    const builder = new InvoiceSummaryPdfBuilder(
      adapted,
      { name: 'Test Customer' },
      '2026-09-21',
      { vatPercent: 7, refLabel: 'Ref. No.:', refNumber: 'SM260916004' },
      'THB',
      1,
      'INVM260921001',
      10
    )

    const docDef = builder.getDocDefinition()

    // แถวข้อมูลแรกของตารางรายการ (body[0] คือ header row) — คอลัมน์ qty คือ index 7 (ดู getItemsTableContent)
    // แยกจาก buildStatusBand ที่มี .table.body เหมือนกันด้วยจำนวนคอลัมน์ (ตารางรายการมี 10 คอลัมน์, status band มี 4)
    const itemsTable = docDef.content.find((block) => block?.table?.widths?.length === 10)
    expect(itemsTable).toBeTruthy()
    expect(itemsTable.table.body[1][7].text).toBe('16.20')

    // meta "Ref. No.: SM260916004" ต้องปรากฏในหัวเอกสาร (แทนที่ SO No.)
    expect(treeContainsText(docDef.content, 'SM260916004')).toBe(true)
    expect(treeContainsText(docDef.content, 'Ref. No.:')).toBe(true)
  })
})
