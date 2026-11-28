import { willBeVatIncluded } from '@/services/utils/money.js'

export const DRAFT_INVOICE_NUMBER = 'DRAFT'

export function computeInvoiceTotalExSpecial(subTotal, vatPercent) {
  const sub = Number(subTotal) || 0
  return sub + (sub * (Number(vatPercent) || 0)) / 100
}

export function buildSoDraftInvoiceData({ saleOrderData, specialDiscount, specialAddition, freightAndInsurance, vatPercent }) {
  const so = saleOrderData || {}
  const currencyUnit = so.currencyUnit || 'THB'
  return {
    soNumber: so.number || so.soNumber || '',
    customerName: so.customerName || '',
    customerAddress: so.customerAddress || '',
    customerTaxId: so.customerTaxId || '',
    currencyUnit,
    currencyRate: Number(so.currencyRate) || 1,
    specialDiscount: Number(specialDiscount) || 0,
    specialAddition: Number(specialAddition) || 0,
    freightAndInsurance: Number(freightAndInsurance) || 0,
    vatPercent: Number(vatPercent) || 0,
    // THB && VAT = 0 → invoice จริงจะเป็น vatIncluded (ตัวกลางเดียวกับ server) บิลร่างต้องคิดตัวเลขชุดเดียวกัน
    vatIncluded: willBeVatIncluded({ currencyUnit, currencyRate: Number(so.currencyRate) || 1, vat: vatPercent })
  }
}
