import { isMaterialInvoice } from '@/constants/invoice-types.js'
import { VAT_LAYOUT_KEY, VAT_V2_LAYOUT_KEY } from '@/services/helper/print/vat-layout-defaults.js'

export const TAX_PAPER = {
  'vat-bridge': {
    layoutKey: VAT_LAYOUT_KEY,
    logPaperType: 'vat',
    offsetStorageKey: 'invoice-continuous-offset',
    printerStorageKey: 'print-bridge-printer-vat',
    labelKey: 'view.sale.invoiceDetail.paperTax',
    successKey: 'view.sale.invoiceDetail.success.printVat'
  },
  'vat-bridge-v2': {
    layoutKey: VAT_V2_LAYOUT_KEY,
    logPaperType: 'vat-v2',
    offsetStorageKey: 'invoice-continuous-offset-v2',
    printerStorageKey: 'print-bridge-printer-vat-v2',
    labelKey: 'view.sale.invoiceDetail.paperTaxV2',
    successKey: 'view.sale.invoiceDetail.success.printVat'
  }
}

export function isTaxContinuousPaper(paperSize) {
  return Object.prototype.hasOwnProperty.call(TAX_PAPER, paperSize)
}

export function getTaxPaperConfig(paperSize) {
  return isTaxContinuousPaper(paperSize) ? TAX_PAPER[paperSize] : null
}

// MATERIAL (INVM): ราคาในใบถูกถอด VAT ออกจาก % ของใบเอง จึงล็อก % ภาษีให้ตรงกับใบ
export function isTaxVatPercentLocked(invoiceData) {
  return isMaterialInvoice(invoiceData)
}

export function defaultTaxVatPercent(invoiceData) {
  const saved = Number(invoiceData?.vatPercent) || 0
  if (saved !== 0) return saved
  if (isTaxVatPercentLocked(invoiceData)) return 0
  const unit = String(invoiceData?.currencyUnit || 'THB').trim().toUpperCase()
  return unit === 'THB' ? 7 : 0
}
