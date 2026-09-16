// silver lot: piece เดียวมีได้หลายชิ้น (qty) — ทองยังคง qty 1 เสมอ
// helper กลางสำหรับอ่าน qty/qtyReserved/qtyAvailable ของ piece จาก response
// ที่ field อาจไม่มีมา (backend รุ่นเก่า) — treat qtyAvailable = qty ?? 1 - qtyReserved ?? 0
export function getPieceQty(item) {
  const qty = Number(item?.qty)
  return Number.isFinite(qty) ? qty : 1
}

export function getPieceQtyReserved(item) {
  const reserved = Number(item?.qtyReserved)
  return Number.isFinite(reserved) ? reserved : 0
}

export function getPieceQtyAvailable(item) {
  if (item?.qtyAvailable !== null && item?.qtyAvailable !== undefined) {
    const available = Number(item.qtyAvailable)
    if (Number.isFinite(available)) return available
  }
  return getPieceQty(item) - getPieceQtyReserved(item)
}

// รวม qty ของทุกบรรทัดที่ยังไม่ confirm/invoice ต่อ stockNumber เดียวกัน — ใช้เช็ค available
// ก่อน confirm/เติมของ (silver lot อาจสแกนเลขเดียวกันหลายบรรทัด)
export function sumUnconfirmedQtyByStockNumber(items) {
  const map = {}
  ;(items || []).forEach((item) => {
    if (item.isConfirm || item.invoice || !item.stockNumber) return
    map[item.stockNumber] = (map[item.stockNumber] || 0) + (Number(item.qty) || 0)
  })
  return map
}
