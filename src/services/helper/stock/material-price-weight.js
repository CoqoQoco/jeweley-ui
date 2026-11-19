const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

// ผู้ใช้แก้ราคา/น้ำหนักของแถวทอง → คืนราคาแถวใหม่ (ปัดครั้งเดียว 2 ตำแหน่ง) · เงื่อนไขไม่ครบ/ล้างค่า = ราคาเดิม
export function resolvePriceFromPriceWeight(material, priceWeight) {
  const current = material?.price
  if (String(material?.type || '').toLowerCase() !== 'gold') return current
  const weight = Number(material?.weight)
  const perWeight = Number(priceWeight)
  if (!(weight > 0) || !(perWeight > 0)) return current
  return round2(weight * perWeight)
}

export function normalizePriceWeight(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}
