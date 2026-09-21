import { describe, it, expect } from 'vitest'
import { roundHalfUp } from '@/services/utils/money.js'
import { materialPriceExclVat, toMoneyItems, computeMaterialTotals } from './material-sale-money.js'

// ข้อมูลจริงจาก prod: SM260916004 — เจอบั๊กยอดเงิน 223,902.18 (ปัด priceExclVat รายบรรทัด + fix 1.07)
// ยอดที่ถูกต้องต้องเท่ากับ Σ(ราคารวม VAT × กะรัต) = 223,902.00 พอดี (ดู plan D4)
const SM_ITEMS = [
  { qtyPiece: 11, qtyWeight: 16.2, priceInclVat: 2500 },
  { qtyPiece: 4, qtyWeight: 13.97, priceInclVat: 4400 },
  { qtyPiece: 13, qtyWeight: 29.74, priceInclVat: 4100 }
]

function sumInclTimesCt(items) {
  return items.reduce((sum, it) => sum + it.priceInclVat * it.qtyWeight, 0)
}

describe('materialPriceExclVat', () => {
  it('vat 7%: 2500 → ≈ 2336.44859813084 (ดิบ ไม่ปัด)', () => {
    expect(materialPriceExclVat(2500, 7)).toBeCloseTo(2336.44859813084, 8)
  })

  it('vat 0 → คืนราคาเดิม', () => {
    expect(materialPriceExclVat(2500, 0)).toBe(2500)
  })

  it('ค่าไม่ใช่ตัวเลข → 0', () => {
    expect(materialPriceExclVat(null, 7)).toBe(0)
    expect(materialPriceExclVat(undefined, 7)).toBe(0)
  })
})

describe('toMoneyItems', () => {
  it('แปลงเป็น shape appraisalPrice/discountPercent/qty ให้ computeDocumentTotals ใช้ได้', () => {
    const result = toMoneyItems(SM_ITEMS, 7)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      appraisalPrice: materialPriceExclVat(2500, 7),
      discountPercent: 0,
      qty: 16.2
    })
  })

  it('null/[] → []', () => {
    expect(toMoneyItems(null, 7)).toEqual([])
    expect(toMoneyItems([], 7)).toEqual([])
  })
})

describe('computeMaterialTotals — regression SM260916004 (เดิมได้ 223,902.18 ผิด ต้องได้ 223,902.00)', () => {
  it('subTotal/vatAmount/grandTotalRounded ตรงตามที่คำนวณมือ (vat 7%)', () => {
    const totals = computeMaterialTotals(SM_ITEMS, 7)

    expect(roundHalfUp(totals.subTotal, 2)).toBe(209254.21)
    expect(roundHalfUp(totals.vatAmount, 2)).toBe(14647.79)
    expect(totals.grandTotalRounded).toBe(223902)
    expect(totals.grandTotalRounded).not.toBe(223902.18)
  })

  it('grandTotalRounded == roundHalfUp(Σ ราคารวมVAT × กะรัต) ที่ vat 7%', () => {
    const totals = computeMaterialTotals(SM_ITEMS, 7)
    expect(totals.grandTotalRounded).toBe(roundHalfUp(sumInclTimesCt(SM_ITEMS), 2))
  })

  it('grandTotalRounded ไม่ขึ้นกับ vat% (ปรับ vat แล้วยอดรวมยังเท่า Σ incl×ct เดิม) — ทดสอบ vat 10%', () => {
    const totals = computeMaterialTotals(SM_ITEMS, 10)
    expect(totals.grandTotalRounded).toBe(roundHalfUp(sumInclTimesCt(SM_ITEMS), 2))
    expect(totals.grandTotalRounded).toBe(223902)
  })

  it('items ว่าง → ทุกยอดเป็น 0', () => {
    const totals = computeMaterialTotals([], 7)
    expect(totals.subTotal).toBe(0)
    expect(totals.grandTotalRounded).toBe(0)
  })
})
