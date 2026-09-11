import { describe, it, expect } from 'vitest'
import {
  isForeignCurrency,
  moneyDecimals,
  roundHalfUp,
  roundMoney,
  roundToInteger,
  convertedUnitPrice,
  lineAmount,
  computeDocumentTotals
} from './money.js'

describe('isForeignCurrency', () => {
  it('THB → false', () => {
    expect(isForeignCurrency('THB')).toBe(false)
  })

  it('thb (lowercase) → false', () => {
    expect(isForeignCurrency('thb')).toBe(false)
  })

  it(' THB  (มี space) → false', () => {
    expect(isForeignCurrency('  THB  ')).toBe(false)
  })

  it('US$ → true', () => {
    expect(isForeignCurrency('US$')).toBe(true)
  })

  it('ว่าง/undefined/null → true', () => {
    expect(isForeignCurrency('')).toBe(true)
    expect(isForeignCurrency(undefined)).toBe(true)
    expect(isForeignCurrency(null)).toBe(true)
  })
})

describe('moneyDecimals', () => {
  it('THB → 2 ตำแหน่ง', () => {
    expect(moneyDecimals('THB')).toBe(2)
  })

  it('US$ (ต่างประเทศ) → 0 ตำแหน่ง', () => {
    expect(moneyDecimals('US$')).toBe(0)
  })
})

describe('roundHalfUp', () => {
  it('1.005 ที่ 2 ตำแหน่ง → 1.01 (กัน floating-point bug ของ JS)', () => {
    expect(roundHalfUp(1.005, 2)).toBe(1.01)
  })

  it('8192.005 ที่ 2 ตำแหน่ง → 8192.01', () => {
    expect(roundHalfUp(8192.005, 2)).toBe(8192.01)
  })

  it('0.5 → 1 (half-up)', () => {
    expect(roundHalfUp(0.5, 0)).toBe(1)
  })

  it('2.5 → 3 (half-up ไม่ใช่ banker rounding)', () => {
    expect(roundHalfUp(2.5, 0)).toBe(3)
  })

  it('-0.5 → -1 (away-from-zero)', () => {
    expect(roundHalfUp(-0.5, 0)).toBe(-1)
  })

  it('-2.5 → -3 (away-from-zero)', () => {
    expect(roundHalfUp(-2.5, 0)).toBe(-3)
  })

  it('916.892307692 ที่ 0 ตำแหน่ง → 917 (เคสราคาจริงจาก prod)', () => {
    expect(roundHalfUp(916.892307692, 0)).toBe(917)
  })

  it('ค่าที่ไม่ใช่ตัวเลข → 0', () => {
    expect(roundHalfUp('abc')).toBe(0)
    expect(roundHalfUp(NaN)).toBe(0)
    expect(roundHalfUp(undefined)).toBe(0)
    expect(roundHalfUp(null)).toBe(0)
  })

  it('0 → 0', () => {
    expect(roundHalfUp(0, 2)).toBe(0)
  })

  it('decimals default = 0', () => {
    expect(roundHalfUp(100.6)).toBe(101)
  })
})

describe('roundMoney', () => {
  it('THB ปัด 2 ตำแหน่ง', () => {
    expect(roundMoney(100.555, 'THB')).toBe(100.56)
  })

  it('สกุลต่างประเทศ ปัดเป็นจำนวนเต็ม (half-up)', () => {
    expect(roundMoney(100.5, 'US$')).toBe(101)
    expect(roundMoney(100.4, 'US$')).toBe(100)
  })
})

describe('roundToInteger', () => {
  it('1234.5 → 1235', () => {
    expect(roundToInteger(1234.5)).toBe(1235)
  })

  it('1234.4999 → 1234', () => {
    expect(roundToInteger(1234.4999)).toBe(1234)
  })

  it('-1234.5 → -1235 (away-from-zero, ไม่ใช่ ceil)', () => {
    expect(roundToInteger(-1234.5)).toBe(-1235)
  })
})

describe('convertedUnitPrice', () => {
  it('เคสจริงจาก prod: ราคา 90300 ส่วนลด 67% เรต 32.5 (US$) → 917 (ไม่ใช่ 916)', () => {
    const price = convertedUnitPrice({ appraisalPrice: 90300, discountPercent: 67 }, 32.5, 'US$')
    expect(price).toBe(917)
  })

  it('THB ปัด 2 ตำแหน่ง: ราคา 1000 ส่วนลด 10% เรต 1 → 900', () => {
    const price = convertedUnitPrice({ appraisalPrice: 1000, discountPercent: 10 }, 1, 'THB')
    expect(price).toBe(900)
  })

  it('currencyRate=0 หรือไม่ส่งมา → fallback เป็น 1', () => {
    const price = convertedUnitPrice({ appraisalPrice: 100, discountPercent: 0 }, 0, 'THB')
    expect(price).toBe(100)
  })

  it('item ว่าง/ไม่มี field → 0', () => {
    expect(convertedUnitPrice({}, 1, 'THB')).toBe(0)
  })
})

describe('lineAmount', () => {
  it('ราคาต่อชิ้นที่ปัดแล้ว × qty (ปัดก่อนคูณเสมอ)', () => {
    const amount = lineAmount({ appraisalPrice: 90300, discountPercent: 67, qty: 3 }, 32.5, 'US$')
    expect(amount).toBe(917 * 3)
  })

  it('qty ไม่ส่งมา → 0', () => {
    expect(lineAmount({ appraisalPrice: 1000, discountPercent: 0 }, 1, 'THB')).toBe(0)
  })
})

describe('computeDocumentTotals', () => {
  it('items ว่าง → ทุกยอดเป็น 0', () => {
    const totals = computeDocumentTotals({ items: [], currencyRate: 1, currencyUnit: 'THB' })
    expect(totals.subTotal).toBe(0)
    expect(totals.grandTotalRaw).toBe(0)
    expect(totals.grandTotalRounded).toBe(0)
    expect(totals.roundingAdjustment).toBe(0)
  })

  it('subTotal = ผลบวกของ lineAmount ทุกแถว (ปัดต่อแถวก่อนบวก)', () => {
    const items = [
      { appraisalPrice: 90300, discountPercent: 67, qty: 1 }, // 917
      { appraisalPrice: 12345.67, discountPercent: 15, qty: 3 },
      { appraisalPrice: 555.55, discountPercent: 0, qty: 5 }
    ]
    const totals = computeDocumentTotals({ items, currencyRate: 32.5, currencyUnit: 'US$' })
    const expectedSum = items.reduce(
      (sum, item) => sum + lineAmount(item, 32.5, 'US$'),
      0
    )
    expect(totals.subTotal).toBe(expectedSum)
  })

  it('F.O.B − ส่วนลด + ส่วนเพิ่ม + ค่าขนส่ง + VAT + ROUNDING = C.I.F เป๊ะ', () => {
    const items = [
      { appraisalPrice: 90300, discountPercent: 67, qty: 1 },
      { appraisalPrice: 12345.67, discountPercent: 15, qty: 3 },
      { appraisalPrice: 555.55, discountPercent: 0, qty: 5 },
      { appraisalPrice: 999.99, discountPercent: 33.33, qty: 2 }
    ]
    const totals = computeDocumentTotals({
      items,
      currencyRate: 32.5,
      currencyUnit: 'US$',
      specialDiscount: 250,
      specialAddition: 75,
      freight: 120,
      vatPercent: 7
    })

    const printedSum =
      totals.subTotal -
      totals.specialDiscount +
      totals.specialAddition +
      totals.freight +
      totals.vatAmount +
      totals.roundingAdjustment

    expect(printedSum).toBe(totals.grandTotalRounded)
  })

  it('ยอดสุดท้ายปัดด้วย half-up ไม่ใช่ ceil — เศษ 0.33 ต้องปัดลง (ceil เดิมจะปัดขึ้นผิดเป็น 104)', () => {
    const totals = computeDocumentTotals({
      items: [{ appraisalPrice: 100, discountPercent: 0, qty: 1 }],
      currencyRate: 1,
      currencyUnit: 'THB',
      vatPercent: 3.33
    })
    // subTotal=100, vatAmount=roundMoney(3.33)=3.33, grandTotalRaw=103.33 → half-up ปัดลงเป็น 103 (ceil เดิมจะได้ 104)
    expect(totals.grandTotalRaw).toBeCloseTo(103.33, 5)
    expect(totals.grandTotalRounded).toBe(103)
    expect(totals.roundingAdjustment).toBeCloseTo(-0.33, 5)
  })
})
