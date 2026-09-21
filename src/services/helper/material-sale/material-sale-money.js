// material-sale-money.js — สูตรเงินขายวัตถุดิบ (SM) mirror ฝั่ง backend (MaterialSaleMoney.cs)
//
// D4 (ดู plan TK202609160001): priceExclVat = ราคารวม VAT ดิบ / (1 + vat%) ไม่ปัดเศษระหว่างทาง
// ยอดรวมทั้งใบคิดผ่าน computeDocumentTotals (ตัวกลางเดียวกับเอกสารขายอื่น) แล้วปัดครั้งเดียวที่ grandTotalRounded
import { computeDocumentTotals } from '@/services/utils/money.js'

/**
 * ราคาก่อน VAT ดิบ (ไม่ปัด) จากราคารวม VAT ต่อกะรัต
 * @param {number|string} priceInclVat
 * @param {number|string} vatPercent
 * @returns {number}
 */
export function materialPriceExclVat(priceInclVat, vatPercent) {
  const incl = Number(priceInclVat) || 0
  const vat = Number(vatPercent) || 0
  return incl / (1 + vat / 100)
}

/**
 * แปลงรายการ SM เป็น shape ที่ computeDocumentTotals ใช้ได้ (appraisalPrice/discountPercent/qty)
 * @param {Array} items - [{ priceInclVat, qtyWeight }]
 * @param {number|string} vatPercent
 * @returns {Array<{ appraisalPrice: number, discountPercent: number, qty: number }>}
 */
export function toMoneyItems(items, vatPercent) {
  const list = Array.isArray(items) ? items : []
  return list.map((item) => ({
    appraisalPrice: materialPriceExclVat(item?.priceInclVat, vatPercent),
    discountPercent: 0,
    qty: Number(item?.qtyWeight) || 0
  }))
}

/**
 * ยอดรวมทั้งใบ SM — ไม่มีส่วนลดพิเศษ/ส่วนเพิ่ม/ค่าขนส่ง (currencyRate คงที่ 1, THB เสมอ)
 * @param {Array} items
 * @param {number|string} vatPercent
 * @returns {ReturnType<typeof computeDocumentTotals>}
 */
export function computeMaterialTotals(items, vatPercent) {
  return computeDocumentTotals({
    items: toMoneyItems(items, vatPercent),
    currencyRate: 1,
    currencyUnit: 'THB',
    vatPercent: Number(vatPercent) || 0
  })
}
