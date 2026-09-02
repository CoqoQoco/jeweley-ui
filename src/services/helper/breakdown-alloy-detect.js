// ตรวจจับคำอธิบายที่หมายถึง "โลหะผสม" (Alloy) แม้สะกดผิด เช่น Aolly, Aloy —
// ใช้ร่วมกันทั้ง breakdown-pdf-builder, breakdown-excel-builder และ edit-stock-view
// เพื่อกันคิด Gold Loss ซ้ำกับ alloy-calculator (น้ำหนัก alloy รวม (1 + goldLoss) ไว้แล้วตั้งแต่ตอนคำนวณ)
// normalize = lowercase + ตัดทุกอย่างที่ไม่ใช่ a-z ออก แล้ว match /^a[lo]{2,3}y$/ — ครอบคลุม alloy, aolly, aloy
//
// Defensive: เผื่อ caller ส่ง object ของ suggestion ที่ยังไม่ได้ normalize เป็น string มาเอง
// (เช่น {code, name} จาก AutoComplete ที่ลืม coerce ตอน item-select) — อ่าน .name/.code ก่อน
// ไม่ String(obj) ตรงๆ เพราะจะได้ "[object Object]" ซึ่ง normalize แล้วดันไปแมตช์ pattern เดิมโดยบังเอิญไม่ได้
// (แต่ก็ไม่ควรพึ่งพฤติกรรมนี้เป็นทางแก้หลัก — ต้อง coerce ให้เป็น string ตั้งแต่จุดที่ผู้ใช้เลือก suggestion)
export function isAlloyDescription(text) {
  let raw = text
  if (raw && typeof raw === 'object') {
    raw = raw.name ?? raw.code ?? ''
  }
  if (typeof raw !== 'string') return false
  const normalized = raw.toLowerCase().replace(/[^a-z]/g, '')
  return /^a[lo]{2,3}y$/.test(normalized)
}
