export const DRAFT_INVOICE_NUMBER = 'DRAFT'

export function computeInvoiceTotalExSpecial(subTotal, vatPercent) {
  const sub = Number(subTotal) || 0
  return sub + (sub * (Number(vatPercent) || 0)) / 100
}

export function buildSoDraftInvoiceData({ saleOrderData, specialDiscount, specialAddition, freightAndInsurance, vatPercent }) {
  const so = saleOrderData || {}
  return {
    soNumber: so.number || so.soNumber || '',
    customerName: so.customerName || '',
    customerAddress: so.customerAddress || '',
    customerTaxId: so.customerTaxId || '',
    currencyUnit: so.currencyUnit || 'THB',
    currencyRate: Number(so.currencyRate) || 1,
    specialDiscount: Number(specialDiscount) || 0,
    specialAddition: Number(specialAddition) || 0,
    freightAndInsurance: Number(freightAndInsurance) || 0,
    vatPercent: Number(vatPercent) || 0
  }
}
