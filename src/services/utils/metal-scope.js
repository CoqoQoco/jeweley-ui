// metal-scope.js — pure logic ของตัวสลับโลหะทั้งหน้า /executive (ทอง | เงิน | รวม) — ห้าม import Vue/Pinia/i18n
// ค่าที่ส่งไป API = GOLD | SILVER | ALL, ค่าใน URL query `metal` = gold | silver | all (default all ไม่ใส่ใน URL)

export const METAL_SCOPE_VALUES = ['GOLD', 'SILVER', 'ALL']
export const DEFAULT_METAL_SCOPE = 'ALL'

export function parseMetalQuery(value) {
  const upper = String(value || '').toUpperCase()
  return METAL_SCOPE_VALUES.includes(upper) ? upper : DEFAULT_METAL_SCOPE
}

// คืน undefined เมื่อเป็นค่า default (ผู้เรียกลบ key ออกจาก query)
export function metalToQuery(metal) {
  return metal && metal !== DEFAULT_METAL_SCOPE ? metal.toLowerCase() : undefined
}

// หมวดทองและ Loss ดูได้ทีละโลหะ — รวม = แสดงทอง (มี note บอก)
export function resolveGoldTabMetal(metal) {
  return metal === 'SILVER' ? 'SILVER' : 'GOLD'
}

// body ของ request: ถ้า caller ใส่ metal มาเองแล้ว (เช่น หมวดทอง) ใช้ค่านั้น ไม่งั้นใช้ค่าของทั้งหน้า
export function withMetalScope(body, metal) {
  const source = body || {}
  return { ...source, metal: source.metal ?? metal ?? DEFAULT_METAL_SCOPE }
}
