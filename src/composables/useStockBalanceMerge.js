// เติมยอดคงเหลือ (SKU รวมทุกคลัง/ทุกล็อต) ลงใน items — ใช้ร่วมกันระหว่างหน้า list และหน้า detail
// ยกมาจาก data-table-view.vue เดิม (mergeBalanceIntoItems) เพื่อไม่ให้ตรรกะซ้ำ 3 ที่ (web list, web detail, mobile)
import { normalizeStockNumber } from '@/services/helper/stock-number.js'

export async function mergeBalanceIntoItems(items, { balanceStore, locationStore }) {
  const stockNumbers = items.map((i) => i.stockNumber).filter(Boolean)
  if (!stockNumbers.length) return

  let nameMap = {}
  try {
    const allLocs = await locationStore.fetchAllForMap()
    for (const loc of allLocs) {
      nameMap[loc.code] = `${loc.code} — ${loc.nameTh}`
    }
  } catch {
    // fallback: use code as name
  }

  const map = await balanceStore.fetchByStockNumbers(stockNumbers)
  for (const item of items) {
    const b = map[normalizeStockNumber(item.stockNumber)]
    // ยอดนี้เป็นยอดรวมทั้ง SKU (ทุกล็อต ทุกคลัง) — ห้ามเขียนทับ item.qty/qtyReserved/qtyAvailable
    // ของ piece เอง (มาจาก StockProduct/List อยู่แล้ว) ใช้ prefix sku ชัดเจน
    item.skuQtyOnHand = b?.qtyOnHand ?? null
    item.skuQtyReserved = b?.qtyReserved ?? null
    item.skuQtyAvailable = b?.qtyAvailable ?? null
    if (b?.rows) {
      item.slocBalances = b.rows.map((row) => ({
        ...row,
        location: nameMap[row.locationCode] || row.locationCode
      }))
    } else {
      item.slocBalances = []
    }
  }
}

// ล็อตที่กระจายหลายคลัง -> { [normalizedStockNumber]: locations[] } (ล็อตคลังเดียวไม่อยู่ใน map) — ใช้กับ dropdown เลือกคลังตอนจอง SO
export async function loadMultiLocationLots(stockNumbers, { balanceStore }) {
  const numbers = [...new Set((stockNumbers || []).filter(Boolean))]
  if (!numbers.length) return {}
  let map = {}
  try {
    map = await balanceStore.fetchByStockNumbers(numbers, { skipLoading: true, skipError: true })
  } catch {
    // ดึงคลังไม่ได้ = ไม่แสดงตัวเลือกคลัง (server เลือกคลังให้เอง) ห้ามขวางการยืนยัน
    return {}
  }
  const result = {}
  for (const [key, lot] of Object.entries(map)) {
    if ((lot.locationCount ?? 1) > 1 && lot.locations?.length > 1) result[key] = lot.locations
  }
  return result
}
