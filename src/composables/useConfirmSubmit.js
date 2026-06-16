/**
 * useConfirmSubmit — helper function สำหรับ pattern ยืนยันแล้ว submit
 *
 * ห่อ swAlert.confirmSubmit(...) เพื่อลดโค้ดซ้ำใน 50+ modal/form
 *
 * วิธีใช้:
 *   import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
 *
 *   // แบบ basic (message, title, onConfirm)
 *   confirmThenSubmit('CAT001 : คอลเลคชันแหวน', 'ยืนยันสร้าง Catalog', async () => {
 *     await this.submit()
 *   })
 *
 *   // แบบกำหนด options เพิ่ม (ตาม signature ของ sweetAlerts.confirmSubmit)
 *   confirmThenSubmit('CAT001 : คอลเลคชันแหวน', 'ยืนยันลบ', handleDelete, {
 *     confirmText: 'ลบเลย',
 *     cancelText: 'ยกเลิก'
 *   })
 *
 * Signature อ้างอิงจาก sweetAlerts.confirmSubmit:
 *   confirmSubmit(message, title, callback, buttonInfo?, icon?, msgStyle?)
 *
 * ตัวแปร buttonInfo ที่ใช้บ่อย:
 *   { confirmText: 'ยืนยัน', cancelText: 'ยกเลิก', denyText?: 'ปฏิเสธ' }
 */
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

/**
 * @param {string} message - ข้อความแสดงในกล่องยืนยัน (เช่น รหัส : ชื่อ)
 * @param {string} title - หัวข้อกล่องยืนยัน
 * @param {Function} onConfirm - callback ที่เรียกเมื่อผู้ใช้กด "ยืนยัน" — รับ SweetAlert result เป็น arg
 * @param {Object} [buttonInfo] - ปรับ label ปุ่ม { confirmText?, cancelText?, denyText? }
 * @param {string} [icon] - icon type: 'warning' (default), 'question', 'info', 'error', 'success'
 * @param {string} [msgStyle] - inline style สำหรับ message div (ถ้าไม่ระบุใช้ default สีแดงหนา)
 */
export function confirmThenSubmit(message, title, onConfirm, buttonInfo, icon, msgStyle) {
  confirmSubmit(message, title, onConfirm, buttonInfo, icon, msgStyle)
}

export default confirmThenSubmit
