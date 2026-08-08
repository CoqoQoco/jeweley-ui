import dayjs from 'dayjs'

import { getVatLayout } from '@/services/helper/print/vat-layout-store.js'
import { buildVatPrintModel } from '@/services/helper/print/vat-print-model-builder.js'
import { getBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { buildBillPrintModel } from '@/services/helper/print/bill-print-model-builder.js'

const BILL_FLAG_KEYS = [
  'showInvoiceNo', 'showDate', 'showPageNumber',
  'showCustomerName', 'showCustomerTaxId', 'showCustomerAddress',
  'showItemNo', 'showDescription', 'showStockNumber', 'showProductNumber',
  'showPriceBeforeDiscount', 'showPriceIncludingVat',
  'showGoldWeight', 'showStoneWeight', 'showDiamondWeight', 'showDiamondGrade',
  'showQty', 'showUnitPrice', 'showAmount', 'showRemark',
  'showSubtotal', 'showVat', 'showTotal', 'showAmountText',
  'unitPriceMode', 'unitVatPercent', 'summaryVatPercent'
]

async function buildVatModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate }) {
  const layout = await getVatLayout()
  const offsetMm = printData.continuousOffset || { x: 0, y: 0 }
  const mergedLayout = layout
    ? { ...layout, offsetX: (layout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (layout.offsetY ?? 0) + (offsetMm.y || 0) }
    : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)

  const vatInvoice = {
    invoiceNo,
    invoiceDate: dayjs(invoiceDate).format('YYYY-MM-DD'),
    customer: {
      name: invoiceData.customerName || '',
      address: invoiceData.customerAddress || '',
      taxId: invoiceData.customerTaxId || ''
    },
    customerTaxId: invoiceData.customerTaxId || '',
    items: (invoiceItems || []).map(i => ({
      productNameEN: i.productNameEN || i.description || i.productNumber || '',
      qty: Number(i.qty) || 0,
      appraisalPrice: Number(i.appraisalPrice) || 0,
      discountPercent: Number(i.discountPercent) || 0
    })),
    currencyRate: Number(invoiceData.currencyRate) || 1,
    specialDiscount: Number(invoiceData.specialDiscount) || 0,
    specialAddition: Number(invoiceData.specialAddition) || 0,
    freightAndInsurance: Number(invoiceData.freightAndInsurance) || 0,
    vatPercent: Number(invoiceData.vatPercent) || 0
  }

  const model = buildVatPrintModel(vatInvoice, mergedLayout, { printerName: printData.printerName ?? null, showDecimals: printData.showDecimals })
  const logPayload = { flags: null, billOffset: null, continuousOffset: printData.continuousOffset, printerName: printData.printerName, template: printData.invoiceTemplate }

  return { model, logPayload }
}

async function buildBillModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate }) {
  const billLayout = await getBillLayout()
  const offsetMm = printData.billOffset || { x: 0, y: 0 }
  const mergedBillLayout = billLayout
    ? { ...billLayout, offsetX: (billLayout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (billLayout.offsetY ?? 0) + (offsetMm.y || 0) }
    : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)

  const billInvoice = {
    invoiceNo,
    invoiceDate: dayjs(invoiceDate).format('YYYY-MM-DD'),
    customer: {
      name: invoiceData.customerName || '',
      address: invoiceData.customerAddress || '',
      taxId: invoiceData.customerTaxId || ''
    },
    customerTaxId: invoiceData.customerTaxId || '',
    items: (invoiceItems || []).map(i => {
      const mats = Array.isArray(i.materials) ? i.materials : []
      const goldWeight = mats.filter(m => m.type === 'Gold').reduce((s, m) => s + (Number(m.weight) || 0), 0)
      const stoneWeight = mats.filter(m => m.type === 'Gem').reduce((s, m) => s + (Number(m.weight) || 0), 0)
      const diamondWeight = mats.filter(m => m.type === 'Diamond').reduce((s, m) => s + (Number(m.weight) || 0), 0)
      const diamondGrade = [...new Set(
        mats.filter(m => m.type === 'Diamond').map(m => m.typeCode).filter(Boolean)
      )].join(', ')
      return {
        stockNumber: i.stockNumberOrigin || i.stockNumber || '',
        productNumber: i.productNumber || '',
        productNameEN: i.productNameEN || i.description || i.productNumber || '',
        qty: Number(i.qty) || 0,
        appraisalPrice: Number(i.appraisalPrice) || 0,
        discountPercent: Number(i.discountPercent) || 0,
        goldWeight: goldWeight || null,
        stoneWeight: stoneWeight || null,
        diamondWeight: diamondWeight || null,
        diamondGrade: diamondGrade || '',
        earringStemSize: i.earringStemSize || ''
      }
    }),
    currencyRate: Number(invoiceData.currencyRate) || 1,
    specialDiscount: Number(invoiceData.specialDiscount) || 0,
    specialAddition: Number(invoiceData.specialAddition) || 0,
    freightAndInsurance: Number(invoiceData.freightAndInsurance) || 0,
    vatPercent: Number(invoiceData.vatPercent) || 0
  }

  const layoutPayload = mergedBillLayout ? { ...mergedBillLayout } : {}
  for (const key of BILL_FLAG_KEYS) {
    if (printData[key] !== undefined) layoutPayload[key] = printData[key]
  }

  const model = buildBillPrintModel(billInvoice, layoutPayload, { printerName: printData.printerName ?? null, showDecimals: printData.showDecimals })
  const logPayload = {
    unitPriceMode: printData.unitPriceMode,
    unitVatPercent: printData.unitVatPercent,
    summaryVatPercent: printData.summaryVatPercent,
    flags: Object.fromEntries(Object.entries(printData).filter(([k]) => k.startsWith('show'))),
    billOffset: printData.billOffset,
    continuousOffset: null,
    printerName: printData.printerName,
    template: printData.invoiceTemplate
  }

  return { model, logPayload }
}

/**
 * Build the print model + print-log payload for continuous paper (bill / vat-bridge).
 * Mirrors the inline logic previously embedded in invoice-detail index-view.vue handleConfirmPrint —
 * behaviour must stay identical (values/flags/field names).
 * @param {'bill'|'vat-bridge'} paperSize
 * @param {{ invoiceData: object, invoiceItems: Array, printData: object, invoiceNo: string, invoiceDate: (string|Date|import('dayjs').Dayjs) }} params
 * @returns {Promise<{ model: object, logPayload: object }|null>}
 */
export async function buildContinuousPrintModel(paperSize, { invoiceData, invoiceItems, printData, invoiceNo, invoiceDate }) {
  if (paperSize === 'vat-bridge') {
    return buildVatModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate })
  }
  if (paperSize === 'bill') {
    return buildBillModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate })
  }
  return null
}
