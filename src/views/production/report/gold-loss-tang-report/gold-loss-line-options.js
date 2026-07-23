// ค่า data ภาษาไทยคงที่ (เก็บลง slip/PDF) — ไม่ใช้ i18n
export const ISSUED_SEED = ['เบิกน้ำประสาน', 'เบิกลวด', 'เบิกสร้อย', 'เบิกสปริง/ก้ามปู', 'เบิกทองก้อน', 'เบิกตัวเรือนขึ้นมือ']
export const RETURNED_SEED = ['คืนทองก้อน', 'คืนเศษทอง', 'คืนน้ำประสาน', 'คืนลูกยาง']

export function mergeOptions(seed, history) {
  const seen = new Set()
  const out = []
  for (const n of [...seed, ...(history || [])]) {
    const key = (n || '').trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push({ name: key })
  }
  return out
}
