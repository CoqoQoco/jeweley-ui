// catalog-price — กติการาคาขาย/ราคาลด (สไตล์ Shopee) ของ Catalog PDF
// pure function ล้วน ใช้ร่วมกันทั้งหน้า catalog (views/catalog) และ catalog-builder (sale/document)
//
// ราคา: priceFull (ราคาเต็ม) / priceSale (ราคาขาย) / priceCurrency ('THB' | 'USD')
// ไม่ prefill จากต้นทุนสินค้าเด็ดขาด — ผู้ใช้พิมพ์เองเท่านั้น

import { roundHalfUp } from '@/services/utils/money.js'

export const PRICE_CURRENCIES = ['THB', 'USD']
export const PRICE_ERROR_SALE_EXCEEDS_FULL = 'saleExceedsFull'
export const PRICE_ERROR_NEGATIVE = 'negative'

function toAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function toPositive(value) {
  const num = toAmount(value)
  return num !== null && num > 0 ? num : null
}

export function normalizeCurrency(currency) {
  return currency === 'USD' ? 'USD' : 'THB'
}

// 25000 -> 'THB 25,000' / 1087.5 -> 'USD 1,087.50' (ไม่ใช้ glyph ฿ เพราะฟอนต์ PDF ไม่มี)
export function formatPrice(amount, currency) {
  const num = toAmount(amount)
  if (num === null) return ''
  const decimals = Number.isInteger(num) ? 0 : 2
  const text = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return `${normalizeCurrency(currency)} ${text}`
}

// full>sale => strike | มีค่าเดียว/เท่ากัน => single | ไม่มี => none
// sale>full ถือว่าไม่ถูกต้อง (validatePrice ดักตอนบันทึก) — ถ้าหลุดมาให้แสดงราคาขายเดี่ยว
export function resolvePrice(item) {
  const full = toPositive(item && item.priceFull)
  const sale = toPositive(item && item.priceSale)
  const currency = normalizeCurrency(item && item.priceCurrency)

  if (full !== null && sale !== null) {
    if (full > sale) {
      return { kind: 'strike', currency, full, sale, fullText: formatPrice(full, currency), saleText: formatPrice(sale, currency) }
    }
    const amount = sale
    return { kind: 'single', currency, amount, amountText: formatPrice(amount, currency) }
  }
  if (full !== null || sale !== null) {
    const amount = full !== null ? full : sale
    return { kind: 'single', currency, amount, amountText: formatPrice(amount, currency) }
  }
  return { kind: 'none', currency }
}

export function hasPrice(item) {
  return resolvePrice(item).kind !== 'none'
}

export function countPriced(items) {
  const list = Array.isArray(items) ? items : []
  const withPrice = list.filter(hasPrice).length
  return { withPrice, withoutPrice: list.length - withPrice }
}

// ปัดครั้งเดียวที่ผลลัพธ์ 2 ตำแหน่ง (half-up) — ห้ามปัดระหว่างทาง
export function salePriceFromPercent(full, percent) {
  const f = toPositive(full)
  const p = toAmount(percent)
  if (f === null || p === null || p < 0 || p > 100) return null
  return roundHalfUp((f * (100 - p)) / 100, 2)
}

// ส่วนลด % จากราคาเต็ม/ราคาขาย (ไว้แสดง hint '≈ 50% off') — คืน null ถ้าไม่มีส่วนลด
export function percentFromPrices(full, sale) {
  const f = toPositive(full)
  const s = toPositive(sale)
  if (f === null || s === null || s >= f) return null
  return roundHalfUp(((f - s) / f) * 100, 2)
}

// คืน null ถ้าผ่าน หรือ error code ('saleExceedsFull' | 'negative')
export function validatePrice(item) {
  const full = toAmount(item && item.priceFull)
  const sale = toAmount(item && item.priceSale)
  if ((full !== null && full < 0) || (sale !== null && sale < 0)) return PRICE_ERROR_NEGATIVE
  if (full !== null && sale !== null && full > 0 && sale > full) return PRICE_ERROR_SALE_EXCEEDS_FULL
  return null
}

// แปลงค่าจาก input (string) เป็น number|null สำหรับเก็บ/ส่ง API
export function parsePriceInput(value) {
  return toAmount(value)
}
