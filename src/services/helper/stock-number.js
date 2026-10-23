// เลขสินค้าเก่ามีขีด (DK-20G-123) เลขใหม่ไม่มีขีด (DK20G123) — ทั้งสองแบบคือชิ้นเดียวกัน
// ใช้เทียบเลขฝั่ง client (เช็คซ้ำในตาราง/ตะกร้า) ห้ามใช้ส่งขึ้น API หรือเก็บลงแถว: เก็บเลขจริงที่ API คืนเสมอ
export function normalizeStockNumber(value) {
  return String(value ?? '')
    .trim()
    .replace(/-/g, '')
    .toUpperCase()
}

export function isSameStockNumber(a, b) {
  const left = normalizeStockNumber(a)
  return left !== '' && left === normalizeStockNumber(b)
}

export function stripStockNumberDash(value) {
  return String(value ?? '').replace(/-/g, '')
}
