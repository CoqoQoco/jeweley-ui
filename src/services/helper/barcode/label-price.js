import { roundMoney } from '@/services/utils/money.js'

export const LABEL_PRICE_MODES = { CODE: 'code', FULL: 'full' }
export const LABEL_CURRENCIES = { THB: 'THB', USD: 'USD' }
// สัญลักษณ์ที่พิมพ์บนป้าย — GT800 พิมพ์ ฿ ไม่ได้ (ฟอนต์ ASCII) โหมดบาทจึงไม่มีสัญลักษณ์
export const LABEL_CURRENCY_SYMBOLS = { THB: '', USD: '$' }
export const LABEL_RATE_MIN = 20
export const LABEL_RATE_MAX = 50

export function isValidLabelRate(rate) {
  const num = Number(rate)
  return rate !== '' && rate != null && Number.isFinite(num) && num > 0
}

// เรทนอกช่วงที่ปกติ (เตือนเฉย ๆ ไม่บล็อก) — เรทว่าง/ไม่ใช่ตัวเลขไม่นับ (ถูกบล็อกอีกทาง)
export function isLabelRateOutOfRange(rate) {
  return isValidLabelRate(rate) && (Number(rate) < LABEL_RATE_MIN || Number(rate) > LABEL_RATE_MAX)
}

// ราคาบนป้ายอัตโนมัติจากราคาระบบ (บาท): ฿ = ราคาเดิม, $ = ÷ เรท ปัดครั้งเดียวด้วย roundMoney · ข้อมูลไม่พอ = null
export function computeLabelPrice(thbPrice, currency, rate) {
  if (thbPrice == null || thbPrice === '') return null
  const thb = Number(thbPrice)
  if (!Number.isFinite(thb) || thb <= 0) return null
  if (currency === LABEL_CURRENCIES.THB) return roundMoney(thb)
  if (!isValidLabelRate(rate)) return null
  return roundMoney(thb / Number(rate))
}

// ราคาที่แก้เอง (override) มาก่อน ไม่มี (null) = ค่าที่คำนวณ
export function pickLabelPrice(thbPrice, currency, rate, override) {
  // override ว่าง ('' ระหว่างพิมพ์) = ยังไม่มีราคา (บล็อกพิมพ์) · null/undefined = ไม่ได้แก้ ใช้ค่าที่คำนวณ
  if (override !== null && override !== undefined) {
    if (String(override).trim() === '') return null
    const num = Number(override)
    return Number.isFinite(num) ? num : null
  }
  return computeLabelPrice(thbPrice, currency, rate)
}

// เรียกตอน blur: ว่าง/ช่องว่างล้วน = ไม่ได้แก้ (null) เพื่อกลับไปแสดงราคาที่คำนวณ
export function normalizeLabelPriceInput(value) {
  if (value === null || value === undefined) return null
  return String(value).trim() === '' ? null : value
}

// ค่าที่โชว์ในช่องกรอก: ไม่ใช่จำนวนเต็ม -> 2 ตำแหน่งให้ตรงกับป้าย (769.70) · จำนวนเต็มคงเดิม
export function formatLabelPriceInput(value) {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value)
  return Number.isFinite(num) && !Number.isInteger(num) ? num.toFixed(2) : value
}

export function isUsableLabelPrice(value) {
  return value != null && Number.isFinite(Number(value)) && Number(value) > 0
}

// ข้อความราคาบนป้าย: สัญลักษณ์ + ตัวเลข ไม่มีจุลภาค ตัด .00 ทิ้ง ไม่งั้น 2 ตำแหน่ง · ราคาใช้ไม่ได้ = ''
export function formatLabelPriceText(value, currency) {
  if (!isUsableLabelPrice(value)) return ''
  const rounded = roundMoney(Number(value))
  const body = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
  return `${LABEL_CURRENCY_SYMBOLS[currency] || ''}${body}`
}
