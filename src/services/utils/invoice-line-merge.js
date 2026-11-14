import { isSilverItem } from '@/services/helper/sale-material-columns.js'

// รวมบรรทัดสินค้าเงินแบบเดียวกันตอนพิมพ์ใบแจ้งหนี้เท่านั้น (ไม่แตะหน้าจอ/DB/สต็อก)
// เงื่อนไข: เป็นเงิน + แม่พิมพ์เดียวกัน + เลขที่ผลิตเหมือนกันหลังตัด "-<ตัวเลข>" ท้ายสุด + ราคา/ส่วนลดเท่ากัน
// น้ำหนัก materials ของ item เป็นต่อชิ้น (1 ชุดต่อล็อต) → บรรทัดรวมโชว์ของบรรทัดแรก
// ส่วนยอดรวมน้ำหนักท้ายตารางใช้ totalMaterials (materials ของทุกบรรทัดเดิม) เพื่อให้เท่าก่อนรวม

const STRIP_SUFFIX = /-\d+$/

// ฐานเลขที่ผลิตมาจาก stockNumberOrigin เท่านั้น — ห้ามถอยไป stockNumber (เลขล็อตเงินอย่าง DK-SIL-20H-002 ไม่ใช่เลขที่ผลิต)
function productionBase(item) {
  return String(item?.stockNumberOrigin || '').replace(STRIP_SUFFIX, '')
}

function mergeKey(item) {
  if (!isSilverItem(item)) return null
  const mold = String(item.mold || '').trim()
  const base = productionBase(item)
  if (!mold || !base) return null
  const price = Number(item.appraisalPrice) || 0
  const discount = Number(item.discountPercent) || 0
  return [mold, base, price, discount].join('\u0001')
}

/**
 * @param {Array} items
 * @returns {Array} รายการใหม่ (ไม่แก้ input) — บรรทัดที่รวมแล้วอยู่ตำแหน่งของบรรทัดแรก
 */
export function groupInvoiceLinesForPrint(items) {
  if (!Array.isArray(items)) return items
  const groups = new Map()
  const order = []

  items.forEach((item) => {
    const key = mergeKey(item)
    if (key === null) {
      order.push({ single: item })
      return
    }
    if (!groups.has(key)) {
      const group = { lines: [item] }
      groups.set(key, group)
      order.push(group)
    } else {
      groups.get(key).lines.push(item)
    }
  })

  return order.map((entry) => {
    if (entry.single) return entry.single
    const { lines } = entry
    if (lines.length === 1) return lines[0]
    const first = lines[0]
    return {
      ...first,
      qty: lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0),
      stockNumberOrigin: productionBase(first),
      totalMaterials: lines.flatMap((l) => (Array.isArray(l.materials) ? l.materials : []))
    }
  })
}
