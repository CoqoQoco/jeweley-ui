// รหัสประจำบรรทัดฝั่งหน้าเว็บ — ใช้แทน stockNumber ในการอ้างอิงแถวของใบสั่งขาย
// เพราะ stockNumber ซ้ำกันได้เมื่อลูกค้า scan เลขสินค้าเดิมมากกว่า 1 ครั้ง (คนละบรรทัด คนละชิ้น)

export function createLineKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `lk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

// เติม lineKey ย้อนหลังให้ item ที่ยังไม่มี (ใบสั่งขายเก่าที่บันทึกไว้ก่อนมี lineKey)
export function ensureLineKey(item) {
  if (item && !item.lineKey) {
    item.lineKey = createLineKey()
  }
  return item
}
