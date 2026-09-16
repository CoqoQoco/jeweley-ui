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
 * @returns {Object}
 */
export function buildCopyItem(sourceItem, options = {}) {
  const { qty, resetAppraisal = false } = options
  const newItem = JSON.parse(JSON.stringify(sourceItem || {}))

  // เก็บเลขที่ผลิตต้นทางไว้อ้างอิงย้อนกลับ (traceability) ก่อนล้างเลขจริงทิ้ง
  newItem.sourceStockNumber = sourceItem?.stockNumberOrigin || sourceItem?.stockNumber || null
  newItem.stockNumber = null
  newItem.stockNumberOrigin = null
  newItem.lineKey = createLineKey()
  newItem._copyId = createLineKey()

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
