// เลขที่หัวกระดาษของใบรูปอย่างเดียว — trim แล้วถ้าว่าง = หัวกระดาษว่าง (ไม่ย้อนกลับไปใช้เลขเดิมของเอกสาร)
export function normalizeDocNo(value) {
  return value == null ? '' : String(value).trim()
}
