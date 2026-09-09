// payment code ตาม contract ของ POST /Pos/Checkout และ Invoice/Payment/Create
// 1=เงินสด 2=โอน 3=เช็ค 4=บัตรเครดิต 5=เครดิต(กำหนดวัน)
// ใช้ร่วมกันโดย:
// - views/mobile/pos/components/pos-checkout-sheet.vue (labelKey อ้างอิง namespace view.mobile.pos)
// - views/mobile/sale/components/payment-record-sheet.vue (map key เป็น namespace view.mobile.sale เอง)
export const PAYMENT_METHODS = [
  { code: 1, key: 'cash', icon: 'bi-cash-stack', labelKey: 'paymentMethodCash' },
  { code: 2, key: 'transfer', icon: 'bi-bank', labelKey: 'paymentMethodTransfer' },
  { code: 3, key: 'cheque', icon: 'bi-journal-check', labelKey: 'paymentMethodCheque' },
  { code: 4, key: 'creditCard', icon: 'bi-credit-card', labelKey: 'paymentMethodCreditCard' },
  { code: 5, key: 'credit', icon: 'bi-calendar-week', labelKey: 'paymentMethodCredit' }
]

export default PAYMENT_METHODS
