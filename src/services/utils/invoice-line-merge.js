import { isSilverItem } from '@/services/helper/sale-material-columns.js'

// รวมบรรทัดสินค้าเงินแบบเดียวกันตอนพิมพ์ใบแจ้งหนี้เท่านั้น (ไม่แตะหน้าจอ/DB/สต็อก)
// เงื่อนไข: เป็นเงิน + productNumber เดียวกันหลังตัด "-<ตัวเลข>" ท้ายสุด (สีอยู่ใน productNumber)
// + mold เดียวกันหลังตัด "-SIL" ท้ายสุด + ราคา/ส่วนลดเท่ากัน
// บรรทัดที่รวมแล้วโชว์ข้อมูลของบรรทัดที่ qty มากสุด (เท่ากัน → บรรทัดแรก) แต่อยู่ตำแหน่งบรรทัดแรก
// น้ำหนัก materials ของ item เป็นต่อชิ้น → ยอดรวมน้ำหนักท้ายตารางใช้ totalMaterials (materials ทุกบรรทัดเดิม)

const STRIP_SUFFIX = /-\d+$/
const STRIP_SIL = /-SIL$/i

function mergeKey(item) {
  if (!isSilverItem(item)) return null
  const base = String(item.productNumber || '').trim().replace(STRIP_SUFFIX, '')
  const mold = String(item.mold || '').trim().replace(STRIP_SIL, '').trim()
  if (!base || !mold) return null
  const price = Number(item.appraisalPrice) || 0
  const discount = Number(item.discountPercent) || 0
  return [base, mold, price, discount].join('\u0001')
}

const qtyOf = (item) => Number(item?.qty) || 0

/**
 * @param {Array} items
 * @returns {Array} รายการใหม่ (ไม่แก้ input)
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
    const display = lines.reduce((best, l) => (qtyOf(l) > qtyOf(best) ? l : best), lines[0])
    return {
      ...display,
      qty: lines.reduce((sum, l) => sum + qtyOf(l), 0),
      totalMaterials: lines.flatMap((l) => (Array.isArray(l.materials) ? l.materials : []))
    }
  })
}
