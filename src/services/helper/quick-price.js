// quick-price — สูตรตีราคาด่วน (Quick Price) ของสินค้าในคลัง
// pure function ล้วน ห้าม import Vue/Pinia/i18n — ผลที่หน้าจอต้องตรงกับที่ backend คำนวณซ้ำตอนบันทึก
//
// cost        = salePrice / markup
// costExGold  = cost - goldWeight * goldPrice
// raw         = costExGold * (1 + percent / 100)
// quickPrice  = rounding 0 → ปัด 2 ตำแหน่ง half-up | 10/100/1000 → ปัดขึ้นเป็นพหุคูณ
// ไม่ปัดระหว่างทาง — ปัดครั้งเดียวที่ราคาสุดท้าย

import { roundHalfUp } from '../utils/money.js'

export const STALE_DAYS = 7
export const QUICK_PRICE_ROUNDINGS = [0, 10, 100, 1000]
export const DEFAULT_MARKUP = 3.5
export const DEFAULT_ROUNDING = 100

const MS_PER_DAY = 24 * 60 * 60 * 1000

const moneyFormat = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// รูปแบบเดียวกับ column format 'decimal2' ของ DataTableWithPaging — ว่าง/ไม่ใช่ตัวเลข = '—'
export function formatMoney2(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  return Number.isFinite(num) ? moneyFormat.format(num) : '—'
}

const plainFormat = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

// ราคาทอง/กรัมแบบสั้น (2,000 / 2,050.5) — ว่าง/ไม่ใช่ตัวเลข = '—'
export function formatPlainNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  return Number.isFinite(num) ? plainFormat.format(num) : '—'
}

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return NaN
  return Number(value)
}

export function applyRounding(raw, rounding) {
  const step = Number(rounding) || 0
  if (!QUICK_PRICE_ROUNDINGS.includes(step) || step === 0) return roundHalfUp(raw, 2)
  // roundHalfUp(…, 6) กัน float drift เช่น 72.00000000000001 ที่ทำให้ ceil เกินไป 1 ขั้น
  return Math.ceil(roundHalfUp(raw / step, 6)) * step
}

// คืน { valid, error, cost, goldCost, costExGold, raw, quickPrice }
// error: 'salePrice' | 'markup' | 'goldWeight' | 'goldPrice' | 'percent' | 'costExGold' | null
// cost/goldCost/costExGold คืนเท่าที่คำนวณได้แม้ยังไม่ valid (เพื่อโชว์ระหว่างกรอก)
export function calcQuickPrice({ salePrice, markup, goldWeight, goldPrice, percent, rounding } = {}) {
  const sale = toNumber(salePrice)
  const mk = toNumber(markup)
  const weight = toNumber(goldWeight)
  const price = toNumber(goldPrice)
  const pct = percent === '' || percent === null || percent === undefined ? 0 : Number(percent)

  const result = { valid: false, error: null, cost: null, goldCost: null, costExGold: null, raw: null, quickPrice: null }

  if (!(sale > 0)) return { ...result, error: 'salePrice' }
  if (!(mk > 0)) return { ...result, error: 'markup' }

  const cost = sale / mk
  result.cost = cost

  if (!(weight > 0)) return { ...result, error: 'goldWeight' }
  if (!(price > 0)) return { ...result, error: 'goldPrice' }

  const goldCost = weight * price
  const costExGold = cost - goldCost
  result.goldCost = goldCost
  result.costExGold = costExGold

  if (!Number.isFinite(pct) || pct < 0) return { ...result, error: 'percent' }
  if (!(costExGold > 0)) return { ...result, error: 'costExGold' }

  const raw = costExGold * (1 + pct / 100)
  return { ...result, valid: true, raw, quickPrice: applyRounding(raw, rounding) }
}

const isGramUnit = (unit) => {
  const normalized = String(unit || '').trim().toLowerCase().replace(/\./g, '')
  return normalized === '' || ['g', 'gm', 'gms', 'gram', 'grams'].includes(normalized)
}

const sumWeightByType = (materials, type) =>
  (materials || [])
    .filter((m) => String(m?.type || '').toLowerCase() === type && isGramUnit(m?.weightUnit))
    .reduce((sum, m) => sum + (Number(m.weight) || 0), 0)

// น้ำหนักโลหะเริ่มต้นจากวัตถุดิบของชิ้น: ทองก่อน ไม่มีทองใช้เงิน — คืน { weight, source: 'gold' | 'silver' | null }
export function getMetalWeight(materials) {
  const gold = sumWeightByType(materials, 'gold')
  if (gold > 0) return { weight: gold, source: 'gold' }
  const silver = sumWeightByType(materials, 'silver')
  if (silver > 0) return { weight: silver, source: 'silver' }
  return { weight: 0, source: null }
}

export function getQuickPriceAgeDays(dateValue, now = new Date()) {
  if (!dateValue) return null
  const time = new Date(dateValue).getTime()
  if (!Number.isFinite(time)) return null
  return Math.max(0, Math.floor((now.getTime() - time) / MS_PER_DAY))
}

export function isQuickPriceStale(dateValue, now = new Date()) {
  const days = getQuickPriceAgeDays(dateValue, now)
  return days !== null && days > STALE_DAYS
}
