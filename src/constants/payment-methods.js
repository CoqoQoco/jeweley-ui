// payment code ตาม contract ของ POST /Pos/Checkout และ Invoice/Payment/Create
// 0=ค้างชำระ(ไม่ระบุ, backend เขียนเอง) 1=เงินสด 2=โอน 3=เช็ค 4=บัตรเครดิต 5=เครดิต(กำหนดวัน/ยังไม่ได้รับเงิน)
//
// นโยบายสำคัญ (ห้ามฝ่าฝืน — เหมือน src/services/utils/payment-status.js บรรทัดแรกๆ):
// - payment (int, ฟิลด์ "code" ด้านล่าง) = ความจริง ใช้จัดกลุ่ม/ตัดสินใจทางธุรกิจเสมอ
//   (settlesImmediately / selectable / recordableAsReceipt)
// - apiName = snapshot ข้อความ ณ เวลาออกบิล เก็บลงคอลัมน์ paymant_name ตรงตัวเป๊ะ ห้ามผ่าน $t
//   และห้ามใช้ข้อความนี้จัดกลุ่ม/ตัดสินใจอะไรทั้งสิ้น — เป็นชื่อทางบัญชีที่พิมพ์ลงเอกสารส่งลูกค้าไปแล้ว
// - labelKey/label ที่ผู้ใช้เห็นบนจอ = ปรับคำได้ตาม feedback พนักงานโดยไม่กระทบข้อมูลเก่าใน DB
// - apiName ของรหัส 5 ตั้งใจ "ไม่เท่ากับ" label บนจอ (ยังคงเป็น 'เครดิต (Credit Term)' ทั้งที่จอเปลี่ยนคำไปแล้ว)
//   เพราะเป็นชื่อทางบัญชีที่ตรงกับรูปแบบเดิม 85% ของแถวที่มีอยู่จริงใน DB — ห้ามทำให้ apiName เท่ากับ label อีก
//   ถ้าใครทำให้เท่ากัน ปัญหาข้อความ UI หลุดลง DB (เช่น 'Cash' ที่เจอจริงบน prod) จะกลับมาทันที
//
// ใช้ร่วมกันโดย:
// - views/mobile/pos/components/pos-checkout-sheet.vue (labelKey อ้างอิง namespace view.mobile.pos)
// - views/mobile/sale/components/payment-record-sheet.vue (MOBILE_SALE_PAYMENT_LABEL_KEYS อ้างอิง namespace view.mobile.sale)
// - views/report-sale-by-channel/*.vue (labelKey อ้างอิง namespace view.report.saleByChannel)
// - views/sale/sale-order/modal/invoice-modal.vue, confirm-and-invoice-modal.vue (payload ต้องใช้ getPaymentApiName เท่านั้น)
export const PAYMENT_METHODS = [
  {
    code: 1,
    key: 'cash',
    icon: 'bi-cash-stack',
    apiName: 'เงินสด (Cash)',
    labelKey: 'paymentMethodCash',
    receiptLabel: 'Cash',
    settlesImmediately: true,
    selectable: true,
    recordableAsReceipt: true
  },
  {
    code: 2,
    key: 'transfer',
    icon: 'bi-bank',
    apiName: 'โอนเงิน (Transfer)',
    labelKey: 'paymentMethodTransfer',
    receiptLabel: 'Transfer',
    settlesImmediately: true,
    selectable: true,
    recordableAsReceipt: true
  },
  {
    code: 3,
    key: 'cheque',
    icon: 'bi-journal-check',
    apiName: 'เช็ค (Cheque)',
    labelKey: 'paymentMethodCheque',
    receiptLabel: 'Cheque',
    settlesImmediately: false,
    selectable: true,
    recordableAsReceipt: true
  },
  {
    code: 4,
    key: 'creditCard',
    icon: 'bi-credit-card',
    apiName: 'บัตรเครดิต (Credit Card)',
    labelKey: 'paymentMethodCreditCard',
    receiptLabel: 'Credit Card',
    settlesImmediately: true,
    selectable: true,
    recordableAsReceipt: true
  },
  {
    code: 5,
    key: 'credit',
    icon: 'bi-calendar-week',
    apiName: 'เครดิต (Credit Term)',
    labelKey: 'paymentMethodCredit',
    receiptLabel: 'Credit Term',
    settlesImmediately: false,
    selectable: true,
    recordableAsReceipt: false
  }
]

export default PAYMENT_METHODS

// รหัส 0 ไม่อยู่ใน PAYMENT_METHODS ด้านบนเพราะ list นั้นคือ "ตัวเลือกที่กดได้" (selectable) เท่านั้น
// รหัส 0 กดเลือกเองไม่ได้ — backend เป็นคนเขียน apiName นี้เองตอนไม่มีข้อมูลการชำระใดๆ ณ ตอนออกบิล
// (เช่น POS "บันทึกเป็นค้างชำระ") เก็บไว้ที่นี่เพื่อให้จุดแสดงผลใบเก่า (payment-section.vue ฯลฯ)
// แปลรหัส 0 → ป้ายได้ครบเหมือนรหัสอื่น โดยไม่ต้องเดา/ซ่อนแถวทิ้ง
const UNPAID_METHOD = {
  code: 0,
  key: 'unpaid',
  icon: 'bi-exclamation-circle',
  apiName: 'ค้างชำระ',
  labelKey: 'paymentMethodUnpaid',
  receiptLabel: 'Unpaid',
  settlesImmediately: false,
  selectable: false,
  recordableAsReceipt: false
}

// map รวมทุกรหัส 0-5 คีย์ด้วยตัวเลข — ใช้ตอน "แปลรหัส → apiName/receiptLabel/flag" ที่ต้องครอบคลุมรหัส 0 ด้วย
// (PAYMENT_METHODS ด้านบนไม่มีรหัส 0 เพราะเป็น list ตัวเลือกที่กดได้)
export const PAYMENT_METHOD_BY_CODE = [UNPAID_METHOD, ...PAYMENT_METHODS].reduce((map, method) => {
  map[method.code] = method
  return map
}, {})

// key ป้ายวิธีชำระภายใต้ namespace view.mobile.sale — ใช้ร่วมกันโดย payment-record-sheet.vue,
// invoice-creation-form.vue, invoice-detail-view.vue (ทุกจุดในหน้า mobile sale ที่ต้องแปลรหัส→ป้าย)
export const MOBILE_SALE_PAYMENT_LABEL_KEYS = {
  cash: 'invoicePaymentMethodCash',
  transfer: 'invoicePaymentMethodTransfer',
  cheque: 'invoicePaymentMethodCheque',
  creditCard: 'invoicePaymentMethodCreditCard',
  credit: 'invoicePaymentMethodCredit',
  unpaid: 'invoicePaymentMethodUnpaid'
}

// ใช้ตอนส่ง paymentName ขึ้น API เท่านั้น — ห้ามใช้ label/labelKey ที่ผ่าน $t มาตัดสินใจอะไรเกี่ยวกับค่าที่ส่งขึ้น DB
export function getPaymentApiName(code) {
  return PAYMENT_METHOD_BY_CODE[code]?.apiName ?? null
}

export function getPaymentLabelKey(code) {
  return PAYMENT_METHOD_BY_CODE[code]?.labelKey ?? null
}
