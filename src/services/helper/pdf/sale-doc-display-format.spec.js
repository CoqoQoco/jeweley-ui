import { describe, it, expect, vi } from 'vitest'
import { SaleOrderPdfBuilder } from './sale-order/sale-order-pdf-builder.js'
import { InvoicePdfBuilder as QuotationPdfBuilder } from './quotation/quotation-pdf-builder.js'
import { InvoicePdfBuilder } from './invoice/invoice-pdf-builder.js'

vi.mock('@/config/company-info.js', () => ({
  COMPANY_INFO: { name: 'Test Co', address: '', phone: '', fax: '', email: '' },
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: {} })
}))

const num = (text) => parseFloat(String(text).replace(/,/g, ''))

// ราคาต่อชิ้นมีเศษหลายตำแหน่ง (เช่น 11072/33...) — ถ้าปัดเป็นจำนวนเต็มรายแถวผลบวกจะไม่เท่ายอดรวม
const items = [
  { appraisalPrice: 11072, discountPercent: 0, qty: 1, materials: [{ type: 'Diamond', weight: 0.235, qty: 3, typeCode: 'DIA' }] },
  { appraisalPrice: 10000, discountPercent: 33.33, qty: 1, materials: [] },
  { appraisalPrice: 3333, discountPercent: 0, qty: 1, materials: [] }
].map((it) => ({ ...it, appraisalPrice: it.appraisalPrice / 33 }))

const builders = {
  saleOrder: (showDecimals) =>
    new SaleOrderPdfBuilder({ items }, { currencyUnit: 'USD', currencyRate: 1, showDecimals }),
  quotation: (showDecimals) =>
    new QuotationPdfBuilder(items, { showDecimals }, '2026-11-06', 0, 0, 'Q1', 'USD', 1, 10),
  invoice: (showDecimals) =>
    new InvoicePdfBuilder(items, {}, '2026-11-06', { showDecimals }, 'USD', 1, 'INV1', 10)
}

describe.each(Object.keys(builders))('%s PDF display format', (name) => {
  it('default (ไม่ส่ง showDecimals) พิมพ์ยอดแถว 2 ตำแหน่ง และผลบวกแถว = Total', () => {
    const builder = builders[name]()
    const body = builder.buildRegularTableBody(items, 0)
    const rows = body.slice(1, 1 + items.length)
    const totalRow = body[body.length - 1]
    const printed = rows.map((r) => r[9].text)
    printed.forEach((t) => expect(t).toMatch(/\.\d{2}$/))
    const sum = printed.reduce((s, t) => s + num(t), 0)
    expect(Math.abs(sum - num(totalRow[9].text))).toBeLessThanOrEqual(0.01)
  })

  it('สวิตช์ showDecimals=false ยังใช้งานได้ (ปัดจำนวนเต็ม)', () => {
    const builder = builders[name](false)
    const body = builder.buildRegularTableBody(items, 0)
    expect(body[1][9].text).not.toMatch(/\./)
  })

  it('น้ำหนักเพชรในแถว (cts) พิมพ์ 3 ตำแหน่ง ส่วนแถวรวมเพชรก็ 3 ตำแหน่ง', () => {
    const builder = builders[name]()
    const body = builder.buildRegularTableBody(items, 0)
    const diamondCell = body[1][5]
    expect(diamondCell.table.body[0][1].text).toBe('0.235')
    const totalRow = body[body.length - 1]
    expect(totalRow[5].text).toBe('0.235')
  })
})

describe('formatWeight', () => {
  it('รองรับ decimals และ NaN', () => {
    const b = builders.saleOrder()
    expect(b.formatWeight(1.5)).toBe('1.50')
    expect(b.formatWeight(0.2349, 3)).toBe('0.235')
    expect(b.formatWeight('x', 3)).toBe('0.000')
  })
})
