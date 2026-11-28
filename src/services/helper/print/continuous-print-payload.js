import dayjs from 'dayjs'
import { isWalkInCustomer } from '@/services/helper/pdf/certificate/certificate-data.js'
import { groupInvoiceLinesForPrint } from '@/services/utils/invoice-line-merge.js'
import { splitBillWeights } from '@/services/helper/print/bill-gem-columns.js'

import { getVatLayout } from '@/services/helper/print/vat-layout-store.js'
import { buildVatPrintModel } from '@/services/helper/print/vat-print-model-builder.js'
import { getTaxPaperConfig, defaultTaxVatPercent, defaultTaxVatMode, isTaxVatModeLocked, TAX_VAT_MODE_EXCLUDE } from '@/services/helper/print/tax-paper.js'
import { getBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { buildBillPrintModel } from '@/services/helper/print/bill-print-model-builder.js'

const BILL_FLAG_KEYS = [
  'showInvoiceNo', 'showDate', 'showPageNumber',
  'showCustomerName', 'showCustomerTaxId', 'showCustomerAddress',
  'showItemNo', 'showDescription', 'showStockNumber', 'showProductNumber',
  'showPriceBeforeDiscount', 'showPriceIncludingVat',
  'showGoldWeight', 'showStoneWeight', 'showDiamondWeight', 'showDiamondGrade',
  'showQty', 'showUnitPrice', 'showAmount', 'showRemark', 'showSoNumber',
  'showSubtotal', 'showVat', 'showTotal', 'showAmountText', 'showTotalQty',
  'unitPriceMode', 'productCodeMode', 'unitVatPercent', 'summaryVatPercent'
]

// TK202611280003: ชื่อ/ที่อยู่/เลขผู้เสียภาษีใช้จาก master ลูกค้า (tbm_customer) ก่อน ว่างค่อยใช้ snapshot ของ invoice
// มีผลกับใบเก่าตอนพิมพ์ซ้ำด้วย (พิมพ์ตามข้อมูล master ปัจจุบัน)
export function resolvePrintCustomer(invoiceData) {
  const d = invoiceData || {}
  const useMaster = !isWalkInCustomer(d.customerCode)
  const pick = (master, snapshot) => {
    const m = useMaster ? master : ''
    return m ? { value: m, source: 'master' } : { value: snapshot || '', source: 'snapshot' }
  }
  const name = pick(d.customerMasterName, d.customerName)
  const address = pick(d.customerMasterAddress, d.customerAddress)
  const taxId = pick(d.customerMasterTaxId, d.customerTaxId)
  return {
    name: name.value,
    address: address.value,
    taxId: taxId.value,
    source: { name: name.source, address: address.source, taxId: taxId.source }
  }
}

async function buildVatModel({ paperSize, invoiceData, invoiceItems, printData, invoiceNo, invoiceDate }) {
  const taxPaper = getTaxPaperConfig(paperSize)
  const layout = await getVatLayout(taxPaper.layoutKey)
  const offsetMm = printData.continuousOffset || { x: 0, y: 0 }
  const mergedLayout = layout
    ? { ...layout, offsetX: (layout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (layout.offsetY ?? 0) + (offsetMm.y || 0) }
    : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)

  const customer = resolvePrintCustomer(invoiceData)
  const vatInvoice = {
    invoiceNo,
    invoiceDate: dayjs(invoiceDate).format('YYYY-MM-DD'),
    customer: { name: customer.name, address: customer.address, taxId: customer.taxId },
    customerTaxId: customer.taxId,
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
    vatPercent: Math.min(100, Math.max(0, Number(printData.taxVatPercent ?? defaultTaxVatPercent(invoiceData)) || 0))
  }

  const vatMode = isTaxVatModeLocked(invoiceData) ? TAX_VAT_MODE_EXCLUDE : (printData.taxVatMode ?? defaultTaxVatMode(invoiceData))

  const model = buildVatPrintModel(vatInvoice, mergedLayout, { printerName: printData.printerName ?? null, showDecimals: printData.showDecimals, layoutKey: taxPaper.layoutKey, vatMode })
  const logPayload = { customer, flags: null, taxVatPercent: vatInvoice.vatPercent, taxVatMode: vatMode, billOffset: null, continuousOffset: printData.continuousOffset, printerName: printData.printerName, template: printData.invoiceTemplate, mergeSilverLines: !!printData.mergeSilverLines }

  return { model, logPayload }
}

function collectSoNumbers(invoiceData, invoiceItems) {
  const fromItems = (invoiceItems || [])
    .map(i => String(i.soNumber ?? i.so_number ?? '').trim())
    .filter(Boolean)
  const unique = [...new Set(fromItems)]
  if (unique.length > 0) return unique
  const header = String(invoiceData?.soNumber ?? '').trim()
  return header ? [header] : []
}

async function buildBillModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate }) {
  const billLayout = await getBillLayout()
  const offsetMm = printData.billOffset || { x: 0, y: 0 }
  const mergedBillLayout = billLayout
    ? { ...billLayout, offsetX: (billLayout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (billLayout.offsetY ?? 0) + (offsetMm.y || 0) }
    : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)

  const gemColumnMap = printData.gemColumnMap || {}

  const customer = resolvePrintCustomer(invoiceData)
  const billInvoice = {
    invoiceNo,
    invoiceDate: dayjs(invoiceDate).format('YYYY-MM-DD'),
    customer: { name: customer.name, address: customer.address, taxId: customer.taxId },
    customerTaxId: customer.taxId,
    soNumbers: collectSoNumbers(invoiceData, invoiceItems),
    customRemark: String(printData.customRemark || '').trim(),
    items: (invoiceItems || []).map(i => {
      const mats = Array.isArray(i.materials) ? i.materials : []
      const { goldWeight, stoneWeight, diamondWeight } = splitBillWeights(mats, gemColumnMap)
      const diamondGrade = [...new Set(
        mats.filter(m => m.type === 'Diamond').map(m => m.typeCode).filter(Boolean)
      )].join(', ')
      return {
        stockNumber: i.stockNumberOrigin || i.stockNumber || '',
        productNumber: i.productNumber || '',
        mold: i.mold || '',
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
    customer,
    unitPriceMode: printData.unitPriceMode,
    productCodeMode: printData.productCodeMode,
    customRemark: String(printData.customRemark || '').trim(),
    mergeSilverLines: !!printData.mergeSilverLines,
    gemColumnMap,
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
 * Build the print model + print-log payload for continuous paper (bill / vat-bridge / vat-bridge-v2).
 * Mirrors the inline logic previously embedded in invoice-detail index-view.vue handleConfirmPrint —
 * behaviour must stay identical (values/flags/field names).
 * @param {'bill'|'vat-bridge'|'vat-bridge-v2'} paperSize
 * @param {{ invoiceData: object, invoiceItems: Array, printData: object, invoiceNo: string, invoiceDate: (string|Date|import('dayjs').Dayjs) }} params
 * @returns {Promise<{ model: object, logPayload: object }|null>}
 */
export async function buildContinuousPrintModel(paperSize, { invoiceData, invoiceItems: rawItems, printData, invoiceNo, invoiceDate }) {
  const invoiceItems = printData?.mergeSilverLines ? groupInvoiceLinesForPrint(rawItems) : rawItems
  if (getTaxPaperConfig(paperSize)) {
    return buildVatModel({ paperSize, invoiceData, invoiceItems, printData, invoiceNo, invoiceDate })
  }
  if (paperSize === 'bill') {
    return buildBillModel({ invoiceData, invoiceItems, printData, invoiceNo, invoiceDate })
  }
  return null
}
