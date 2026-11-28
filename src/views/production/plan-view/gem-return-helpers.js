export const RETURN_MODE = { NOW: 'RETURN_NOW', LINK: 'LINK_EXISTING' }

export const RETURN_REASONS = ['DUPLICATE', 'WRONG_PLAN', 'OVER', 'DAMAGED', 'OTHER']

const EPS = 0.0005

const round3 = (n) => Math.round(Number(n) * 1000) / 1000

export function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function isSameNumber(a, b) {
  return Math.abs(Number(a) - Number(b)) < EPS
}

// รหัสพลอยที่ปรากฏในเลขเบิกต่างกัน > 1 ใบ (นับเฉพาะแถวที่มีเลขเบิก)
export function findDuplicateGemCodes(rows) {
  const runningByCode = new Map()
  for (const row of rows || []) {
    if (!row?.outboundRunning || !row.code) continue
    if (!runningByCode.has(row.code)) runningByCode.set(row.code, new Set())
    runningByCode.get(row.code).add(row.outboundRunning)
  }
  const dup = new Set()
  for (const [code, runnings] of runningByCode) {
    if (runnings.size > 1) dup.add(code)
  }
  return dup
}

export function isDuplicateRow(row, duplicateCodes) {
  return !!row?.outboundRunning && duplicateCodes.has(row.code)
}

// ท้ายตาราง: นับแถว ไม่ใช่รวมจำนวนเม็ด
export function countRows(rows) {
  return (rows || []).length
}

// gemReturns ของ header นี้: ตาม headerId; ถ้า headerId เป็น null ใช้ itemNo ตรงแถวของ header + (เฉพาะ includeOrphans) แถวที่ไม่ตรง header ไหนเลย
export function pickReturnsForHeader(gemReturns, headerId, headerRows, otherHeadersRows, includeOrphans) {
  const own = new Set((headerRows || []).map((r) => r.itemNo))
  const others = new Set((otherHeadersRows || []).map((r) => r.itemNo))
  return (gemReturns || []).filter((r) => {
    if (r.headerId !== null && r.headerId !== undefined) return r.headerId === headerId
    if (own.has(r.itemNo)) return true
    return includeOrphans && !others.has(r.itemNo)
  })
}

/**
 * ตรวจฟอร์มคืนพลอย — คืน { valid, errors } โดย errors[field] = รหัสข้อความ (map เป็น i18n ฝั่ง component)
 * field: mode | link | qty | weight | reason | remark
 */
export function validateGemReturn({
  mode,
  rowQty,
  rowWeight,
  qty,
  weight,
  link,
  reason,
  remark
}) {
  const errors = {}
  if (!mode) errors.mode = 'required'
  if (mode === RETURN_MODE.LINK && !link) errors.link = 'required'

  const q = toNumber(qty)
  const w = toNumber(weight)
  const maxQty = Number(rowQty) || 0
  const maxWeight = Number(rowWeight) || 0

  if (q === null || q < 0) errors.qty = 'invalid'
  else if (q > maxQty + EPS) errors.qty = 'overRow'
  else if (mode === RETURN_MODE.LINK && link && q > Number(link.remainQty) + EPS) errors.qty = 'overLink'

  if (w === null || w < 0) errors.weight = 'invalid'
  else if (w > maxWeight + EPS) errors.weight = 'overRow'
  else if (mode === RETURN_MODE.LINK && link && w > Number(link.remainWeight) + EPS) errors.weight = 'overLink'

  if (!errors.qty && !errors.weight) {
    if (q === 0 && w === 0) {
      errors.qty = 'bothZero'
    } else if (maxQty > 0 && maxWeight > 0 && isSameNumber(q, maxQty) !== isSameNumber(w, maxWeight)) {
      // มิติที่ค่าเดิมเป็น 0/ว่าง ไม่นำมาคิดกฎ "ครบทั้งคู่/บางส่วนทั้งคู่"
      errors.pair = 'pair'
    }
  }

  if (!reason) errors.reason = 'required'
  if (reason === 'OTHER' && !(remark || '').trim()) errors.remark = 'required'

  return { valid: Object.keys(errors).length === 0, errors }
}

// ผลหลังบันทึก: จำนวน/น้ำหนักที่เหลือในแถว
export function previewRemaining({ rowQty, rowWeight, qty, weight }) {
  const q = toNumber(qty) ?? 0
  const w = toNumber(weight) ?? 0
  const remainQty = Math.max(round3(Number(rowQty) - q), 0)
  const remainWeight = Math.max(round3(Number(rowWeight) - w), 0)
  return { remainQty, remainWeight, isFull: remainQty === 0 && remainWeight === 0 }
}

export function buildReturnBody({ row, mode, qty, weight, link, reason, remark, requestDate }) {
  const body = {
    productionPlanId: row.productionPlanId,
    itemNo: row.itemNo,
    mode,
    returnQty: Number(qty),
    returnWeight: Number(weight),
    expectedQty: Number(row.qty),
    expectedWeight: Number(row.weight),
    reason,
    remark: (remark || '').trim() || null,
    requestDate
  }
  if (mode === RETURN_MODE.LINK) body.inboundTransectionId = link.transectionId
  return body
}

export function formatLinkLabel(line, formatDate) {
  const date = line.requestDate ? formatDate(line.requestDate) : '-'
  const remain = `${Number(line.remainQty).toFixed(3)} / ${Number(line.remainWeight).toFixed(3)}`
  const job = line.jobOrPo ? ` · ${line.jobOrPo}` : ''
  return `${line.running} · ${date} · ${line.code} ${remain}${job}`
}

// ใบรับคืนที่ jobOrPo อ้างใบงานนี้ (เทียบแบบไม่สนช่องว่าง/ตัวพิมพ์ ทั้งตัวคั่น - และ /)
export function findInboundForPlan(lines, wo, woNumber) {
  if (!wo || woNumber === null || woNumber === undefined || woNumber === '') return []
  const norm = (v) => String(v ?? '').replace(/\s+/g, '').toLowerCase()
  const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(^|[^0-9a-z])${esc(norm(wo))}[-/]${esc(norm(woNumber))}(?![0-9a-z])`)
  return (lines || []).filter((l) => re.test(norm(l.jobOrPo)))
}
