import { round2, VAT_INCLUDED_PERCENT } from '@/services/utils/money.js'

// ต้องตรงกับ BillingTotals ใน jewelry-api BillingNoteService (แก้คู่กันเสมอ)
// ใบ vatIncluded: ยอดก่อน VAT = grandTotalRounded − vatAmount และ VAT = vatAmount ของใบนั้น (ไม่บวกซ้ำ)
// ใบอื่น: subTotal และ VAT = subTotal × vatPercent / 100

export function invoiceAmountBeforeVat(inv) {
  if (inv?.vatIncluded) return (Number(inv.grandTotalRounded) || 0) - (Number(inv.vatAmount) || 0)
  return Number(inv?.subTotal) || 0
}

export function computeBillingTotals(invoices, vatPercent) {
  const list = Array.isArray(invoices) ? invoices : []
  const included = list.filter((x) => x.vatIncluded)
  const others = list.filter((x) => !x.vatIncluded)
  const includedEx = included.reduce((s, x) => s + invoiceAmountBeforeVat(x), 0)
  const includedVat = included.reduce((s, x) => s + (Number(x.vatAmount) || 0), 0)
  const otherSub = others.reduce((s, x) => s + (Number(x.subTotal) || 0), 0)
  const otherVat = (otherSub * (Number(vatPercent) || 0)) / 100
  const subTotal = round2(includedEx + otherSub)
  const vatAmount = round2(includedVat + otherVat)
  return { subTotal, vatAmount, grandTotal: round2(subTotal + vatAmount) }
}

// เลือกแต่ใบ vatIncluded ล้วน: % VAT ของใบวางบิลไม่มีผล (VAT มาจากแต่ละใบ) — ล็อกที่ 7
export function isVatPercentLocked(invoices) {
  return Array.isArray(invoices) && invoices.length > 0 && invoices.every((x) => x.vatIncluded)
}

export function effectiveBillingVatPercent(invoices, formVatPercent) {
  return isVatPercentLocked(invoices) ? VAT_INCLUDED_PERCENT : Number(formVatPercent) || 0
}

// แปลง items ของ BillingNote/Get เป็นรูปเดียวกับ AvailableInvoices เพื่อให้โหมดแก้ไขคิดยอดผ่าน computeBillingTotals เหมือน Update ของ server
export function mapBillingNoteItems(data) {
  return (data?.items || []).map((it) => ({
    invoiceRunning: it.invoiceRunning,
    invoiceDate: it.invoiceDate,
    subTotal: it.amountBeforeVat,
    vatIncluded: !!it.vatIncluded,
    vatAmount: it.vatAmount,
    grandTotalRounded: it.grandTotalRounded,
    customerName: data.customerName
  }))
}
