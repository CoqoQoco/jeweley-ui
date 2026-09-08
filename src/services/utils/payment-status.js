// สถานะการชำระเงินจริงต้องคำนวณจากยอดเงินเท่านั้น
// ห้ามใช้ invoiceData.paymentName / payment ตัดสินว่าจ่ายแล้วหรือยัง — ฟิลด์นั้นเป็น snapshot
// วิธี/เงื่อนไขการชำระ ณ ตอนออกบิล ไม่เคยถูกอัปเดตหลังรับเงินเพิ่มทีหลัง
//
// ใช้ร่วมกันโดย:
// - views/mobile/sale/invoice-detail-view.vue (effectiveGrandTotal = grandTotalRounded จาก Invoice/Get,
//   fallback เป็นยอดดิบคำนวณเองเมื่อ backend ยังไม่ส่ง grandTotalRounded มา, deposit + payments[] จาก Invoice/Get)
// - views/mobile/sale/index-view.vue (grandTotalRounded/deposit/paidAmount จาก Invoice/List)

const PAID_EPSILON = 0.005

/**
 * @param {number} grandTotal
 * @param {number} deposit
 * @param {number} paidAmount
 * @returns {number}
 */
export function getOutstandingAmount(grandTotal, deposit, paidAmount) {
  return (Number(grandTotal) || 0) - (Number(deposit) || 0) - (Number(paidAmount) || 0)
}

/**
 * คืน null เมื่อไม่รู้ยอดรวม (grandTotal เป็น null/undefined) — ตัดสินสถานะไม่ได้ ห้ามเดาว่าค้างชำระ
 * @param {number|null|undefined} grandTotal
 * @param {number} deposit
 * @param {number} paidAmount
 * @returns {'paid'|'partial'|'unpaid'|null}
 */
export function getPaymentStatus(grandTotal, deposit, paidAmount) {
  if (grandTotal === null || grandTotal === undefined) return null

  const paid = Number(paidAmount) || 0
  const outstanding = getOutstandingAmount(grandTotal, deposit, paidAmount)

  if (outstanding <= PAID_EPSILON) return 'paid'
  if (paid > 0) return 'partial'
  return 'unpaid'
}
