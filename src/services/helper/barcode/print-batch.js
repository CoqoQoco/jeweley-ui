// helper ล้วน (ไม่แตะ store/DOM) สำหรับหน้าพิมพ์บาร์โค้ดหลายรายการ
import { normalizeStockNumber } from '../stock-number.js'

export const MAX_PASTE_CODES = 200
export const MAX_LABELS_PER_RUN = 200
export const MAX_LIST_ROWS = 500
export const MAX_COPIES_PER_ROW = 99

export const COST_LABEL_TYPES = ['cost-with-gold', 'cost-no-gold', 'tag-with-gold', 'tag-no-gold']

export function isCostLabelType(type) {
  return COST_LABEL_TYPES.includes(type)
}

// แยกรหัสจากข้อความที่วาง: ขึ้นบรรทัดใหม่ / คอมมา / เว้นวรรค → trim → ตัดค่าว่าง → dedupe (คงลำดับแรกสุด)
export function parseCodeList(text, cap = MAX_PASTE_CODES) {
  const seen = new Set()
  const all = []
  String(text ?? '')
    .split(/[\s,;]+/)
    .map((code) => code.trim())
    .filter(Boolean)
    .forEach((code) => {
      const key = normalizeStockNumber(code)
      if (seen.has(key)) return
      seen.add(key)
      all.push(code)
    })

  const codes = all.slice(0, cap)
  return { codes, total: all.length, truncated: all.length > cap }
}

// รัน worker ขนานไม่เกิน limit — คืนผลตามลำดับ items แบบ allSettled ({status,value|reason})
export async function runWithConcurrency(items, limit, worker) {
  const list = Array.from(items || [])
  const results = new Array(list.length)
  const size = Math.max(1, Math.floor(Number(limit)) || 1)
  let cursor = 0

  const runner = async () => {
    while (cursor < list.length) {
      const index = cursor++
      try {
        results[index] = { status: 'fulfilled', value: await worker(list[index], index) }
      } catch (reason) {
        results[index] = { status: 'rejected', reason }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(size, list.length) }, runner))
  return results
}

// PK จริงของ piece = stock_number + product_code (stock_number เดี่ยว ๆ ซ้ำได้)
export function buildRowKey(row) {
  return `${row?.stockNumber ?? ''}|${row?.productCode ?? ''}`
}

export function normalizeCopies(value, max = Infinity) {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, max)
}

// รวมแถวที่ค้นเจอเข้ารายการเดิม โดยไม่ซ้ำ rowKey (แถวเดิมชนะ)
export function mergeRowsByKey(existing, incoming) {
  const keys = new Set(existing.map((row) => row.rowKey))
  const merged = [...existing]
  incoming.forEach((row) => {
    if (keys.has(row.rowKey)) return
    keys.add(row.rowKey)
    merged.push(row)
  })
  return merged
}

export function summarizeSelection(rows) {
  const list = rows || []
  return {
    count: list.length,
    labels: list.reduce((sum, row) => sum + normalizeCopies(row.printCount), 0)
  }
}

// ราคาต้นทุนจากรายการ GetStockCostDetail — logic เดียวกับ barcode-view (price ไม่รวมทอง / originPrice รวมทั้งหมด)
export function sumCostLines(costRes) {
  const lines = Array.isArray(costRes) ? costRes : []
  if (lines.length === 0) return { hasCost: false, price: null, originPrice: null }
  return {
    hasCost: true,
    price: lines.filter((x) => x.nameGroup !== 'Gold').reduce((sum, x) => sum + (x.totalPrice ?? 0), 0),
    originPrice: lines.reduce((sum, x) => sum + (x.totalPrice ?? 0), 0)
  }
}

// ราคาที่พิมพ์บนป้ายตามแท็บ — mirror previewPrice ของ barcode-view (0/ว่าง → null)
export function resolveLabelPrice(type, { price, originPrice } = {}, multiplier = 1) {
  const origin = Number(originPrice) || 0
  const noGold = Number(price) || 0
  const mult = Number(multiplier) || 1
  switch (type) {
    case 'cost-with-gold':
      return origin || null
    case 'cost-no-gold':
      return noGold || null
    case 'tag-with-gold':
      return origin ? origin * mult : null
    case 'tag-no-gold':
      return noGold ? noGold * mult : null
    default:
      return null
  }
}

// ขยาย form ตามจำนวนใบ (form.print) — print ว่าง/ไม่ถูกต้อง = 1 ใบ (พฤติกรรมเดิมของผู้เรียกเดิม)
// sourceIndexes[i] = index ของ form ต้นทางในอาร์เรย์เดิม ของใบที่ i หลังขยาย
export function expandIndexesByCopies(forms) {
  const sourceIndexes = []
  ;(forms || []).forEach((form, index) => {
    const copies = normalizeCopies(form?.print)
    for (let i = 0; i < copies; i++) sourceIndexes.push(index)
  })
  return sourceIndexes
}

// index (ของใบหลังขยาย) ที่พิมพ์พลาด → index ของ form ต้นทางแบบไม่ซ้ำ เรียงจากน้อยไปมาก
export function collectFailedFormIndexes(sourceIndexes, failedLabelIndexes) {
  const set = new Set(failedLabelIndexes.map((labelIndex) => sourceIndexes[labelIndex]))
  return [...set].sort((a, b) => a - b)
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// รายการรหัสสำหรับโชว์ใน dialog (HTML-safe) — แสดงไม่เกิน maxShown ที่เหลือต่อท้ายเป็น "+N"
export function formatCodeListForDialog(codes, maxShown = 10) {
  const list = codes || []
  const shown = list.slice(0, maxShown).map(escapeHtml).join(', ')
  return list.length > maxShown ? `${shown} +${list.length - maxShown}` : shown
}

// เทียบรหัสแบบไม่สนขีด/ตัวพิมพ์/ช่องว่างหัวท้าย — ตรงกับ StockNumberSearch.Normalize ฝั่ง API
export function normalizeCode(value) {
  return normalizeStockNumber(value)
}

// API ค้น stockNumber/stockNumberOrigin แบบ Contains — ต้องคัดเฉพาะแถวที่รหัส "ตรง" จริง ไม่งั้นรหัสสั้นจะไปหยิบแถวอื่นที่มีรหัสเราเป็นส่วนหนึ่ง
export function pickExactMatches(rows, code, field) {
  const target = normalizeCode(code)
  if (!target) return []
  return (rows || []).filter((row) => normalizeCode(row?.[field]) === target)
}

// เลือกทุกแถวให้อัตโนมัติหลังค้น เฉพาะเมื่อจำนวนใบรวมไม่เกินเพดานต่อรอบ — เกินแล้วไม่เลือกอะไร ให้ผู้ใช้เลือกเอง
export function pickAutoSelection(rows, limit = MAX_LABELS_PER_RUN) {
  const list = rows || []
  return summarizeSelection(list).labels <= limit ? [...list] : []
}

// เลขลำดับชิ้นต่อใบ: เอาชิ้นที่ยังไม่ขาย เรียงตามเลขชิ้น ใบแรก=ชิ้นแรก ... ถ้าชิ้นไม่พอ ใบที่เหลือคืน '' (พิมพ์ไม่มีเลขชิ้น)
export function buildUnitMarks(units, lotQty, copies) {
  const available = (units || [])
    .filter((unit) => unit && unit.status !== 'SOLD' && unit.unitNo !== null && unit.unitNo !== undefined)
    .sort((a, b) => a.unitNo - b.unitNo)
  const qty = Number(lotQty) > 0 ? Number(lotQty) : available.length
  const total = normalizeCopies(copies)
  return Array.from({ length: total }, (_, i) => (available[i] ? `${available[i].unitNo}/${qty}` : ''))
}

// แตก form 1 ใบ/ชิ้นที่มีเลขชิ้น (print=1, unitMark) · ใบที่ไม่มีเลขชิ้นรวมเป็น form เดียวที่ print=จำนวนที่เหลือ (ไม่ใส่ unitMark)
export function expandFormByUnitMarks(form, marks) {
  const forms = []
  let unmarked = 0
  ;(marks || []).forEach((mark) => {
    if (mark) forms.push({ ...form, print: 1, unitMark: mark })
    else unmarked += 1
  })
  if (unmarked > 0) forms.push({ ...form, print: unmarked })
  return { forms, unmarked }
}
