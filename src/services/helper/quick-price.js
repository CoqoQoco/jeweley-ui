// quick-price — สูตรตีราคาด่วน (Quick Price) ของสินค้าในคลัง
// pure function ล้วน ห้าม import Vue/Pinia/i18n — ผลที่หน้าจอต้องตรงกับที่ backend คำนวณซ้ำตอนบันทึก
//
// cost          = salePrice / markup
// goldCost      = goldWeight * goldPrice          (ราคาทองตอนสั่งผลิต)
// alloyCost     = alloyWeight * alloyPrice        (alloyWeight = goldWeight * (1 + goldLoss%) * factor ของกะรัต)
// goldCostTotal = goldCost + alloyCost            (ทุนทองตอนผลิต)
// costExGold    = cost - goldCostTotal            (ทุนเพชรพลอย + ค่าแรง)
// raw           = costExGold * (1 + percent / 100)
// quickPrice    = round(raw)                      ราคาเพชรพลอย + ค่าแรง + %
// saleGoldCost      = goldWeight * saleGoldPrice  (ราคาทอง ณ วันขาย — ว่าง = ใช้ goldPrice)
// saleGoldCostTotal = saleGoldCost + alloyCost
// totalPrice    = round(raw + saleGoldCostTotal)  บวกทุนทองใหม่ (ราคาวันขาย) กลับ
// round: rounding 0 → ปัด 2 ตำแหน่ง half-up | 10/100/1000 → ปัดขึ้นเป็นพหุคูณ
// ไม่ปัดระหว่างทาง — ปัดครั้งเดียวที่ราคาสุดท้าย
//
// บรรทัดที่ 3 (รวม Gold loss) — คิดเฉพาะเมื่อ goldLossPercent เป็นเลข >= 0 (ไม่กระทบ valid ของบรรทัดเดิม):
// goldWithLossCost   = goldWeight * (1 + goldLoss / 100) * saleGoldPrice
// goldLossCostTotal  = goldWithLossCost + alloyCost      (alloy ไม่บวก gold loss ซ้ำ)
// goldLossTotalRaw   = raw + goldLossCostTotal
// goldLossTotalPrice = round(goldLossTotalRaw)

import { roundHalfUp } from '../utils/money.js'

export const STALE_DAYS = 7
export const QUICK_PRICE_ROUNDINGS = [0, 10, 100, 1000]
export const DEFAULT_MARKUP = 3.5
export const DEFAULT_ROUNDING = 100
export const ALLOY_FACTORS = { '18K': 0.24, '14K': 0.41, '9K': 0.625 }
export const DEFAULT_GOLD_LOSS_PERCENT = 12

// factor ตามกะรัตจาก breakdown setting — ค่าที่ขาด/ไม่ถูกต้องใช้ ALLOY_FACTORS
export function buildAlloyFactors(setting) {
  const pick = (key, fallback) => {
    const num = Number(setting?.[`alloyFactor${key}`])
    return num > 0 ? num : fallback
  }
  return {
    '18K': pick('18K', ALLOY_FACTORS['18K']),
    '14K': pick('14K', ALLOY_FACTORS['14K']),
    '9K': pick('9K', ALLOY_FACTORS['9K'])
  }
}

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

// '18K' | '14K' | '9K' ที่คิด alloy ได้ — ค่าอื่น (Silver, 10K, N/A, ว่าง) = '' (ไม่คิด alloy)
export function getAlloyKarat(productionTypeSize) {
  const normalized = String(productionTypeSize || '').trim().toUpperCase().replace(/\s+/g, '')
  return Object.prototype.hasOwnProperty.call(ALLOY_FACTORS, normalized) ? normalized : ''
}

export function calcAlloyWeight(goldWeight, karat, goldLossPercent = DEFAULT_GOLD_LOSS_PERCENT, factors = ALLOY_FACTORS) {
  const weight = toNumber(goldWeight)
  const factor = factors?.[karat]
  const gl = goldLossPercent === '' || goldLossPercent === null || goldLossPercent === undefined ? NaN : Number(goldLossPercent)
  if (!factor || !(weight > 0) || !Number.isFinite(gl) || gl < 0) return 0
  return weight * (1 + gl / 100) * factor
}

// คืน { valid, error, cost, goldCost, alloyCost, goldCostTotal, saleGoldCost, saleGoldCostTotal, costExGold, raw, quickPrice, totalRaw, totalPrice,
//       goldLossValid, goldWithLossCost, goldLossCostTotal, goldLossTotalRaw, goldLossTotalPrice }
// error: 'salePrice' | 'markup' | 'goldWeight' | 'goldPrice' | 'saleGoldPrice' | 'alloyWeight' | 'alloyPrice' | 'percent' | 'costExGold' | null
// ค่าที่คำนวณได้คืนเท่าที่ได้แม้ยังไม่ valid (เพื่อโชว์ระหว่างกรอก)
export function calcQuickPrice({
  salePrice,
  markup,
  goldWeight,
  goldPrice,
  saleGoldPrice,
  alloyWeight,
  alloyPrice,
  percent,
  rounding,
  goldLossPercent
} = {}) {
  const sale = toNumber(salePrice)
  const mk = toNumber(markup)
  const weight = toNumber(goldWeight)
  const price = toNumber(goldPrice)
  const saleEmpty = saleGoldPrice === '' || saleGoldPrice === null || saleGoldPrice === undefined
  const salePriceGold = saleEmpty ? price : toNumber(saleGoldPrice)
  const pct = percent === '' || percent === null || percent === undefined ? 0 : Number(percent)

  const aWeight = alloyWeight === '' || alloyWeight === null || alloyWeight === undefined ? 0 : Number(alloyWeight)
  const aPrice = toNumber(alloyPrice)
  const gl = goldLossPercent === '' || goldLossPercent === null || goldLossPercent === undefined ? NaN : Number(goldLossPercent)
  const glValid = Number.isFinite(gl) && gl >= 0

  const result = {
    valid: false,
    error: null,
    cost: null,
    goldCost: null,
    alloyCost: null,
    goldCostTotal: null,
    saleGoldCost: null,
    saleGoldCostTotal: null,
    costExGold: null,
    raw: null,
    quickPrice: null,
    totalRaw: null,
    totalPrice: null,
    goldLossValid: false,
    goldWithLossCost: null,
    goldLossCostTotal: null,
    goldLossTotalRaw: null,
    goldLossTotalPrice: null
  }

  if (!(sale > 0)) return { ...result, error: 'salePrice' }
  if (!(mk > 0)) return { ...result, error: 'markup' }

  const cost = sale / mk
  result.cost = cost

  if (!(weight > 0)) return { ...result, error: 'goldWeight' }
  if (!(price > 0)) return { ...result, error: 'goldPrice' }
  if (!saleEmpty && !(salePriceGold > 0)) return { ...result, error: 'saleGoldPrice' }

  const goldCost = weight * price
  result.goldCost = goldCost
  const saleGoldCost = weight * salePriceGold
  result.saleGoldCost = saleGoldCost
  if (glValid) result.goldWithLossCost = weight * (1 + gl / 100) * salePriceGold

  if (!Number.isFinite(aWeight) || aWeight < 0) return { ...result, error: 'alloyWeight' }
  if (aWeight > 0 && !(aPrice >= 0)) return { ...result, error: 'alloyPrice' }
  if (aPrice < 0) return { ...result, error: 'alloyPrice' }

  const alloyCost = aWeight > 0 ? aWeight * aPrice : 0
  const goldCostTotal = goldCost + alloyCost
  const costExGold = cost - goldCostTotal
  result.alloyCost = alloyCost
  const saleGoldCostTotal = saleGoldCost + alloyCost
  result.goldCostTotal = goldCostTotal
  result.saleGoldCostTotal = saleGoldCostTotal
  result.costExGold = costExGold
  if (glValid) result.goldLossCostTotal = result.goldWithLossCost + alloyCost

  if (!Number.isFinite(pct) || pct < 0) return { ...result, error: 'percent' }
  if (!(costExGold > 0)) return { ...result, error: 'costExGold' }

  const raw = costExGold * (1 + pct / 100)
  const totalRaw = raw + saleGoldCostTotal

  const goldLoss = {}
  if (glValid) {
    const goldLossTotalRaw = raw + result.goldLossCostTotal
    Object.assign(goldLoss, {
      goldLossValid: true,
      goldLossTotalRaw,
      goldLossTotalPrice: applyRounding(goldLossTotalRaw, rounding)
    })
  }

  return {
    ...result,
    valid: true,
    raw,
    quickPrice: applyRounding(raw, rounding),
    totalRaw,
    totalPrice: applyRounding(totalRaw, rounding),
    ...goldLoss
  }
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
