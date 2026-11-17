import { formatGoldDateStamp } from './barcode-zpl.js'

// ราคาทองต่อกรัมที่เป็นไปได้ (ข้อมูลจริง ~4,000) — นอกช่วงนี้ถือว่าแถวใช้ไม่ได้
export const MIN_PRICE_PER_GRAM = 1500
export const MAX_PRICE_PER_GRAM = 6000
export const DEFAULT_REFERENCE_GOLD_PRICE = 4000
const THAI_OFFSET_MS = 7 * 60 * 60 * 1000

const inRange = (value) => value >= MIN_PRICE_PER_GRAM && value <= MAX_PRICE_PER_GRAM

const GRAM_UNITS = ['', 'g', 'g.']

// ร้านคีย์ทั้งแบบต่อกรัมและยอดรวมแถว (ข้อมูลย้ายระบบเก็บรวม) → สร้างผู้สมัครทั้งสองแบบ แล้วเลือกที่ใกล้ราคาอ้างอิงที่สุด (เสมอ = ต่อกรัม)
function priceCandidates(material) {
  const price = Number(material?.price)
  if (!Number.isFinite(price) || price <= 0) return []
  const candidates = []
  if (inRange(price)) candidates.push(price)
  const weight = Number(material?.weight)
  const unit = String(material?.weightUnit || '').trim().toLowerCase()
  if (weight > 0 && GRAM_UNITS.includes(unit)) {
    const ppg = Math.round((price / weight) * 100) / 100
    if (inRange(ppg)) candidates.push(ppg)
  }
  return candidates
}

function toPricePerGram(material, reference) {
  const candidates = priceCandidates(material)
  if (candidates.length === 0) return { value: 0, ambiguous: false }
  const value = candidates.reduce((best, c) => (Math.abs(c - reference) < Math.abs(best - reference) ? c : best))
  return { value, ambiguous: candidates.length > 1 }
}

const isGold = (material) => String(material?.type || '').toLowerCase() === 'gold'

// ค่าอ้างอิงของทั้งชุด: ราคาที่กรอก > median ของชิ้นที่อ่านได้ค่าเดียว > 4000
export function resolveBatchReference(materialsList, fallbackGoldPrice) {
  const fallback = Number(fallbackGoldPrice)
  if (fallback > 0) return fallback
  const values = []
  ;(Array.isArray(materialsList) ? materialsList : []).forEach((materials) => {
    ;(Array.isArray(materials) ? materials : []).forEach((material) => {
      if (!isGold(material)) return
      const candidates = priceCandidates(material)
      if (candidates.length === 1) values.push(candidates[0])
    })
  })
  if (values.length === 0) return DEFAULT_REFERENCE_GOLD_PRICE
  values.sort((x, y) => x - y)
  const mid = Math.floor(values.length / 2)
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2
}

function parseUpdateDate(value) {
  if (!value) return null
  const text = String(value)
  const parsed = new Date(/(Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text}Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// วันที่ไทยของ instant (UTC+7) → Date ท้องถิ่นที่ field วัน/เดือน/ปี ตรงกับวันที่ไทย
function toThaiLocalDate(instant) {
  const thai = new Date(instant.getTime() + THAI_OFFSET_MS)
  return new Date(thai.getUTCFullYear(), thai.getUTCMonth(), thai.getUTCDate())
}

export function resolvePieceGoldStamp(materials, fallbackGoldPrice, now = new Date(), referencePrice = null) {
  const fallback = Number(fallbackGoldPrice)
  const reference = referencePrice > 0 ? referencePrice : fallback > 0 ? fallback : DEFAULT_REFERENCE_GOLD_PRICE
  let best = null
  ;(Array.isArray(materials) ? materials : []).forEach((material) => {
    if (!isGold(material)) return
    const { value: pricePerGram, ambiguous } = toPricePerGram(material, reference)
    if (!pricePerGram) return
    const updated = parseUpdateDate(material.updateDate)
    if (!best || (updated && (!best.updated || updated > best.updated))) {
      best = { pricePerGram, updated, ambiguous }
    }
  })

  if (best) {
    const date = best.updated ? toThaiLocalDate(best.updated) : now
    const stamp = formatGoldDateStamp(best.pricePerGram, date)
    if (stamp) return { stamp, source: 'material', pricePerGram: best.pricePerGram, ambiguous: best.ambiguous, date }
  }

  const fallbackStamp = formatGoldDateStamp(fallbackGoldPrice, now)
  if (fallbackStamp) return { stamp: fallbackStamp, source: 'fallback', pricePerGram: Number(fallbackGoldPrice), ambiguous: false, date: now }

  return { stamp: '', source: 'none', pricePerGram: 0, ambiguous: false, date: now }
}

// แสดงตราตรงกับที่พิมพ์จริงบนป้าย (ไม่มีเว้นวรรค)
export function formatStampDisplay(stamp) {
  return stamp || ''
}

export function isPriceOutOfRange(value) {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 && !inRange(price)
}
