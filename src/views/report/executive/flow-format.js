// flow-format.js — ตัวจัดรูปแบบตัวเลขของ Flow 3D (pure) — ค่า null/NaN แสดงเป็น "-" เสมอ ไม่เดาเป็น 0

const intFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const decFormats = {}

function decFormat(digits) {
  if (!decFormats[digits]) {
    decFormats[digits] = new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  }
  return decFormats[digits]
}

export function isNum(x) {
  return x !== null && x !== undefined && x !== '' && Number.isFinite(Number(x))
}

export function fmtInt(x) {
  return isNum(x) ? intFormat.format(Number(x)) : '-'
}

export function fmtDec(x, digits = 1) {
  return isNum(x) ? decFormat(digits).format(Number(x)) : '-'
}

// น้ำหนักกรัม 1 ตำแหน่ง
export function fmtG(x) {
  return fmtDec(x, 1)
}

// ค่าเปอร์เซ็นต์ที่ API ส่งมาเป็น 0-100 อยู่แล้ว
export function fmtPercent(x, digits = 2) {
  return isNum(x) ? `${decFormat(digits).format(Number(x))}%` : '-'
}

// เศษส่วน a/b เป็นเปอร์เซ็นต์ — b = 0 → "-"
export function fmtShare(a, b, digits = 1) {
  if (!isNum(a) || !isNum(b) || Number(b) === 0) return '-'
  return `${decFormat(digits).format((Number(a) / Number(b)) * 100)}%`
}

export function shareValue(a, b) {
  if (!isNum(a) || !isNum(b) || Number(b) === 0) return null
  return (Number(a) / Number(b)) * 100
}

export function fmtSigned(x, digits = 0) {
  if (!isNum(x)) return '-'
  const v = Number(x)
  const body = digits ? decFormat(digits).format(Math.abs(v)) : intFormat.format(Math.abs(v))
  return `${v >= 0 ? '+' : '−'}${body}`
}

export function fmtThb(x) {
  return isNum(x) ? `฿${decFormat(2).format(Number(x))}` : '-'
}

export function fmtThbCompact(x) {
  if (!isNum(x)) return '-'
  const v = Number(x)
  return Math.abs(v) >= 1e6 ? `${decFormat(2).format(v / 1e6)}M` : fmtInt(v)
}
