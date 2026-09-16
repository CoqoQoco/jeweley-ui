// สร้างบรรทัด "รายการรอผลิต/รอแปลง" (copy item — ยังไม่มี stockNumber จริง) จากบรรทัดสินค้าจริง
// หรือ raw stock product data — ใช้ร่วมกันทั้งหน้าใบเสนอราคาและใบสั่งขาย (เดิมแต่ละหน้าเขียนแยกกัน)

import { createLineKey } from './line-key.js'

// field ที่ผูกกับสินค้าจริงชิ้นเดิม (การยืนยัน/ออกใบแจ้งหนี้/รหัสฐานข้อมูล) ต้อง reset ทุกครั้ง ห้ามติดไปกับสำเนา
const RESET_FIELDS = [
  'isConfirm',
  'isInvoice',
  'invoice',
  'invoiceItem',
  'dkInvoiceNumber',
  'id',
  'qtyAvailable',
  'message'
]

/**
 * @param {Object} sourceItem - บรรทัดต้นทาง (stock item ของใบเสนอราคา/ใบสั่งขาย หรือ raw stock product data จาก API)
 * @param {Object} [options]
 * @param {number} [options.qty] - จำนวนของสำเนา (ไม่ระบุ = คงค่าเดิมจาก sourceItem)
 * @param {boolean} [options.resetAppraisal=false] - true เฉพาะหน้าใบเสนอราคา (ล้างราคาประเมินกลับเป็นราคาตั้งต้น)
 * @param {string|null} [options.parentLineKey=null] - lineKey ของบรรทัดสินค้าจริงที่คัดลอกมา (แสดงเป็นบรรทัดลูกในตารางเดียวกัน)
 *   ไม่ระบุ = ไม่มีบรรทัดแม่ (เช่น เพิ่มจากการสแกนเลขที่สินค้าหมดแล้ว)
 * @returns {Object}
 */
export function buildCopyItem(sourceItem, options = {}) {
  const { qty, resetAppraisal = false, parentLineKey = null } = options
  const newItem = JSON.parse(JSON.stringify(sourceItem || {}))

  // เก็บเลขที่ผลิตต้นทางไว้อ้างอิงย้อนกลับ (traceability) ก่อนล้างเลขจริงทิ้ง
  newItem.sourceStockNumber = sourceItem?.stockNumberOrigin || sourceItem?.stockNumber || null
  newItem.stockNumber = null
  newItem.stockNumberOrigin = null
  newItem.lineKey = createLineKey()
  newItem._copyId = createLineKey()
  // บรรทัดรอผลิต/รอแปลง — ไม่มีของจริงในคลัง ยืนยันได้แต่ห้ามออกใบแจ้งหนี้ (ดู jeweley-ui plan: sale-order redesign)
  newItem.isPlaceholder = true
  newItem.parentLineKey = parentLineKey || null

  RESET_FIELDS.forEach((field) => {
    delete newItem[field]
  })

  if (newItem.materials && Array.isArray(newItem.materials)) {
    newItem.materials = newItem.materials.map((material) => ({ ...material }))
  }
  if (newItem.priceTransactions && Array.isArray(newItem.priceTransactions)) {
    newItem.priceTransactions = newItem.priceTransactions.map((transaction) => ({ ...transaction }))
  }

  if (resetAppraisal) {
    newItem.appraisalPrice = newItem.priceOrigin || newItem.price || 0
  }

  if (qty !== undefined && qty !== null) {
    newItem.qty = qty
  }

  return newItem
}

// ระบุว่าบรรทัดนี้เป็นรายการรอผลิต/รอแปลง (ไม่มีของจริงในคลัง) หรือบรรทัดสินค้าจริง
// อ่าน isPlaceholder ตรงๆ ก่อนเสมอ — fallback เช็ค stockNumber ว่าง เฉพาะข้อมูลเก่าที่บันทึกไว้ก่อนมีฟิลด์นี้
export function isPlaceholderItem(item) {
  if (!item) return false
  if (item.isPlaceholder === true) return true
  if (item.isPlaceholder === false) return false
  return item.stockNumber === null || item.stockNumber === undefined || item.stockNumber === ''
}
