// รหัสสินค้าที่โชว์ในคอลัมน์ Style/Product ของเอกสารขาย (quotation/sale-order/invoice)
// ต้องเป็น stockNumberOrigin/mold (เลขที่ผลิต/แม่พิมพ์) ไม่ใช่ productNumber (รหัสสินค้า)
//
// fallback:
// - stockNumberOrigin ว่างประมาณ 15% ของรายการจริง → ถอยไปใช้ stockNumber ให้ตรงกับที่ตารางบนหน้าจอแสดงอยู่แล้ว
// - mold ว่างในรายการที่กรอกเอง → ถอยไปใช้ productNumber

/**
 * @param {object} item
 * @returns {string}
 */
export function formatItemStyleCode(item) {
  const production = item?.stockNumberOrigin || item?.stockNumber || ''
  const mold = item?.mold || item?.productNumber || ''
  return production && mold ? `${production}/${mold}` : production || mold || ''
}
