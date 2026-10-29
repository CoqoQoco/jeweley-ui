const SOLD = 'SOLD'

// "3/6" — ไม่มีเลขชิ้น คืนค่าว่าง
export function formatUnit(unitNo, lotQty) {
  if (unitNo === null || unitNo === undefined) return ''
  const qty = Number(lotQty)
  return qty > 0 ? `${unitNo}/${qty}` : String(unitNo)
}

export function isSelectableUnit(unit) {
  return !!unit && !unit.epc && unit.status !== SOLD
}

// ชิ้นที่ผูกแท็กใหม่ได้ (ยังไม่มีแท็ก และยังไม่ขาย)
export function freeUnits(units) {
  return (units || []).filter(isSelectableUnit)
}

// ชิ้นที่มีแท็ก (ใช้ปลดแท็กได้) เรียงตามเลขชิ้น
export function taggedUnits(units) {
  return (units || []).filter((u) => !!u.epc).sort((a, b) => a.unitNo - b.unitNo)
}

// unitId ที่เลือกเองยังใช้ได้อยู่ไหม — ไม่ได้ (ถูกผูก/ขายไปแล้ว) คืน null = ให้ server เลือกเอง
export function resolveChosenUnitId(units, chosenUnitId) {
  if (chosenUnitId === null || chosenUnitId === undefined) return null
  return freeUnits(units).some((u) => u.unitId === chosenUnitId) ? chosenUnitId : null
}
