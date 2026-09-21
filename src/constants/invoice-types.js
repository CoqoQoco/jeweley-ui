// ประเภทใบแจ้งหนี้ — ตรงกับ tbt_sale_invoice_header.invoice_type ('PRODUCT'/'MATERIAL') ฝั่ง backend
// PRODUCT = ออกจากใบสั่งขาย (SO) ตามเดิม, MATERIAL = ออกจากใบสั่งขายวัตถุดิบ (SM)
export const INVOICE_TYPES = {
  PRODUCT: 'PRODUCT',
  MATERIAL: 'MATERIAL'
}

export function isMaterialInvoice(invoice) {
  return invoice?.invoiceType === INVOICE_TYPES.MATERIAL
}
