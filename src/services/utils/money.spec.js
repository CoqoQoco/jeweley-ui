import { describe, it, expect } from 'vitest'
import {
  isForeignCurrency,
  moneyDecimals,
  roundHalfUp,
  roundMoney,
  convertedUnitPrice,
  lineAmount,
  computeDocumentTotals,
  formatDocumentMoney
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
  it('THB → 2 ตำแหน่ง เสมอ', () => {
    expect(moneyDecimals('THB')).toBe(2)
  })

  it('US$ (ต่างประเทศ) → 2 ตำแหน่งเหมือนกัน (มาตรฐานใหม่ — สกุลเงินไม่มีผลต่อความละเอียดอีกต่อไป)', () => {
    expect(moneyDecimals('US$')).toBe(2)
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

  it('สกุลต่างประเทศก็ปัด 2 ตำแหน่งเหมือนกัน (มาตรฐานใหม่ — เลิกปัดเป็นจำนวนเต็ม)', () => {
    expect(roundMoney(100.555, 'US$')).toBe(100.56)
    expect(roundMoney(100.554, 'US$')).toBe(100.55)
  })
})

describe('convertedUnitPrice', () => {
  it('เคสจริงจาก prod: ราคา 90300 ส่วนลด 67% เรต 32.5 (US$) → 916.8923 ไม่ปัดเศษ (ต้องไม่ใช่ 917)', () => {
    const price = convertedUnitPrice({ appraisalPrice: 90300, discountPercent: 67 }, 32.5, 'US$')
    expect(price).toBeCloseTo(916.8923, 4)
    expect(price).not.toBe(917)
  })

  it('THB ไม่ปัดเศษเช่นกัน: ราคา 1000 ส่วนลด 10% เรต 1 → 900 (ลงตัวพอดี)', () => {
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
  it('ราคาต่อชิ้นดิบ (ไม่ปัด) × qty เรต 32.5 (US$) qty=3 → ≈ 2750.6769', () => {
    const amount = lineAmount({ appraisalPrice: 90300, discountPercent: 67, qty: 3 }, 32.5, 'US$')
    expect(amount).toBeCloseTo(2750.6769, 4)
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

  it('subTotal = ผลบวกดิบของทุกแถว (ไม่ปัดเศษระหว่างทาง) ไม่ใช่ผลบวกของเลขที่ปัดแล้วแบบเดิม', () => {
    const items = [
      { appraisalPrice: 90300, discountPercent: 67, qty: 1 },
      { appraisalPrice: 12345.67, discountPercent: 15, qty: 3 },
      { appraisalPrice: 555.55, discountPercent: 0, qty: 5 }
    ]
    const totals = computeDocumentTotals({ items, currencyRate: 32.5, currencyUnit: 'US$' })

    const rawSum = items.reduce((sum, item) => sum + lineAmount(item, 32.5, 'US$'), 0)
    expect(totals.subTotal).toBeCloseTo(rawSum, 6)

    // เทียบกับพฤติกรรมเดิม (ปัดราคาต่อชิ้นเป็นจำนวนเต็มก่อนคูณ แล้วค่อยบวก) ต้องได้คนละค่า
    const oldWayRoundedFirstSum = items.reduce((sum, item) => {
      const rawPrice = (item.appraisalPrice * (1 - item.discountPercent / 100)) / 32.5
      const roundedPrice = Math.round(rawPrice)
      return sum + roundedPrice * item.qty
    }, 0)
    expect(totals.subTotal).not.toBeCloseTo(oldWayRoundedFirstSum, 2)
  })

  it('specialDiscount/specialAddition/freight ไม่ถูกปัด — ส่งผ่านเป็นตัวเลขดิบ', () => {
    const totals = computeDocumentTotals({
      items: [{ appraisalPrice: 100, discountPercent: 0, qty: 1 }],
      currencyRate: 1,
      currencyUnit: 'THB',
      specialDiscount: 12.345,
      specialAddition: 6.789,
      freight: 3.333
    })
    expect(totals.specialDiscount).toBe(12.345)
    expect(totals.specialAddition).toBe(6.789)
    expect(totals.freight).toBe(3.333)
  })

  it('VAT 7%: vatAmount คำนวณดิบ ไม่ปัดเป็น 2 ตำแหน่งก่อน', () => {
    const totals = computeDocumentTotals({
      items: [{ appraisalPrice: 1000, discountPercent: 0, qty: 1 }],
      currencyRate: 1,
      currencyUnit: 'THB',
      freight: 33.333,
      vatPercent: 7
    })
    // afterSpecial = 1033.333, vatAmount = 1033.333 * 0.07 = 72.33331 (มีเศษเกิน 2 ตำแหน่ง)
    expect(totals.vatAmount).toBeCloseTo(72.33331, 8)
    expect(totals.vatAmount).not.toBe(Number(totals.vatAmount.toFixed(2)))
  })

  it('grandTotalRounded = grandTotalRaw ปัดครึ่งขึ้น (half-up) เป็นทศนิยม 2 ตำแหน่ง และ roundingAdjustment = 0 เสมอ (เลิกใช้ ROUNDING แล้ว)', () => {
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

    expect(totals.grandTotalRounded).toBe(roundHalfUp(totals.grandTotalRaw, 2))
    expect(totals.roundingAdjustment).toBe(0)

    // ผลบวกของค่าดิบทุกองค์ประกอบ (ไม่ปัดสักจุด) ต้องเท่ากับ grandTotalRaw เป๊ะ
    const printedRawSum =
      totals.subTotal -
      totals.specialDiscount +
      totals.specialAddition +
      totals.freight +
      totals.vatAmount

    expect(printedRawSum).toBeCloseTo(totals.grandTotalRaw, 8)
  })
})

describe('formatDocumentMoney', () => {
  it('ปัดแสดงผล 2 ตำแหน่งเสมอ พร้อม thousand separator', () => {
    expect(formatDocumentMoney(1234.5)).toBe('1,234.50')
  })

  it('ค่าที่ไม่ใช่ตัวเลข → 0.00', () => {
    expect(formatDocumentMoney('abc')).toBe('0.00')
    expect(formatDocumentMoney(undefined)).toBe('0.00')
    expect(formatDocumentMoney(null)).toBe('0.00')
  })
})
