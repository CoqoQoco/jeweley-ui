// map ชื่อประเภทสินค้าภาษาไทยจาก API (productTypeName) → i18n key ใต้ view.public.showcase.productType.*
// ใช้กับหน้า public showcase (/p/:token) ที่เปิดเป็นภาษาอังกฤษเป็นค่าเริ่มต้น แต่ API ส่งชื่อประเภทมาเป็นภาษาไทยอย่างเดียว
export const PUBLIC_PRODUCT_TYPE_I18N_KEY = {
  แหวน: 'ring',
  จี้: 'pendant',
  ต่างหู: 'earrings',
  ต่างหูมีแป้น: 'studEarrings',
  ต่างหูล็อค: 'lockEarrings',
  ต่างหูฮุก: 'hookEarrings',
  แป้นต่างหู: 'earringBacks',
  สังวาลย์: 'necklace',
  สร้อย: 'chain',
  สร้อยข้อมือ: 'bracelet',
  กำไล: 'bangle',
  เข็มกลัด: 'brooch',
  ชาร์ม: 'charm',
  กรอบพระ: 'locket'
}

export default PUBLIC_PRODUCT_TYPE_I18N_KEY
