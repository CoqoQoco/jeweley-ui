// เติมยอดคงเหลือ (SKU รวมทุกคลัง/ทุกล็อต) ลงใน items — ใช้ร่วมกันระหว่างหน้า list และหน้า detail
// ยกมาจาก data-table-view.vue เดิม (mergeBalanceIntoItems) เพื่อไม่ให้ตรรกะซ้ำ 3 ที่ (web list, web detail, mobile)
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
    const b = map[item.stockNumber]
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
