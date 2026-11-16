import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvoicePdfBuilder } from './invoice-pdf-builder.js'
import { InvoiceSummaryPdfBuilder } from '../invoice-summary/invoice-summary-builder.js'

const getAzureBlobAsBase64 = vi.hoisted(() => vi.fn().mockResolvedValue('AAAA'))

vi.mock('@/config/company-info.js', () => ({
  COMPANY_INFO: { name: 'Test Co', address: '', phone: '', fax: '', email: '' },
  COMPANY_TAX_ID: '',
  COMPANY_BANK: {},
  getCompanyLogoUrl: () => '',
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: {} })
}))
vi.mock('@/config/azure-storage-config.js', () => ({ getAzureBlobAsBase64 }))

const items = () => [
  { appraisalPrice: 1000, discountPercent: 10, qty: 2, imagePath: 'a.jpg' },
  { appraisalPrice: 2500, discountPercent: 0, qty: 1, imagePath: 'b.jpg' },
  { appraisalPrice: 300, discountPercent: 5, qty: 3 }
]
const sale = { specialDiscount: 50, freightAndInsurance: 20, vatPercent: 7, deposit: 100 }

function make(Cls, extra = {}, itemsPerPage = 2) {
  return new Cls(items(), { name: 'C' }, '2026-09-11', { ...sale, ...extra }, 'US$', 32.5, 'INV-1', itemsPerPage)
}

const texts = (body) => body.map((r) => r.map((c) => c?.text ?? ''))

describe('InvoicePdfBuilder showImages', () => {
  beforeEach(() => getAzureBlobAsBase64.mockClear())

  it('default และ showImages=true ได้ตารางเหมือนกัน (10 คอลัมน์)', () => {
    const a = make(InvoicePdfBuilder)
    const b = make(InvoicePdfBuilder, { showImages: true })
    const ta = a.getFinalPageTableContent(a.data.slice(0, 2), 1, 2).table
    const tb = b.getFinalPageTableContent(b.data.slice(0, 2), 1, 2).table
    expect(ta.widths).toHaveLength(10)
    expect(tb.widths).toEqual(ta.widths)
    expect(texts(tb.body)).toEqual(texts(ta.body))
  })

  it('showImages=false: ทุกแถวน้อยลง 1 cell, widths ตรง, ยอดรวมเท่าเดิม', () => {
    const on = make(InvoicePdfBuilder)
    const off = make(InvoicePdfBuilder, { showImages: false })
    for (const [fn, args] of [
      ['getRegularPageTableContent', [0]],
      ['getFinalPageTableContent', [1, 2]],
      ['getEmptyPageContent', []]
    ]) {
      const call = (b) => (fn === 'getEmptyPageContent' ? b[fn]() : b[fn](b.data.slice(0, 2), ...args)).table
      const tOn = call(on)
      const tOff = call(off)
      expect(tOff.widths).toHaveLength(9)
      tOff.body.forEach((row, i) => {
        expect(row).toHaveLength(tOn.body[i].length - 1)
        expect(row).toHaveLength(tOff.widths.length)
      })
      // ข้อความทุก cell (ยกเว้นคอลัมน์รูป) เท่าเดิม → ยอดรวม/Grand Total ไม่เปลี่ยน
      expect(texts(tOff.body)).toEqual(texts(tOn.body).map((r) => r.filter((_, j) => j !== 1)))
    }
  })

  it('colSpan รวมของทุกแถว = จำนวนคอลัมน์', () => {
    const off = make(InvoicePdfBuilder, { showImages: false })
    const t = off.getFinalPageTableContent(off.data.slice(0, 2), 1, 2).table
    t.body.forEach((row) => {
      let n = 0
      for (let j = 0; j < row.length; j += row[j]?.colSpan || 1) n += row[j]?.colSpan || 1
      expect(n).toBe(t.widths.length)
    })
  })

  it('ความกว้างรวมของคอลัมน์ตัวเลขคงที่ (Description รับความกว้างเพิ่ม)', () => {
    const off = make(InvoicePdfBuilder, { showImages: false })
    const w = off.getRegularPageTableContent([], 0).table.widths
    const num = (x) => x.filter((v) => typeof v === 'number').reduce((a, b) => a + b, 0)
    const on = make(InvoicePdfBuilder).getRegularPageTableContent([], 0).table.widths
    expect(num(w)).toBe(num(on))
  })

  it('showImages=false ไม่โหลดรูป', async () => {
    const off = make(InvoicePdfBuilder, { showImages: false })
    const spy = vi.spyOn(off, 'prepareImages')
    off.logoBase64 = 'x'
    await off.preparePDF()
    expect(spy).not.toHaveBeenCalled()
    expect(getAzureBlobAsBase64).not.toHaveBeenCalled()

    const on = make(InvoicePdfBuilder)
    on.logoBase64 = 'x'
    await on.preparePDF()
    expect(getAzureBlobAsBase64).toHaveBeenCalled()
  })
})

describe('InvoiceSummaryPdfBuilder showImages', () => {
  beforeEach(() => getAzureBlobAsBase64.mockClear())

  it('ตัดคอลัมน์รูป, widths ตรง, ข้อความอื่นเท่าเดิม', () => {
    const on = make(InvoiceSummaryPdfBuilder)
    const off = make(InvoiceSummaryPdfBuilder, { showImages: false })
    const tOn = on.getItemsTableContent(on.data, 0).table
    const tOff = off.getItemsTableContent(off.data, 0).table
    expect(tOn.widths).toHaveLength(10)
    expect(tOff.widths).toHaveLength(9)
    tOff.body.forEach((row, i) => {
      expect(row).toHaveLength(9)
      expect(row).toHaveLength(tOn.body[i].length - 1)
    })
    expect(texts(tOff.body)).toEqual(texts(tOn.body).map((r) => r.filter((_, j) => j !== 1)))
  })

  it('showImages=false ไม่โหลดรูป และ totals เท่าเดิม', async () => {
    const on = make(InvoiceSummaryPdfBuilder)
    const off = make(InvoiceSummaryPdfBuilder, { showImages: false })
    expect(off.grandTotalRounded).toBe(on.grandTotalRounded)
    expect(off.netPayable).toBe(on.netPayable)
    await off.preparePDF()
    expect(getAzureBlobAsBase64).not.toHaveBeenCalled()
  })

  it('showImages=true (default) โหลดรูป', async () => {
    const on = make(InvoiceSummaryPdfBuilder)
    await on.preparePDF()
    expect(getAzureBlobAsBase64).toHaveBeenCalled()
  })
})
