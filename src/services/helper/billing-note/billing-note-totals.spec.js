import { describe, it, expect } from 'vitest'
import { computeBillingTotals, isVatPercentLocked, effectiveBillingVatPercent, mapBillingNoteItems } from './billing-note-totals.js'

describe('computeBillingTotals', () => {
  const inc = { vatIncluded: true, subTotal: 347214.94, vatAmount: 24305.05, grandTotalRounded: 371519.99 }

  it('vatIncluded ล้วน: ก่อน VAT = grand − vat, VAT = vat ของใบ ไม่บวกซ้ำ', () => {
    expect(computeBillingTotals([inc], 7)).toEqual({ subTotal: 347214.94, vatAmount: 24305.05, grandTotal: 371519.99 })
    expect(computeBillingTotals([inc], 0).vatAmount).toBe(24305.05)
  })

  it('ใบเก่า: subTotal และ VAT = sub × %', () => {
    expect(computeBillingTotals([{ subTotal: 1000 }], 7)).toEqual({ subTotal: 1000, vatAmount: 70, grandTotal: 1070 })
  })

  it('ผสม: รวมแยกกลุ่ม', () => {
    const t = computeBillingTotals([inc, { subTotal: 1000 }], 7)
    expect(t).toEqual({ subTotal: 348214.94, vatAmount: 24375.05, grandTotal: 372589.99 })
  })

  it('ว่าง = 0', () => {
    expect(computeBillingTotals([], 7)).toEqual({ subTotal: 0, vatAmount: 0, grandTotal: 0 })
  })
})

describe('vat percent lock', () => {
  it('ล็อกเมื่อเลือก vatIncluded ล้วนเท่านั้น', () => {
    expect(isVatPercentLocked([{ vatIncluded: true }])).toBe(true)
    expect(isVatPercentLocked([{ vatIncluded: true }, {}])).toBe(false)
    expect(isVatPercentLocked([])).toBe(false)
    expect(effectiveBillingVatPercent([{ vatIncluded: true }], 0)).toBe(7)
    expect(effectiveBillingVatPercent([{}], 5)).toBe(5)
  })
})

describe('mapBillingNoteItems (edit mode)', () => {
  it('โน้ตใหม่ (vatIncluded): VAT = Σ vatAmount ของใบ และล็อก VAT %', () => {
    const items = mapBillingNoteItems({
      customerName: 'A',
      items: [
        { invoiceRunning: 'I1', amountBeforeVat: 1000, vatIncluded: true, vatAmount: 70, grandTotalRounded: 1070 },
        { invoiceRunning: 'I2', amountBeforeVat: 2000, vatIncluded: true, vatAmount: 140, grandTotalRounded: 2140 }
      ]
    })
    expect(items[0]).toMatchObject({ invoiceRunning: 'I1', subTotal: 1000, vatIncluded: true, vatAmount: 70, grandTotalRounded: 1070, customerName: 'A' })
    expect(computeBillingTotals(items, 0)).toEqual({ subTotal: 3000, vatAmount: 210, grandTotal: 3210 })
    expect(isVatPercentLocked(items)).toBe(true)
  })

  it('โน้ตเก่า (vatIncluded false/ไม่มี): คิดแบบเดิม sub × % และไม่ล็อก', () => {
    const items = mapBillingNoteItems({ items: [{ invoiceRunning: 'I1', amountBeforeVat: 1000 }, { invoiceRunning: 'I2', amountBeforeVat: 500, vatIncluded: false }] })
    expect(items.every((x) => x.vatIncluded === false)).toBe(true)
    expect(computeBillingTotals(items, 7)).toEqual({ subTotal: 1500, vatAmount: 105, grandTotal: 1605 })
    expect(isVatPercentLocked(items)).toBe(false)
  })
})
